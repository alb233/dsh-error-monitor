/**
 * The dictionaries and the cause table live inside the client bundle, so nothing
 * type-checks them. translator() falls back to English when a key is missing, which
 * means a forgotten translation looks fine at build time and shows up as one English
 * sentence in a Chinese panel — the kind of slip nobody notices until a user does.
 *
 * This script reads the two dictionaries and the cause table out of client.js and
 * checks the things that actually break:
 *
 *   1. a key present in one language and missing in the other
 *   2. a placeholder such as {n} that survives in one language and not the other
 *   3. a cause with no advice, or advice pointing at a key that does not exist
 *   4. a `cause.*` / `next.*` key nobody references (dead wording)
 *
 * Run: node tools/check-locale-keys.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(here, '..', 'client.js');
const src = fs.readFileSync(file, 'utf8');

/** Slice the balanced object/array that starts at `openMarker`. */
function objectBody(text, openMarker, open = '{', close = '}') {
  const at = text.indexOf(openMarker);
  if (at === -1) throw new Error('marker not found: ' + openMarker);
  let i = at + openMarker.length;
  while (i < text.length && /[\s=]/.test(text[i])) i += 1;
  if (text[i] !== open) i = text.lastIndexOf(open, at + openMarker.length);
  if (i === -1) throw new Error('no ' + open + ' after marker: ' + openMarker);
  const start = i;
  let depth = 0;
  let quote = null;
  for (; i < text.length; i += 1) {
    const ch = text[i];
    if (quote !== null) {
      if (ch === '\\') i += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === open) depth += 1;
    else if (ch === close) {
      depth -= 1;
      if (depth === 0) return text.slice(start + 1, i);
    }
  }
  throw new Error('unbalanced ' + open + close + ' after marker: ' + openMarker);
}

/** Every `'key':` at the start of a line, with the text that follows it. */
function entries(body) {
  const out = new Map();
  const re = /^[ \t]*'([^']+)':[ \t]*/gm;
  const marks = [];
  let m;
  while ((m = re.exec(body)) !== null) marks.push({ key: m[1], start: m.index, end: re.lastIndex });
  for (let i = 0; i < marks.length; i += 1) {
    const stop = i + 1 < marks.length ? marks[i + 1].start : body.length;
    out.set(marks[i].key, body.slice(marks[i].end, stop));
  }
  return out;
}

function placeholders(text) {
  const set = new Set();
  const re = /\{(\w+)\}/g;
  let m;
  while ((m = re.exec(text)) !== null) set.add(m[1]);
  return set;
}

const problems = [];

const messages = objectBody(src, 'const MESSAGES = ');
const en = entries(objectBody(messages, 'en: {'));
const zh = entries(objectBody(messages, 'zh: {'));

for (const key of en.keys()) if (!zh.has(key)) problems.push('zh is missing ' + key);
for (const key of zh.keys()) if (!en.has(key)) problems.push('en is missing ' + key);

for (const [key, enBody] of en) {
  if (!zh.has(key)) continue;
  const a = placeholders(enBody);
  const b = placeholders(zh.get(key));
  for (const name of a) if (!b.has(name)) problems.push('zh ' + key + ' drops {' + name + '}');
  for (const name of b) if (!a.has(name)) problems.push('en ' + key + ' drops {' + name + '}');
}

// The table ends at the block marker, not at the first ']': the patterns inside it
// carry their own brackets (/[^"]*[({]/), so brace counting alone would stop early.
const causeFrom = src.indexOf('const CAUSES =');
const causeTo = src.indexOf('/* --- error causes (end) --- */');
const causeBlock = src.slice(causeFrom, causeTo === -1 ? src.length : causeTo);
const causeKeys = [...causeBlock.matchAll(/key: '([^']+)'/g)].map((m) => m[1]);

const nextBlock = objectBody(src, 'const NEXT_ACTIONS = ');
const nextMap = new Map();
for (const m of nextBlock.matchAll(/'([^']+)':\s*'([^']+)'/g)) nextMap.set(m[1], m[2]);

for (const key of causeKeys) {
  if (!en.has(key)) problems.push('cause ' + key + ' has no English wording');
  if (!zh.has(key)) problems.push('cause ' + key + ' has no Chinese wording');
  const advice = nextMap.get(key);
  if (advice === undefined) {
    problems.push('cause ' + key + ' has no next step');
    continue;
  }
  if (!en.has(advice)) problems.push('next step ' + advice + ' has no English wording');
  if (!zh.has(advice)) problems.push('next step ' + advice + ' has no Chinese wording');
}

const usedNext = new Set(nextMap.values());
for (const key of en.keys()) {
  if (!key.startsWith('next.')) continue;
  // next.default and next.loop are reached from the fallback paths, not the table.
  if (key === 'next.default' || key === 'next.loop') continue;
  if (!usedNext.has(key)) problems.push('unused advice key ' + key);
}

// Every cause.* key must be either claimed by the table or named somewhere else in
// the bundle (cause.unknown is the label for "nothing matched"). A key that lives
// only in the two dictionaries is wording no reader can ever reach.
for (const key of en.keys()) {
  if (!key.startsWith('cause.')) continue;
  if (causeKeys.includes(key)) continue;
  const mentions = src.split("'" + key + "'").length - 1;
  if (mentions <= 2) problems.push('unused cause key ' + key);
}

const total = en.size;
if (problems.length === 0) {
  console.log('locale keys match: ' + total + ' keys, ' + causeKeys.length + ' causes');
  process.exit(0);
}
for (const p of problems) console.log('FAIL  ' + p);
console.log('\n' + problems.length + ' problem(s) across ' + total + ' keys and ' + causeKeys.length + ' causes');
process.exit(1);
