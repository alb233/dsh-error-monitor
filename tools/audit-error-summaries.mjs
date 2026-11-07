/**
 * Offline audit of how the 会话报错 plugin renders each failure it recorded.
 *
 * Why this exists: a summary can only be judged by looking at it, and asking the
 * user to press 发回对话 for every new kind of failure is unacceptable. This script
 * replays a session log through the same folding rules the plugin uses and prints
 * exactly what the card and the outgoing prompt would say — no tokens, no clicks.
 *
 * It mirrors `describeError` / `foldErrors` in
 * `.dsh-created-plugins/ad2ab3ad-8a5c-4e88-a7bf-ee0bb5b23776/client.js`.
 * When that plugin's extraction changes, change this file in the same commit.
 *
 * Usage:
 *   node tools/audit-error-summaries.mjs            # newest session of this workspace
 *   node tools/audit-error-summaries.mjs --all      # every session found
 *   node tools/audit-error-summaries.mjs --file <session.v4.jsonl.zstd>
 *   node tools/audit-error-summaries.mjs --children # subagent sessions of that session
 *   node tools/audit-error-summaries.mjs --children --file <parent session.v4.jsonl.zstd>
 *   node tools/audit-error-summaries.mjs --self-test  # replay the fixtures, no log needed
 *
 * `--children` takes the newest session as the parent unless `--file` names one;
 * `--all` is ignored in that mode. A parent that never delegated prints
 * `(no subagent session recorded for this session)`.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import zlib from 'node:zlib';
import { CASES } from './audit-error-summaries.fixtures.mjs';

const SESSIONS_ROOT = path.join(os.homedir(), '.dsh', 'sessions');

/* ---------------------------------------------------------- plugin mirror */

const isRecord = (value) => typeof value === 'object' && value !== null;

function codeOf(raw) {
  if (!isRecord(raw)) return null;
  for (const candidate of [raw.code, raw.status, raw.type]) {
    if (typeof candidate === 'string' && candidate !== '') return candidate;
    if (typeof candidate === 'number') return String(candidate);
  }
  return null;
}

function messageOf(raw) {
  if (typeof raw === 'string') return raw;
  if (!isRecord(raw)) return raw === undefined || raw === null ? '' : String(raw);
  const parts = [];
  if (typeof raw.message === 'string' && raw.message !== '') parts.push(raw.message);
  else if (typeof raw.detail === 'string' && raw.detail !== '') parts.push(raw.detail);
  else if (typeof raw.reason === 'string' && raw.reason !== '') parts.push(raw.reason);
  if (typeof raw.reason === 'string' && raw.reason !== '' && parts[0] !== raw.reason) parts.push(raw.reason);
  if (typeof raw.code === 'string' && raw.code !== '') parts.push('[' + raw.code + ']');
  return parts.length === 0 ? JSON.stringify(raw) : parts.join(' ');
}

/**
 * A turn error often arrives as `400: {"message":"…","param":"","code":null}`:
 * a gateway envelope wrapped in a string. Parse it so the card reads like a
 * sentence; the untouched envelope stays in the raw detail.
 */
function turnDetail(raw) {
  const fallback = messageOf(raw);
  if (!isRecord(raw) || typeof raw.message !== 'string') return fallback;
  const match = /^(\d{3}):\s*(\{[\s\S]*\})$/.exec(raw.message.trim());
  if (match === null) return fallback;
  let inner;
  try {
    inner = JSON.parse(match[2]);
  } catch {
    return fallback;
  }
  if (!isRecord(inner) || typeof inner.message !== 'string' || inner.message === '') return fallback;
  const status = match[1];
  const param = typeof inner.param === 'string' && inner.param !== '' ? ' param: ' + inner.param : '';
  return inner.message + ' (' + status + ')' + param;
}

function stripMarkup(text) {
  if (typeof text !== 'string' || text === '') return '';
  let out = text;
  if (/<[a-z!/][^>]*>/i.test(out)) {
    out = out.replace(/<script[\s\S]*?<\/script>/gi, ' ');
    out = out.replace(/<style[\s\S]*?<\/style>/gi, ' ');
    out = out.replace(/<!--[\s\S]*?-->/g, ' ');
    out = out.replace(/<[^>]+>/g, ' ');
  }
  return out
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function resultText(data) {
  const message = isRecord(data) ? data.message : undefined;
  const content = isRecord(message) ? message.content : undefined;
  if (!Array.isArray(content)) return '';
  for (const block of content) {
    if (isRecord(block) && block.type === 'text' && typeof block.text === 'string' && block.text.trim() !== '') {
      return block.text.trim().replace(/^Error:\s*/i, '');
    }
  }
  return '';
}

const TOOL_HINTS = ['[sandbox: escalation available', 'retry this exact operation once', 'sandbox_permissions'];

function stripToolHints(text) {
  if (typeof text !== 'string' || text === '') return '';
  let out = text;
  for (const marker of TOOL_HINTS) {
    const at = out.indexOf(marker);
    if (at !== -1) out = out.slice(0, at);
  }
  return out.trim().replace(/[\s\-–—(]+$/, '').trim();
}

function contentText(content) {
  if (!Array.isArray(content)) return '';
  for (const block of content) {
    if (isRecord(block) && block.type === 'text' && typeof block.text === 'string' && block.text.trim() !== '') {
      return block.text.trim();
    }
  }
  return '';
}

/**
 * A subagent settles into the parent as a `user/message` notice, not an error
 * event. Its only status is the wording: a clean finish says the child
 * "finished and will do no further work", anything else ended abnormally.
 */
function subagentNotice(data) {
  if (!isRecord(data)) return null;
  const source = isRecord(data.source) ? data.source : null;
  if (source === null || source.kind !== 'subagent-settled') return null;
  const text = contentText(data.content);
  if (text === '') return null;
  // The child's own closing words follow this marker; they stay in the raw
  // record, never on the card.
  const head = text.split('Its closing message:')[0].trim();
  if (head === '' || /finished and will do no further work/i.test(head)) return null;
  return {
    child: typeof source.senderSessionId === 'string' ? source.senderSessionId : null,
    text: head,
  };
}

function argumentPath(argumentsText) {
  if (typeof argumentsText !== 'string' || argumentsText === '') return null;
  let parsed;
  try {
    parsed = JSON.parse(argumentsText);
  } catch {
    return null;
  }
  if (!isRecord(parsed)) return null;
  for (const key of ['path', 'file_path', 'filePath', 'notebook_path', 'target_file', 'file']) {
    const value = parsed[key];
    if (typeof value === 'string' && value !== '') return value;
  }
  return null;
}

function formatTokens(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return '';
  if (value < 1000) return String(value);
  const thousands = value / 1000;
  const shown = thousands >= 100 ? Math.round(thousands) : Math.round(thousands * 10) / 10;
  return String(shown) + 'K';
}

function formatCount(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '0';
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function describeError(record) {
  const bits = [];
  if (typeof record.tool === 'string' && record.tool !== '') bits.push(record.tool);
  if (typeof record.path === 'string' && record.path !== '') bits.push(record.path);
  if (typeof record.child === 'string' && record.child !== '') bits.push('subagent ' + record.child.slice(0, 8));
  const head = bits.join(' · ');
  const code = typeof record.code === 'string' && record.code !== '' ? record.code : null;
  const detail = stripMarkup(typeof record.detail === 'string' ? record.detail : '');
  const tail = detail !== '' ? detail : code === null ? 'error' : '[' + code + ']';
  const shown = head === '' ? tail : head + ' — ' + tail;
  return shown.length <= 300 ? shown : shown.slice(0, 300) + '…';
}

function foldErrors(events) {
  const records = [];
  const calls = new Map();
  for (const event of events) {
    if (event.type !== 'tool/call') continue;
    const data = isRecord(event.data) ? event.data : {};
    if (typeof data.callId !== 'string') continue;
    calls.set(data.callId, { name: typeof data.name === 'string' ? data.name : null, path: argumentPath(data.arguments) });
  }

  // A turn error is often a provider rejecting the request before it emits
  // anything; the last completed request's usage is the closest size clue the
  // window holds, so it rides along on that card.
  let lastUsage = null;

  for (const event of events) {
    const data = isRecord(event.data) ? event.data : {};
    const seq = Number(event.seq);
    const turn = typeof data.turn === 'number' ? data.turn : null;

    if (event.type === 'assistant/message') {
      const usage = isRecord(data.usage) ? data.usage : null;
      if (usage !== null && typeof usage.inputTokens === 'number') {
        lastUsage = {
          input: usage.inputTokens,
          cache: typeof usage.cacheReadTokens === 'number' ? usage.cacheReadTokens : 0,
          output: typeof usage.outputTokens === 'number' ? usage.outputTokens : 0,
          seq,
        };
      }
      continue;
    }

    if (event.type === 'turn/end') {
      const reason = data.reason;
      if (!isRecord(reason) || reason.kind !== 'error') continue;
      const raw = reason.error;
      const record = {
        source: 'turn',
        seq,
        turn,
        tool: null,
        path: null,
        step: typeof data.step === 'number' ? data.step : null,
        code: codeOf(raw),
        usage: lastUsage,
        detail: turnDetail(raw),
      };
      record.message = describeError(record);
      records.push(record);
      continue;
    }

    if (event.type === 'tool/result') {
      const error = data.error;
      if (!isRecord(error)) continue;
      const message = isRecord(data.message) ? data.message : undefined;
      const source = isRecord(message) && isRecord(message.source) ? message.source : undefined;
      const callId =
        typeof data.callId === 'string'
          ? data.callId
          : typeof message?.toolCallId === 'string'
            ? message.toolCallId
            : typeof source?.callId === 'string'
              ? source.callId
              : null;
      const call = callId !== null ? calls.get(callId) : undefined;
      const tool = call ? call.name : null;
      const target = call ? call.path : null;
      const explicit = typeof error.reason === 'string' && error.reason !== '' ? error.reason : '';
      const record = {
        source: 'tool',
        seq,
        turn,
        step: typeof data.step === 'number' ? data.step : null,
        tool,
        path: target,
        code: codeOf(error),
        detail: stripToolHints(explicit !== '' ? explicit : resultText(data)),
      };
      record.message = describeError(record);
      records.push(record);
      continue;
    }

    if (event.type === 'user/message') {
      const notice = subagentNotice(data);
      if (notice !== null) {
        const record = {
          source: 'subagent',
          seq,
          turn: null,
          tool: null,
          path: null,
          step: null,
          child: notice.child,
          code: null,
          detail: notice.text,
        };
        record.message = describeError(record);
        records.push(record);
      }
      continue;
    }

    if (event.type === 'command/done' && data.kind === 'error') {
      const record = {
        source: 'command',
        seq,
        turn: null,
        tool: typeof data.name === 'string' && data.name !== '' ? data.name : null,
        path: null,
        step: null,
        code: null,
        detail: typeof data.text === 'string' && data.text !== '' ? data.text : messageOf(data),
      };
      record.message = describeError(record);
      records.push(record);
    }
  }
  return records.sort((left, right) => right.seq - left.seq);
}

/**
 * Failures that repeat verbatim are one problem, not many. The card keeps the
 * newest copy and counts the rest; the offline audit must group the same way or
 * it would report a list the panel never renders.
 */
function groupKey(record) {
  return [
    record.source,
    record.code === null ? '' : String(record.code),
    record.tool === null ? '' : String(record.tool),
    record.path === null ? '' : String(record.path),
    record.message,
  ].join('\u0001');
}

function groupRecords(records) {
  const groups = new Map();
  const grouped = [];
  for (const record of records) {
    const key = groupKey(record);
    const existing = groups.get(key);
    if (existing === undefined) {
      const copy = Object.assign({}, record, { count: 1, seqs: [record.seq], firstTime: record.time });
      groups.set(key, copy);
      grouped.push(copy);
      continue;
    }
    existing.count += 1;
    existing.seqs.push(record.seq);
    if (record.time !== undefined) existing.firstTime = record.time;
  }
  return grouped;
}

/* ------------------------------------------------------------------ driver */

function readHeader(file) {
  const text = zlib.zstdDecompressSync(fs.readFileSync(file)).toString('utf8');
  const first = text.split('\n').find((line) => line.trim());
  if (first === undefined) return undefined;
  const record = JSON.parse(first);
  // The first line is the header itself on this format; older shapes nest it.
  return record.session ?? record;
}

function findLogs() {
  const found = [];
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      let stat;
      try {
        stat = fs.statSync(full);
      } catch {
        continue;
      }
      if (stat.isDirectory()) walk(full);
      else if (name.endsWith('.jsonl.zstd')) found.push({ file: full, mtime: stat.mtimeMs });
    }
  };
  if (fs.existsSync(SESSIONS_ROOT)) walk(SESSIONS_ROOT);
  return found.sort((left, right) => right.mtime - left.mtime);
}

function readEvents(file) {
  const text = zlib.zstdDecompressSync(fs.readFileSync(file)).toString('utf8');
  const events = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    let parsed;
    try {
      parsed = JSON.parse(line);
    } catch {
      continue;
    }
    events.push(parsed.event ?? parsed);
  }
  return events;
}

function summarize(records) {
  const bySource = new Map();
  for (const record of records) bySource.set(record.source, (bySource.get(record.source) ?? 0) + 1);
  const codes = new Map();
  for (const record of records) {
    const key = record.source + ':' + (record.code ?? '(none)');
    codes.set(key, (codes.get(key) ?? 0) + 1);
  }
  return { bySource: Object.fromEntries(bySource), byCode: Object.fromEntries(codes) };
}

function audit(file) {
  const records = foldErrors(readEvents(file));
  const groups = groupRecords(records);
  const { bySource, byCode } = summarize(records);
  console.log('session:', file);
  console.log('records:', records.length, '| groups:', groups.length, '| by source:', JSON.stringify(bySource));
  console.log('by code:', JSON.stringify(byCode));
  console.log('');
  for (const record of groups.slice(0, 20)) {
    const repeat = record.count > 1 ? ' | ×' + record.count + ' seqs ' + record.seqs.join(',') : '';
    console.log('· seq', record.seq, repeat, '| turn', record.turn, '| step', record.step, '| code', record.code);
    console.log('  card/prompt:', record.message);
    if (record.usage !== undefined && record.usage !== null) {
      const total = record.usage.input + record.usage.cache;
      console.log(
        '  scale: ≈' + formatTokens(total) + ' tokens (input ' + formatCount(record.usage.input) + ' · cache ' + formatCount(record.usage.cache) + ')',
      );
    }
  }
}

/**
 * A subagent is its own Session: the header names its parent and marks the origin.
 * The Host's session list hides them, so they are found by reading headers here.
 */
function childrenOf(parentFile) {
  const parent = readHeader(parentFile);
  if (parent === undefined || typeof parent.id !== 'string') return [];
  const children = [];
  for (const log of findLogs()) {
    let header;
    try {
      header = readHeader(log.file);
    } catch {
      continue;
    }
    if (header === undefined || header.origin !== 'subagent') continue;
    if (header.parentSession !== parent.id) continue;
    children.push({ file: log.file, header, mtime: log.mtime });
  }
  return children.sort((left, right) => right.mtime - left.mtime);
}

function auditChildren(parentFile) {
  const parent = readHeader(parentFile);
  const children = childrenOf(parentFile);
  console.log('parent session:', parent === undefined ? '(unknown)' : parent.id);
  console.log('subagent sessions:', children.length);
  if (children.length === 0) {
    console.log('(no subagent session recorded for this session)');
    return;
  }
  let total = 0;
  for (const child of children) {
    const records = foldErrors(readEvents(child.file));
    total += records.length;
    const { bySource, byCode } = summarize(records);
    const depth = typeof child.header.delegationDepth === 'number' ? child.header.delegationDepth : '?';
    console.log('');
    console.log('· subagent', String(child.header.id).slice(0, 8), '| depth', depth, '| records', records.length);
    if (records.length > 0) {
      console.log('  by source:', JSON.stringify(bySource));
      console.log('  by code:', JSON.stringify(byCode));
      for (const record of records.slice(0, 5)) {
        console.log('    seq', record.seq, '| code', record.code, '→', record.message);
      }
    }
  }
  console.log('');
  console.log('total failures in subagent sessions:', total);
}

function runSelfTest() {
  let failed = 0;
  for (const testCase of CASES) {
    const records = foldErrors(testCase.events);
    const problems = [];
    if (records.length !== testCase.expect.length) {
      problems.push('records: expected ' + testCase.expect.length + ', got ' + records.length);
    }
    testCase.expect.forEach((want, index) => {
      const got = records[index];
      if (got === undefined) return;
      for (const key of ['source', 'code', 'message']) {
        if (got[key] !== want[key]) {
          problems.push('#' + index + ' ' + key + ': expected ' + JSON.stringify(want[key]) + ', got ' + JSON.stringify(got[key]));
        }
      }
      if (want.usage !== undefined) {
        const usage = got.usage === undefined || got.usage === null ? {} : got.usage;
        if (usage.input !== want.usage.input || usage.cache !== want.usage.cache) {
          problems.push(
            '#' + index + ' usage: expected ' + JSON.stringify(want.usage) + ', got ' + JSON.stringify({ input: usage.input, cache: usage.cache }),
          );
        }
      }
    });
    if (testCase.expectGroups !== undefined) {
      const groups = groupRecords(records);
      if (groups.length !== testCase.expectGroups.length) {
        problems.push('groups: expected ' + testCase.expectGroups.length + ', got ' + groups.length);
      }
      testCase.expectGroups.forEach((want, index) => {
        const got = groups[index];
        if (got === undefined) return;
        if (got.count !== want.count) {
          problems.push('group #' + index + ' count: expected ' + want.count + ', got ' + got.count);
        }
        if (want.seqs !== undefined && got.seqs.join(',') !== want.seqs.join(',')) {
          problems.push(
            'group #' + index + ' seqs: expected ' + want.seqs.join(',') + ', got ' + got.seqs.join(','),
          );
        }
      });
    }
    if (problems.length === 0) {
      console.log('PASS', testCase.name);
    } else {
      failed++;
      console.log('FAIL', testCase.name);
      for (const problem of problems) console.log('  -', problem);
    }
  }
  console.log('');
  console.log(failed === 0 ? 'self-test: ' + CASES.length + ' case(s) passed' : 'self-test: ' + failed + ' case(s) failed');
  process.exit(failed === 0 ? 0 : 1);
}

const args = process.argv.slice(2);
if (args.includes('--self-test')) {
  runSelfTest();
}
const fileIndex = args.indexOf('--file');
const explicit = fileIndex >= 0 && args[fileIndex + 1] ? args[fileIndex + 1] : undefined;
const logs = findLogs();
const newest = explicit ?? (logs.length === 0 ? undefined : logs[0].file);

if (newest === undefined) {
  console.log('no session logs under', SESSIONS_ROOT);
  process.exit(0);
}

if (args.includes('--children')) {
  auditChildren(newest);
} else if (args.includes('--all')) {
  for (const target of logs) audit(target.file);
} else {
  audit(newest);
}
