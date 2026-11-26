// Guards the repair handshake: the marker the agent is told to write, and the
// scan that turns it into a resolved mark. The scan is lifted out of the bundle
// and run against synthetic events, so a regex change that stops matching the
// prompt's exact wording fails here rather than quietly never closing the loop.
//
// Child generations restart their sequence numbers at 1, so a bare "seq=12" must
// only touch the parent, and a child's marker must name that child.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const clientPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'client.js');
const src = fs.readFileSync(clientPath, 'utf8');

const start = src.indexOf('const FIXED_MARKER');
if (start < 0) throw new Error('FIXED_MARKER not found in client.js');
const endMarker = 'return { parent, children };\n    }';
const end = src.indexOf(endMarker, start);
if (end < 0) throw new Error('fixedSeqsIn body not found');
const body = src.slice(start, end + endMarker.length);

const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const durableEvent = (entry) =>
  isRecord(entry) && isRecord(entry.event) && (entry.type === 'event' || entry.type === 'durable')
    ? entry.event
    : undefined;

const { fixedSeqsIn, FIXED_MARKER } = new Function(
  'isRecord',
  'durableEvent',
  body + '\nreturn { fixedSeqsIn, FIXED_MARKER };',
)(isRecord, durableEvent);

const message = (seq, parts) => ({
  type: 'event',
  event: { type: 'assistant/message', seq, time: 1, data: { message: { role: 'assistant', content: parts } } },
});
const text = (body) => ({ type: 'text', text: body });
const reasoning = (body) => ({ type: 'reasoning', text: body });

const parents = (result) => [...result.parent].sort((a, b) => a - b);
const children = (result) =>
  Object.fromEntries([...result.children].map(([id, set]) => [id, [...set].sort((a, b) => a - b)]));

const cases = [
  ['single marker in the final answer', [message(9, [text('修好了。\nERROR-MONITOR-FIXED seq=123')])], [123], {}],
  ['marker inside a code fence', [message(9, [text('```\nERROR-MONITOR-FIXED seq=44\n```')])], [44], {}],
  ['several markers in one reply', [message(9, [text('ERROR-MONITOR-FIXED seq=7\nERROR-MONITOR-FIXED seq=8')])], [7, 8], {}],
  [
    'child marker goes into its own bucket, parent untouched',
    [message(9, [text('ERROR-MONITOR-FIXED seq=12 child=agent-3')])],
    [],
    { 'agent-3': [12] },
  ],
  [
    'same seq for parent and child stay apart',
    [message(9, [text('ERROR-MONITOR-FIXED seq=12\nERROR-MONITOR-FIXED seq=12 child=ab')])],
    [12],
    { ab: [12] },
  ],
  ['reasoning text alone must not count', [message(9, [reasoning('ERROR-MONITOR-FIXED seq=5')])], [], {}],
  ['prose without the marker', [message(9, [text('已修好，重跑成功。')])], [], {}],
  ['malformed marker (no seq)', [message(9, [text('ERROR-MONITOR-FIXED ok')])], [], {}],
  ['tool-call parts are ignored', [message(9, [{ type: 'tool-call', id: 'c', name: 'pwsh', arguments: '{}' }])], [], {}],
];

let failed = 0;
for (const [name, entries, wantParent, wantChildren] of cases) {
  const result = fixedSeqsIn(entries);
  const gotParent = parents(result);
  const gotChildren = children(result);
  const ok =
    JSON.stringify(gotParent) === JSON.stringify(wantParent) &&
    JSON.stringify(gotChildren) === JSON.stringify(Object.fromEntries(Object.entries(wantChildren).sort()));
  if (!ok) failed += 1;
  console.log(
    (ok ? 'PASS' : 'FAIL') +
      '  ' +
      name +
      '  -> parent [' +
      gotParent.join(', ') +
      '] children ' +
      JSON.stringify(gotChildren),
  );
}

// The prompt must not hard-code a bare seq: the card fills {marker} in, and that
// marker carries child=<id> for child cards. A prompt that spells the marker out
// itself would silently tick off the wrong parent card.
const checks = [
  [
    'send.fix templates use {marker}',
    (src.match(/\{marker\} \(verbatim\)/g) || []).length + (src.match(/\{marker\}（原样照抄）/g) || []).length === 2,
  ],
  ['no template hard-codes a bare seq marker', !src.includes('ERROR-MONITOR-FIXED seq={seq}')],
  ['marker is built from the record seq', src.includes("'ERROR-MONITOR-FIXED seq=' + String(record.seq)")],
  ['child cards append child=<id>', src.includes("' child=' + childId")],
  ['verify step is per-origin', src.includes("verifyStep: childId === '' ? t('send.verifyParent') : t('send.verifyChild')")],
  ['child prompt tells the agent the session ended', src.includes('which has already ended') || src.includes('已经结束的子智能体会话')],
];
for (const [name, ok] of checks) {
  if (!ok) failed += 1;
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name);
}

console.log(failed === 0 ? '\nall ' + (cases.length + checks.length) + ' cases pass' : '\n' + failed + ' failing');
process.exit(failed === 0 ? 0 : 1);