/**
 * Guards the main-session triage layer, where a quiet regression is invisible:
 *
 *   1. a loop that keeps changing its arguments is still caught (tool + cause);
 *   2. such a group is never folded as self-heal;
 *   3. the card says so, instead of only the "×N" of identical text;
 *   4. a verified rerun closes the loop as well as a full repair does;
 *   5. an automatic tick-off is announced instead of a card just vanishing;
 *   6. the advice for an unknown cause names a button that exists.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, '..', 'client.js'), 'utf8');

const cases = [];
const check = (name, ok, detail) => cases.push({ name, ok: ok === true, detail });

check(
  'a thrashing loop is counted by tool + cause, not by identical text',
  source.includes('const THRASH_MIN_COUNT = 3;') &&
    /function thrashKeyOf\(group\)[\s\S]{0,400}?tool \+ String\.fromCharCode\(0\) \+ cause/.test(source) &&
    source.includes('counts.set(key, (counts.get(key) ?? 0) + 1);'),
  'thrashCounts keys on tool+cause',
);

check(
  'a thrashing group is pulled out of the self-heal fold',
  /group\.count < LOOP_MIN_COUNT &&\s+thrashOf\(group\) < THRASH_MIN_COUNT/.test(source),
  'isNoteGroup requires the thrash count to be low',
);

check(
  'the card explains the repeated tool+cause',
  source.includes("t('item.thrashHint', { n: String(thrashCount) })") &&
    source.includes('thrashCount: thrashOf(record),') &&
    source.includes("'item.thrashHint'"),
  'hint wired to the card',
);

check(
  'the repair handshake asks for a verified marker',
  source.includes('The monitor reads that line to tick this card off') &&
    source.includes('监控插件读这一行把卡片标为已解决'),
  'send.fix carries the marker handshake',
);

check(
  'automatic tick-off is announced in the unified notice bar',
  source.includes("const noticeKey = attentionNew > 0 ? 'new' : autoTicked > 0 ? 'auto' : ruleLearned !== '' ? 'rule' : '';") &&
    source.includes("noticeKey === 'auto'") &&
    source.includes("t('banner.autoResolved', { n: String(autoTicked) })") &&
    source.includes("className: 'emx-banner' + (noticeKey === 'new' ? '' : ' emx-bannerQuiet')"),
  'auto-resolved notification is shown in the single banner, no silent disappearance',
);

check(
  'the advice for an unknown cause names a real control',
  !source.includes('「发回对话」') && !source.includes('Send to chat'),
  'no stale button names',
);

check(
  'repair commands follow the failure, not the host',
  source.includes("const platform = windowsPath || (!unixPath && !unixText) ? 'ps' : 'posix';") &&
    source.includes("const table = values.platform === 'posix' ? FIX_COMMANDS_POSIX : FIX_COMMANDS;"),
  'posix failures get posix commands',
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