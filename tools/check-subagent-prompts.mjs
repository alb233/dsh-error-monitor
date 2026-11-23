/**
 * Static guards for the subagent paths. Each check pins a behaviour that would
 * silently regress to "read the wrong transcript" or "hide a dead child":
 *
 *   1. every send.* prompt carries {childNote};
 *   2. the child note tells the agent to read session_id=<childId>;
 *   3. sendPrompt swaps the session id for a child record;
 *   4. a settled subagent failure is never folded as self-heal;
 *   5. the sidebar badge counts it;
 *   6. children are capped, reported, and polled (workflow children never notify).
 *
 * Reads client.js as text, so it fails on the bundle the user actually loads.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, '..', 'client.js'), 'utf8');

const cases = [];
const check = (name, ok, detail) => cases.push({ name, ok: ok === true, detail });

const count = (needle) => source.split(needle).length - 1;

check(
  'all four send.* prompts carry the child note (en + zh)',
  count('Session id: {sessionId}{childNote}') === 4 && count('会话 ID：{sessionId}{childNote}') === 4,
  `en=${count('Session id: {sessionId}{childNote}')} zh=${count('会话 ID：{sessionId}{childNote}')}`,
);

check(
  'the child note points at session_id={id}',
  count("'send.childNote'") === 3 &&
    source.includes('read it with session_id={id}, not the parent session id') &&
    source.includes('读取时要用 session_id={id}，不要用父会话 ID'),
  "both languages carry session_id={id}",
);

check(
  'sendPrompt hands the child id to the prompt',
  source.includes('const childId = record.fromChild && typeof record.childId === \'string\' ? record.childId : \'\';') &&
    source.includes("sessionId: childId === '' ? sessionRef : childId,") &&
    source.includes("childNote: childId === '' ? '' : t('send.childNote', { id: childId }),"),
  'child cards read the child transcript',
);

check(
  'a settled subagent failure is not folded',
  /group\.source !== 'turn' &&\n\s+group\.source !== 'subagent' &&\n\s+group\.count < LOOP_MIN_COUNT/.test(source),
  'isNoteGroup excludes source=subagent',
);

check(
  'the sidebar badge counts a settled subagent failure',
  source.includes("if (item.source === 'turn' || item.source === 'subagent' || repeated) {"),
  'badgeScan treats source=subagent as attention',
);

check(
  'children are capped and the overflow is surfaced',
  source.includes('const CHILD_CAP = 25;') &&
    source.includes('overflow: Math.max(0, found.length - CHILD_CAP)') &&
    source.includes("t('panel.childOverflow', { n: String(childOverflow), max: String(CHILD_CAP) })") &&
    count("'panel.childOverflow'") === 3,
  'cap 25 + visible overflow line',
);

check(
  'children are re-read on a timer, not only on a parent topSeq change',
  source.includes('const CHILD_TTL_MS = 20000;') &&
    /age < CHILD_TTL_MS/.test(source) &&
    /setInterval\(\(\) => setChildTick\(\(value\) => value \+ 1\), CHILD_TTL_MS\)/.test(source) &&
    source.includes('[childIdsKey, topSeq, records.length, childTick]'),
  'workflow children advance without parent events',
);

check(
  'a settled notice points at the child cards below',
  source.includes("t('item.childHint', { n: String(childFailures) })") &&
    source.includes('childFailures: childFailuresOf(record),') &&
    count("'item.childHint'") === 3,
  'the notice card names the fold',
);

check(
  'child unread marks live in their own sequence space',
  source.includes("const SEEN_CHILD_PREFIX = PACKAGE + '.seenChild.';") &&
    source.includes('const mark = seenChildren[record.childId];') &&
    source.includes('record.seq > mark') &&
    source.includes('freshRecord'),
  'the parent watermark never judges a child seq',
);

check(
  'a child marker carries child=<id> and is ticked in its own bucket',
  source.includes("' child=' + childId") &&
    source.includes('fixedSeqs.children.get(childId)') &&
    /FIXED_MARKER = \/ERROR-MONITOR-FIXED\\s\+seq=\(\\d\+\)\(\?:\\s\+child=/.test(source),
  'seq=12 alone must not resolve a parent card',
);

check(
  'a child card is verified differently from a live call',
  source.includes("verifyStep: childId === '' ? t('send.verifyParent') : t('send.verifyChild')") &&
    count("'send.verifyChild'") === 3,
  'the prompt no longer asks to rerun a finished child session',
);

check(
  'children are read in batches, not all at once',
  source.includes('const CHILD_BATCH = 5;') &&
    source.includes('const added = ids.filter((id) => previous.indexOf(id) === -1);') &&
    source.includes('batch = added.slice(0, CHILD_BATCH);') &&
    /batch\.push\(ids\[\(start \+ k\) % ids\.length\]\)/.test(source),
  '25 children are not 25 round trips per pass',
);

let failed = 0;
for (const item of cases) {
  console.log(`${item.ok ? 'PASS' : 'FAIL'}  ${item.name}${item.ok ? '' : `  (${item.detail})`}`);
  if (!item.ok) failed += 1;
}
if (failed === 0) console.log(`all ${cases.length} cases pass`);
else {
  console.error(`${failed} of ${cases.length} cases failed`);
  process.exitCode = 1;
}