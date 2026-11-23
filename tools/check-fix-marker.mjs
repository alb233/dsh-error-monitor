// Guards the repair handshake: the marker the agent is told to write, and the
// scan that turns it into a resolved mark. The scan is lifted out of the bundle
// and run against synthetic events, so a regex change that stops matching the
// prompt's exact wording fails here rather than quietly never closing the loop.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const clientPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'client.js');
const src = fs.readFileSync(clientPath, 'utf8');

const start = src.indexOf('const FIXED_MARKER');
if (start < 0) throw new Error('FIXED_MARKER not found in client.js');
const endMarker = 'return seqs;\n    }';
const end = src.indexOf(endMarker, start);
if (end < 0) throw new Error('fixedSeqsIn body not found');
const body = src.slice(start, end + 'return seqs;\n    }'.length);

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

const cases = [
  ['single marker in the final answer', [message(9, [text('修好了。\nERROR-MONITOR-FIXED seq=123')])], [123]],
  ['marker inside a code fence', [message(9, [text('```\nERROR-MONITOR-FIXED seq=44\n```')])], [44]],
  ['several markers in one reply', [message(9, [text('ERROR-MONITOR-FIXED seq=7\nERROR-MONITOR-FIXED seq=8')])], [7, 8]],
  ['reasoning text alone must not count', [message(9, [reasoning('ERROR-MONITOR-FIXED seq=5')])], []],
  ['prose without the marker', [message(9, [text('已修好，重跑成功。')])], []],
  ['malformed marker (no seq)', [message(9, [text('ERROR-MONITOR-FIXED ok')])], []],
  ['tool-call parts are ignored', [message(9, [{ type: 'tool-call', id: 'c', name: 'pwsh', arguments: '{}' }])], []],
];

let failed = 0;
for (const [name, entries, want] of cases) {
  const got = [...fixedSeqsIn(entries)].sort((a, b) => a - b);
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed += 1;
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + '  -> [' + got.join(', ') + ']');
}

// The prompt must carry the exact string the scan looks for; a prompt edit that
// changes the wording without changing the regex would break the loop silently.
const zhPrompt = src.includes('ERROR-MONITOR-FIXED seq={seq}');
if (!zhPrompt) {
  failed += 1;
  console.log('FAIL  send.fix prompt no longer contains ERROR-MONITOR-FIXED seq={seq}');
} else {
  console.log('PASS  send.fix prompt carries the marker');
}

console.log(failed === 0 ? '\nall ' + (cases.length + 1) + ' cases pass' : '\n' + failed + ' failing');
process.exit(failed === 0 ? 0 : 1);