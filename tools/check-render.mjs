/**
 * Component-level render test for the error-monitor view.
 *
 * Why this exists: check-client-load.mjs only DEFINES the React components —
 * its stub never calls them. The white-screen bug (a dependency array reading a
 * local en/zh variable from inside an effect callback) passed all four checks
 * because no check ever ran the Monitor function body. This harness renders
 * Monitor with real hook semantics, so a ReferenceError or a bad effect blows
 * up here. Run: node tools/check-render.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const clientFile = process.env.CLIENT_FILE || path.join(here, '..', 'client.js');
const rawSrc = fs.readFileSync(clientFile, 'utf8');
const pkgMatch = rawSrc.match(/const PACKAGE = '([^']+)'/);
const PACKAGE = pkgMatch ? pkgMatch[1] : '@dsh-local/view-error-monitor';

function fail(seq, text) {
  return {
    type: 'durable',
    event: {
      type: 'tool/result',
      seq,
      time: Date.now(),
      data: {
        message: { isError: true, role: 'tool', content: [{ type: 'text', text }] },
      },
    },
  };
}

function harness(src, options) {
  const opts = options || {};
  const locale = opts.locale === undefined ? 'zh' : opts.locale;
  const seedSeen = opts.seedSeen === undefined ? 0 : opts.seedSeen;
  const entries = opts.entries || [];
  const storage = new Map();
  const seenKey = PACKAGE + '.seen.S1';
  const rulesKey = PACKAGE + '.sessionRules.S1';
  const autoRulesKey = PACKAGE + '.autoRules.';
  if (seedSeen !== null) storage.set(seenKey, String(seedSeen));
  // Automatic rule learning/injection is opt-in (off by default). Tests that
  // exercise injection must explicitly seed the key to 1.
  if (opts.autoRules) storage.set(autoRulesKey, '1');
  const localStorage = {
    getItem(k) { return storage.has(k) ? storage.get(k) : null; },
    setItem(k, v) { storage.set(k, String(v)); },
    removeItem(k) { storage.delete(k); },
    clear() { storage.clear(); },
  };
  let timer = 0;
  let sandbox;
  const windowStub = {
    __ModuleLoader__: { load(mod) { sandbox.__mod = mod; } },
    localStorage,
    setTimeout() { return ++timer; },
    clearTimeout() {},
    setInterval() { return ++timer; },
    clearInterval() {},
  };
  sandbox = { console, window: windowStub };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'client.js' });
  const mod = sandbox.__mod;
  assert.ok(mod && typeof mod.factory === 'function', 'module loader did not capture the bundle');

  let cursor = 0;
  let states = [];
  let effects = [];
  const React = {
    createElement(type, props) {
      const rest = Array.prototype.slice.call(arguments, 2);
      return { type, props: props || {}, children: rest };
    },
    useState(init) {
      const i = cursor++;
      if (!(i in states)) states[i] = typeof init === 'function' ? init() : init;
      const set = (v) => { states[i] = typeof v === 'function' ? v(states[i]) : v; };
      return [states[i], set];
    },
    useRef(init) {
      const i = cursor++;
      if (!(i in states)) states[i] = { current: init };
      return states[i];
    },
    useEffect(fn) { effects.push(fn); return () => {}; },
    useMemo(fn) { return fn(); },
    useCallback(fn) { return fn; },
    useSyncExternalStore(_subscribe, getSnapshot) { return getSnapshot(); },
  };

  const prompts = [];
  const captured = [];
  const promptResults = opts.promptResults || [];
  const store = (getSnapshot) => ({ subscribe: () => () => {}, getSnapshot });
  const sessionStub = {
    id: 'S1',
    eventSource: store(() => ({ entries: entries, hasMore: false })),
    getSnapshot() { return { loadingOlder: false }; },
    prompt(msgs, mode) {
      const i = prompts.length;
      prompts.push({ msgs, mode });
      const settled = i < promptResults.length ? promptResults[i] : undefined;
      if (settled && settled.reject) return Promise.reject(settled.error || new Error('prompt rejected'));
      const value = settled && 'value' in settled ? settled.value : undefined;
      return Promise.resolve(value);
    },
    loadOlder() {},
  };
  const sessions = {
    list: store(() => []),
    binding() { return { session: sessionStub }; },
  };
  const localeSvc = {
    active: locale,
    getLocale() { return { active: locale }; },
    subscribe() { return () => {}; },
  };
  const ctx = {
    get(name) {
      if (name === 'locale') return localeSvc;
      if (name === 'sessions') return sessions;
      if (name === 'sidebarRight') return { mounted: store(() => []) };
      return undefined;
    },
    slots: {
      inject(name, fn) { return fn(); },
      register(def, comp) { captured.push({ name: def.name, comp }); },
    },
    effect(fn) { return fn(); },
  };

  let exportsObj;
  try {
    exportsObj = mod.factory((name) => {
      if (name === 'react') return React;
      throw new Error('unexpected require: ' + String(name));
    });
  } catch (error) {
    throw new Error('factory threw: ' + (error && error.stack ? error.stack : error));
  }
  exportsObj.apply(ctx);
  const monitor = captured.find((c) => c.name === 'conversation.view');
  assert.ok(monitor && typeof monitor.comp === 'function', 'Monitor component was not registered');

  function render(props) {
    cursor = 0;
    states = [];
    effects = [];
    const tree = monitor.comp(props || { sessionId: 'S1' });
    for (const fn of effects) fn();
    return tree;
  }
  return { render, storage, prompts, captured, seenKey, rulesKey, autoRulesKey, flush: () => new Promise((resolve) => setImmediate(resolve)) };
}

function opsFailures() {
  return [
    fail(3, 'error: INVALID_ARGUMENT glob: invalid type: string, expected a sequence'),
    fail(2, 'error: INVALID_ARGUMENT glob: invalid type: string, expected a sequence'),
    fail(1, 'error: INVALID_ARGUMENT glob: invalid type: string, expected a sequence'),
  ];
}

test('Monitor renders without throwing (catches white-screen bugs)', () => {
  const h = harness(rawSrc, { entries: [] });
  const tree = h.render({ sessionId: 'S1' });
  assert.ok(tree, 'Monitor returned no element');
  assert.ok(Array.isArray(tree.children) && tree.children.length > 0, 'Monitor produced an empty panel');
});

function findAll(node, out) {
  if (!node || typeof node !== 'object') return out;
  if (node.props && node.props.role === 'switch') out.push(node);
  for (const child of node.children || []) findAll(child, out);
  return out;
}

test('auto rule learning is OFF by default — repeated failures inject nothing until enabled', () => {
  const h = harness(rawSrc, { locale: 'zh', seedSeen: 0, entries: opsFailures() });
  const tree = h.render({ sessionId: 'S1' });
  assert.equal(h.prompts.length, 0, 'prompt injected while autoRules is off by default');
  assert.equal(h.storage.get(h.rulesKey), undefined, 'rule learned while autoRules is off by default');
  const switches = findAll(tree, []);
  assert.equal(switches.length, 1, 'autoRules control must be a single role=switch element');
  assert.equal(switches[0].props['aria-checked'], false, 'switch must render unchecked by default');
  assert.ok(String(switches[0].props.className).indexOf('emx-switch') !== -1, 'switch must use toggle-switch styling');
  const kids = switches[0].children || [];
  const labelIdx = kids.findIndex((c) => c && c.children && c.children[0] === '自动规则注入');
  const trackIdx = kids.findIndex((c) => c && c.props && c.props.className === 'emx-switchTrack');
  assert.ok(labelIdx !== -1 && trackIdx !== -1 && labelIdx < trackIdx, 'switch label must render before the slider track');
});

test('autoRules switch renders checked when enabled', () => {
  const h = harness(rawSrc, { locale: 'zh', seedSeen: 0, entries: [], autoRules: true });
  const tree = h.render({ sessionId: 'S1' });
  const switches = findAll(tree, []);
  assert.equal(switches.length, 1, 'autoRules control must be a single role=switch element');
  assert.equal(switches[0].props['aria-checked'], true, 'switch must render checked when enabled');
});

test('repeated failures learn a rule, inject Chinese prompt, auto-mark read', () => {
  const h = harness(rawSrc, { locale: 'zh', seedSeen: 0, entries: opsFailures(), autoRules: true });
  h.render({ sessionId: 'S1' });
  const rulesRaw = h.storage.get(h.rulesKey);
  assert.ok(rulesRaw, 'no session rule was learned');
  const rules = JSON.parse(rulesRaw);
  assert.ok(Array.isArray(rules) && rules.length >= 1, 'learned rule list is empty');
  assert.ok(h.prompts.length >= 1, 'no rule reminder was injected');
  const promptText = h.prompts[0].msgs.map((m) => m.text).join('\n');
  assert.ok(promptText.indexOf('本会话因重复报错形成了一条规则') !== -1, 'injected prompt not Chinese template: ' + promptText);
  assert.ok(promptText.indexOf('处理建议：') !== -1, 'injected prompt lacks 处理建议 prefix');
  const seen = Number(h.storage.get(h.seenKey));
  assert.ok(seen >= 3, 'auto-read did not advance watermark: seen=' + seen);
});

function injectedLedger(h) {
  const key = h.rulesKey.replace('.sessionRules.', '.sessionRulesInjected.');
  return JSON.parse(h.storage.get(key) || '{}');
}

test('injection ledger is written only after the prompt is accepted', async () => {
  const h = harness(rawSrc, { locale: 'zh', seedSeen: 0, entries: opsFailures(), autoRules: true });
  h.render({ sessionId: 'S1' });
  assert.ok(h.prompts.length >= 1, 'no reminder was queued');
  // Before the prompt promise settles, the ledger must stay empty — a queued
  // draft can still be cancelled, so it is not "injected" yet.
  assert.equal(Object.keys(injectedLedger(h)).length, 0, 'ledger written before prompt acceptance');
  await h.flush();
  const ledger = injectedLedger(h);
  assert.ok(Object.keys(ledger).length >= 1, 'ledger not written after prompt acceptance');
  assert.ok(Object.values(ledger).every((v) => typeof v === 'number'), 'ledger timestamps are not numbers');
});

test('a rejected prompt does NOT poison the injection ledger (retry stays possible)', async () => {
  const h = harness(rawSrc, { locale: 'zh', seedSeen: 0, entries: opsFailures(), autoRules: true, promptResults: [{ reject: true }] });
  h.render({ sessionId: 'S1' });
  assert.ok(h.prompts.length >= 1, 'no reminder was queued');
  await h.flush();
  assert.equal(Object.keys(injectedLedger(h)).length, 0, 'rejected prompt must not write the ledger');
});

test('a prompt result with ok:false does NOT mark the rule as injected', async () => {
  const h = harness(rawSrc, { locale: 'zh', seedSeen: 0, entries: opsFailures(), autoRules: true, promptResults: [{ value: { ok: false } }] });
  h.render({ sessionId: 'S1' });
  await h.flush();
  assert.equal(Object.keys(injectedLedger(h)).length, 0, 'ok:false prompt must not write the ledger');
});

test('in-flight guard prevents a second queue before the first prompt settles', async () => {
  const h = harness(rawSrc, { locale: 'zh', seedSeen: 0, entries: opsFailures(), autoRules: true });
  h.render({ sessionId: 'S1' });
  const first = h.prompts.length;
  assert.ok(first >= 1, 'no reminder was queued');
  // Re-render while the first prompt is still pending. The in-flight guard
  // (pendingInjections) must stop a duplicate queue.
  h.render({ sessionId: 'S1' });
  assert.equal(h.prompts.length, first, 'duplicate queue while prompt is in flight');
  await h.flush();
  assert.ok(Object.keys(injectedLedger(h)).length >= 1, 'ledger not written after acceptance');
});

test('in-flight guard is per-session (one session pending does not suppress another)', async () => {
  // Both sessions repeat the same cause|tool, so they share the announcedKey.
  // The module-global pendingInjections must be keyed by sessionId or the
  // second session's injection is silently skipped while the first is pending.
  const h = harness(rawSrc, { locale: 'zh', seedSeen: 0, entries: opsFailures(), autoRules: true });
  h.render({ sessionId: 'S1' });
  assert.equal(h.prompts.length, 1, 'S1 should queue one reminder');
  // S2 renders while S1's prompt is still pending. It must queue its own.
  h.render({ sessionId: 'S2' });
  assert.equal(h.prompts.length, 2, 'S2 injection was suppressed by S1 pending guard');
  await h.flush();
  const ledger1 = JSON.parse(h.storage.get(PACKAGE + '.sessionRulesInjected.S1') || '{}');
  const ledger2 = JSON.parse(h.storage.get(PACKAGE + '.sessionRulesInjected.S2') || '{}');
  assert.ok(Object.keys(ledger1).length >= 1, 'S1 ledger not written');
  assert.ok(Object.keys(ledger2).length >= 1, 'S2 ledger not written');
});

test('fixed marker auto-marks the failure group resolved (eventSource entries unwrapped)', () => {
  // Regression guard: the autofold effect must unwrap settled.entries before
  // handing it to fixedSeqsIn. The real eventSource is {entries, hasMore},
  // not a bare array — passing the wrapper made fixedSeqsIn return empty and
  // the card never folded. This harness feeds that exact wrapper shape.
  const PATH = 'C:/rule-test-target.txt';
  const markerText = '修复完成\nERROR-MONITOR-FIXED seq=13\n';
  const entries = [];
  for (const s of [11, 12, 13]) {
    entries.push({
      type: 'durable',
      event: { type: 'tool/call', seq: s, time: 0, data: { callId: 'c' + s, name: 'edit', arguments: { path: PATH } } },
    });
    entries.push(fail(s, 'error: INVALID_ARGUMENT glob: invalid type: string, expected a sequence'));
  }
  entries.push({
    type: 'durable',
    event: { type: 'assistant/message', seq: 99, time: 4, data: { message: { role: 'assistant', content: [{ type: 'text', text: markerText }] } } },
  });
  const h = harness(rawSrc, { locale: 'zh', seedSeen: 0, entries });
  h.render({ sessionId: 'S1' });
  const resolvedRaw = h.storage.get(PACKAGE + '.resolved.S1');
  assert.ok(resolvedRaw, 'fixed marker did not auto-mark the failure group resolved — settled.entries unwrapping is broken');
  const resolved = JSON.parse(resolvedRaw);
  assert.ok(Object.keys(resolved).length >= 1, 'resolved map is empty despite a matching marker');
});

test('render test detects the dependency-array white-screen regression (mutation)', () => {
  const good = '[autoRules, grouped, thrashOf, session, sessionId, t, locale, markReadThrough]);';
  const bad = '[autoRules, grouped, thrashOf, session, sessionId, t, locale, en, zh]);';
  assert.ok(rawSrc.indexOf(good) !== -1, 'expected dependency array not found — adjust mutation anchor');
  const mutated = rawSrc.replace(good, bad);
  const h = harness(mutated, { entries: [] });
  assert.throws(
    () => h.render({ sessionId: 'S1' }),
    (err) => err && err.name === 'ReferenceError' && /en is not defined/.test(err.message),
    'render test failed to catch the en/zh dependency-array regression',
  );
});
// --- panel simplification / regression guards -------------------------------

test('panel uses a single quiet fold and one unified notice bar', () => {
  assert.ok(rawSrc.indexOf('const [quietOpen, setQuietOpen]') !== -1, 'quiet fold state missing');
  assert.ok(rawSrc.indexOf('panel.quietFold') !== -1, 'combined fold label missing');
  assert.ok((rawSrc.match(/className: 'emx-quietSection'/g) || []).length >= 2, 'quiet fold must hold two sections');
  assert.ok(rawSrc.indexOf("const noticeKey = attentionNew > 0 ? 'new' : autoTicked > 0 ? 'auto' : ruleLearned !== '' ? 'rule' : '';") !== -1, 'unified notice chain missing');
  assert.ok(rawSrc.indexOf('className: \'emx-banner\' + (noticeKey === \'new\' ? \'\' : \' emx-bannerQuiet\')') !== -1, 'unified notice bar rendering missing');
});

test('removed dead UI is really gone (no stale references)', () => {
  for (const dead of ['emx-searchTip', 'emx-foot', 'filter.unresolved', 'panel.windowNote', 'setNotesOpen', 'setResolvedOpen', 'emx-search', 'filter.search', 'filter.searchHint', 'setQuery', 'const needle', 'const needles']) {
    assert.ok(rawSrc.indexOf(dead) === -1, 'stale reference still present: ' + dead);
  }
  // The autoRules switch must live in the filters bar (where the search box was),
  // with its hint shown inline as text rather than a hover title.
  assert.ok(rawSrc.indexOf("'filter.autoRulesHint'))") !== -1, 'autoRules hint must render inline, not on hover');
  assert.ok(rawSrc.indexOf("className: 'emx-autoRules'") !== -1, 'autoRules switch must sit in the filters row');
});

test('rule learning effect dependency array is in the safe form', () => {
  const expected = '[autoRules, grouped, thrashOf, session, sessionId, t, locale, markReadThrough]);';
  assert.ok(rawSrc.indexOf(expected) !== -1, 'unexpected rule-learning effect dependencies');
});

test('cancel-injection control is gone (no button, no handler, no i18n key)', () => {
  for (const dead of ['disableSessionRule', 'rule.cancel', 'emx-ruleCancel']) {
    assert.ok(rawSrc.indexOf(dead) === -1, 'cancel-injection artifact still present: ' + dead);
  }
  // The rules block still renders (read-only), it just has no cancel button.
  const h = harness(rawSrc, { locale: 'zh', seedSeen: 0, entries: opsFailures(), autoRules: true });
  const tree = h.render({ sessionId: 'S1' });
  const rulesRaw = h.storage.get(h.rulesKey);
  assert.ok(rulesRaw, 'rule display vanished along with the button');
});

