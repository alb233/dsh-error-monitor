#!/usr/bin/env node
/**
 * One-command release for @alb233/dsh-error-monitor.
 *
 *   node scripts/release.mjs                        # patch bump, commit, push, tag, publish
 *   node scripts/release.mjs --bump minor --yes     # same, no prompt
 *   node scripts/release.mjs --dry-run              # print what would happen, touch nothing
 *   node scripts/release.mjs --readme               # also copy the plugin README
 *   node scripts/release.mjs --message "fix: x"     # commit pending client.js/README.md first
 *
 * The script never rewrites history: it copies, commits, pushes a fast-forward and
 * publishes. Anything it cannot prove — clean tree, in sync with origin, version still
 * free upstream — stops it before the first irreversible step.
 *
 * Network notes: this machine cannot reach github.com directly, so a failed fetch
 * retries through a local proxy port before giving up; a registry that lags behind
 * publish is a warning, not a failure.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import readline from 'node:readline/promises';
import os from 'node:os';

const REGISTRY = 'https://registry.npmjs.org';
const PKG = '@alb233/dsh-error-monitor';
/** Local ports that are commonly an HTTP proxy on a Windows dev box. */
const PROXIES = [
  'http://127.0.0.1:10808',
  'http://127.0.0.1:7890',
  'http://127.0.0.1:7897',
  'http://127.0.0.1:10809',
  'http://127.0.0.1:1080',
  'http://127.0.0.1:8888',
];
/** The registry can take a minute or two to expose a fresh version. */
const REGISTRY_WAIT_MS = 180_000;
/** Files a release may pick up from the plugin directory without a manual commit. */
const SYNCED_FILES = new Set(['client.js', 'README.md']);

/* ---- privacy gate: nothing machine-specific may leave this repository ---- */
const BINARY = /\.(png|jpe?g|gif|webp|ico|mp4|mov|zip|tgz|gz|woff2?|ttf|pdf)$/i;
const ALLOWED_EMAILS = /@users\.noreply\.github\.com$|@example\.(com|org)$/i;
const homeUser = path.basename(os.homedir());
const PRIVACY = [
  { re: /[A-Za-z]:\\Users\\[^\\\s"']+/i, why: 'Windows home path' },
  { re: /\/Users\/[A-Za-z0-9._-]+\//, why: 'macOS home path' },
  { re: /\/home\/[A-Za-z0-9._-]+\//, why: 'Linux home path' },
  { re: /\.dsh-created-plugins[\\/]/, why: 'local DSH plugin directory' },
  { re: /\.dsh[\\/]profiles[\\/]/, why: 'local DSH profile directory' },
  { re: /AppData[\\/]/i, why: 'Windows AppData path' },
  { re: /npm_[A-Za-z0-9]{36}/, why: 'npm token' },
  { re: /ghp_[A-Za-z0-9]{36}/, why: 'GitHub token' },
  { re: /github_pat_[A-Za-z0-9_]{20,}/, why: 'GitHub token' },
  { re: /sk-[A-Za-z0-9]{20,}/, why: 'API key' },
  { re: /AKIA[0-9A-Z]{16}/, why: 'AWS key' },
];
if (homeUser.length >= 3) {
  const escaped = homeUser.replace(/[^A-Za-z0-9_-]/g, '');
  PRIVACY.push({ re: new RegExp('\\b' + escaped + '\\b', 'i'), why: 'this machine user name' });
}

/** Every file npm would put in the tarball, plus package.json itself. */
function publishFiles() {
  const out = new Set();
  const add = (p) => {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) out.add(p);
  };
  const walk = (p) => {
    if (!fs.existsSync(p)) return;
    if (fs.statSync(p).isFile()) {
      add(p);
      return;
    }
    for (const name of fs.readdirSync(p)) walk(path.join(p, name));
  };
  for (const entry of pkg.files || []) {
    if (entry.includes('*')) {
      const dir = path.dirname(entry);
      const pattern = new RegExp('^' + path.basename(entry).replace(/[.+^$()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
      if (fs.existsSync(dir)) for (const name of fs.readdirSync(dir)) if (pattern.test(name)) add(path.join(dir, name));
    } else {
      walk(entry);
    }
  }
  add('package.json');
  return out;
}

function scanPrivacy(files) {
  const hits = [];
  for (const file of files) {
    if (BINARY.test(file)) continue;
    let text;
    try {
      text = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      for (const rule of PRIVACY) {
        if (rule.re.test(line)) hits.push(file + ':' + (i + 1) + '  ' + rule.why + '  ' + line.trim().slice(0, 120));
      }
      const emails = line.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || [];
      for (const email of emails) {
        if (!ALLOWED_EMAILS.test(email)) hits.push(file + ':' + (i + 1) + '  email address  ' + email);
      }
    }
  }
  return hits;
}

/** Refuse to publish anything that names this machine, its user, or a secret. */
function privacyGate() {
  const files = publishFiles();
  for (const extra of [path.join(pluginDir, 'client.js'), path.join(pluginDir, 'README.md')]) {
    if (fs.existsSync(extra)) files.add(extra);
  }
  const hits = scanPrivacy(files);
  if (hits.length === 0) {
    console.log('privacy   ' + files.size + ' publishable file(s) clean');
    return;
  }
  const report = hits.slice(0, 20).join('\n  ');
  if (dryRun) {
    warn('privacy scan found ' + hits.length + ' hit(s) (a real run would stop):\n  ' + report);
    return;
  }
  die(
    'privacy scan found ' + hits.length + ' hit(s) in files that would be published:\n  ' +
      report +
      '\nRemove them before releasing.',
  );
}

const argv = process.argv.slice(2);
const flag = (name) => argv.includes('--' + name);
const opt = (name, fallback) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : fallback;
};

const dryRun = flag('dry-run');
const yes = flag('yes');
const bump = opt('bump', 'patch');
const copyReadme = flag('readme');
const message = opt('message', 'fix: sync client.js from the plugin directory');
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npmWin = (cmd) => cmd === NPM && process.platform === 'win32';
const startedAt = Date.now();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const warn = (text) => console.warn('NOTE: ' + text);
const die = (text) => {
  console.error('\nSTOP: ' + text);
  process.exit(1);
};

/** Run a command and fail the release when it does. */
const run = (cmd, args, opts = {}) => {
  if (dryRun && opts.mutating) {
    console.log('   [dry] ' + cmd + ' ' + args.join(' '));
    return '';
  }
  try {
    return execFileSync(npmWin(cmd) ? [cmd].concat(args).join(' ') : cmd, npmWin(cmd) ? [] : args, {
      stdio: opts.quiet ? 'pipe' : 'inherit',
      encoding: 'utf8',
      shell: npmWin(cmd),
    });
  } catch {
    die(cmd + ' ' + args.join(' ') + ' failed' + (opts.hint ? ' — ' + opts.hint : ''));
  }
};

/** Run a command whose failure is handled by the caller; returns undefined on failure. */
const tryRun = (cmd, args) => {
  try {
    return execFileSync(npmWin(cmd) ? [cmd].concat(args).join(' ') : cmd, npmWin(cmd) ? [] : args, {
      stdio: 'pipe',
      encoding: 'utf8',
      shell: npmWin(cmd),
    });
  } catch {
    return undefined;
  }
};

const portOpen = (target) =>
  new Promise((resolve) => {
    const { hostname, port } = new URL(target);
    const socket = net.connect({ host: hostname, port: Number(port) });
    const done = (ok) => {
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(1500);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });

/**
 * Fetch origin, and when the network refuses, retry through the first local proxy
 * that answers. The proxy is remembered in this repository's .git/config, so the
 * next release starts there directly.
 */
async function ensureOrigin() {
  if (tryRun('git', ['fetch', '--quiet', 'origin']) !== undefined) return;
  if (dryRun) {
    warn('origin is unreachable; a real run would retry through a local proxy');
    return;
  }
  for (const proxy of PROXIES) {
    if (!(await portOpen(proxy))) continue;
    tryRun('git', ['config', '--local', 'http.proxy', proxy]);
    if (tryRun('git', ['fetch', '--quiet', 'origin']) !== undefined) {
      warn('origin reached through ' + proxy + ' (saved for this repository)');
      return;
    }
  }
  die('cannot reach origin. Set a proxy for git, then retry:\n  git config --local http.proxy http://127.0.0.1:<port>');
}

/** Registry metadata with a few retries; undefined when the registry stays unreachable. */
async function registryInfo() {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(REGISTRY + '/' + PKG.replace('/', '%2f'), {
        headers: { 'cache-control': 'no-cache' },
        signal: AbortSignal.timeout(15000),
      });
      if (response.ok) return await response.json();
    } catch {
      /* retried below */
    }
    if (attempt < 3) await sleep(2000);
  }
  return undefined;
}

/** Pushes are the one step that meets a flaky network; give them a few tries. */
async function pushWithRetry(attempts = 3) {
  if (dryRun) {
    console.log('   [dry] git push origin HEAD:main');
    return;
  }
  for (let i = 1; i <= attempts; i += 1) {
    if (i > 1) console.log('   retry ' + i + '/' + attempts);
    if (tryRun('git', ['push', 'origin', 'HEAD:main']) !== undefined) {
      const local = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
      if (tryRun('git', ['fetch', '--quiet', 'origin']) === undefined) {
        warn('pushed, but could not re-read origin/main to verify');
        return;
      }
      const remote = execFileSync('git', ['rev-parse', 'origin/main'], { encoding: 'utf8' }).trim();
      if (local === remote) return;
    }
    await sleep(2000);
  }
  die('push never reached origin/main; the commit stays local — push it later with: git push origin HEAD:main');
}

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
process.chdir(root);
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (pkg.name !== PKG) die('package.json is ' + pkg.name + ', expected ' + PKG);

/* Where the working copy of the plugin lives is machine-specific — never commit it. */
const localConfig = path.join(root, 'release.local.json');
const configured = fs.existsSync(localConfig)
  ? JSON.parse(fs.readFileSync(localConfig, 'utf8')).pluginDir || ''
  : '';
const pluginDir = opt('plugin', process.env.DSH_ERROR_MONITOR_PLUGIN || configured);
if (!pluginDir) {
  die(
    'no plugin directory: pass --plugin <dir>, set DSH_ERROR_MONITOR_PLUGIN, ' +
      'or create release.local.json (gitignored) with {"pluginDir": "..."}',
  );
}

const [major, minor, patch] = pkg.version.split('.').map(Number);
const next =
  bump === 'major'
    ? major + 1 + '.0.0'
    : bump === 'minor'
      ? major + '.' + (minor + 1) + '.0'
      : major + '.' + minor + '.' + (patch + 1);

console.log('repo      ' + root);
console.log('package   ' + PKG);
console.log('version   ' + pkg.version + ' -> ' + next + ' (' + bump + ')');
console.log('plugin    ' + pluginDir);
console.log('readme    ' + (copyReadme ? 'also copied from the plugin' : 'left alone'));
console.log('');

/* ---- preflight: nothing that would make the push or the publish fail ---- */

/* A dirty tree is fine only when the changes are the files this release copies. */
const dirty = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
let pendingChanges = 0;
if (dirty !== '') {
  const lines = dirty.split('\n').map((line) => line.trim()).filter(Boolean);
  const foreign = lines.filter((line) => !SYNCED_FILES.has(line.slice(3).trim()));
  if (foreign.length > 0) {
    if (dryRun) warn('changes outside the release scope (ignored in a dry run):\n' + foreign.join('\n'));
    else die('working tree has changes this release does not own:\n' + foreign.join('\n'));
  }
  pendingChanges = lines.length - foreign.length;
  console.log('pending   ' + pendingChanges + ' change(s) in ' + [...SYNCED_FILES].join(' / ') + ' will be committed first');
}

await ensureOrigin();
privacyGate();
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const upstream = execFileSync('git', ['rev-parse', 'origin/main'], { encoding: 'utf8' }).trim();
if (head !== upstream) die('local main is not origin/main; run git pull --ff-only first');

const npmUser = tryRun(NPM, ['whoami', '--registry', REGISTRY]);
if (npmUser === undefined || npmUser.trim() === '') {
  die('npm is not logged in for ' + REGISTRY + '; run: npm login --registry ' + REGISTRY);
}
console.log('npm user  ' + npmUser.trim());

const ghReady = tryRun('gh', ['auth', 'status']) !== undefined;
if (!ghReady) warn('gh is not available; the GitHub release will be skipped (tag and npm still go out)');

const clientSrc = path.join(pluginDir, 'client.js');
const readmeSrc = path.join(pluginDir, 'README.md');
if (!fs.existsSync(clientSrc)) die('plugin client.js not found at ' + clientSrc);
if (copyReadme && !fs.existsSync(readmeSrc)) die('plugin README.md not found at ' + readmeSrc);

const info = await registryInfo();
if (info === undefined) die('cannot read ' + REGISTRY + ' — check the network and retry');
if (info.versions && info.versions[next]) die('version ' + next + ' already exists on npm; pick another bump');

if (!yes && !dryRun) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question('Proceed with ' + next + '? [y/N] ');
  rl.close();
  if (!/^y(es)?$/i.test(answer.trim())) die('cancelled');
}

/* ---- the release itself ---- */
console.log('\n1/7 committing pending source changes');
if (pendingChanges > 0) {
  run('git', ['add', 'client.js', 'README.md'], { mutating: true });
  run('git', ['commit', '-m', message], { mutating: true });
} else {
  console.log('   nothing pending');
}

console.log('2/7 copying client.js');
if (dryRun) console.log('   [dry] copy ' + clientSrc + ' -> client.js');
else fs.copyFileSync(clientSrc, 'client.js');
if (copyReadme) {
  console.log('   copying README.md');
  if (dryRun) console.log('   [dry] copy ' + readmeSrc + ' -> README.md');
  else fs.copyFileSync(readmeSrc, 'README.md');
}

console.log('3/7 bumping version to ' + next);
pkg.version = next;
if (dryRun) console.log('   [dry] write package.json version ' + next);
else fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

console.log('4/7 committing');
run('git', ['add', '-A'], { mutating: true });
run('git', ['commit', '-m', next + ': release'], { mutating: true });

console.log('5/7 pushing to origin/main');
await pushWithRetry();

/* The GitHub release follows the tag, so the repository and the release never drift. */
const readmeNotes = (version) => {
  try {
    const md = fs.readFileSync('README.md', 'utf8');
    const i = md.indexOf('### ' + version);
    if (i < 0) return version;
    const j = md.indexOf('\n### ', i + 4);
    const body = md.slice(i, j < 0 ? undefined : j).split('\n').slice(2).join('\n').trim();
    return body === '' ? version : body;
  } catch {
    return version;
  }
};
const tag = next; // existing tags in this repo are bare versions
console.log('\n6/7 tagging ' + tag + ' and creating the GitHub release');
if (flag('no-release')) {
  console.log('   skipped (--no-release)');
} else if (dryRun) {
  console.log('   [dry] git tag -a ' + tag + ' && git push origin ' + tag);
  console.log('   [dry] gh release create ' + tag + ' --notes <README ' + next + ' section>');
} else {
  if (execFileSync('git', ['tag', '-l', tag], { encoding: 'utf8' }).trim() === '') {
    run('git', ['tag', '-a', tag, '-m', tag], { mutating: true });
  } else {
    console.log('   tag ' + tag + ' already exists');
  }
  if (tryRun('git', ['push', 'origin', tag]) === undefined) {
    warn('tag not pushed; retry later with: git push origin ' + tag);
  }
  if (ghReady && tryRun('gh', ['release', 'create', tag, '--title', tag, '--notes', readmeNotes(next)]) === undefined) {
    warn('GitHub release not created; retry later with: gh release create ' + tag);
  }
}

if (flag('no-publish')) {
  console.log('\n7/7 publishing skipped (--no-publish)');
} else {
  console.log('\n7/7 publishing to npm');
  run(NPM, ['publish', '--registry', REGISTRY], {
    mutating: true,
    hint: 'check npm auth with: npm whoami --registry ' + REGISTRY,
  });
  if (!dryRun) {
    console.log('   waiting up to ' + REGISTRY_WAIT_MS / 1000 + 's for the registry to expose ' + next + ' ...');
    const deadline = Date.now() + REGISTRY_WAIT_MS;
    let listed = false;
    while (Date.now() < deadline) {
      await sleep(3000);
      const latest = await registryInfo();
      if (latest !== undefined && latest.versions && latest.versions[next]) {
        listed = true;
        console.log('   registry has ' + next + ' (latest: ' + latest['dist-tags'].latest + ')');
        break;
      }
    }
    if (!listed) {
      /* The tarball was accepted; only the public index lags. Never bury that. */
      warn('published, but the registry index has not exposed ' + next + ' after ' + REGISTRY_WAIT_MS / 1000 + 's');
      warn('do not republish: check npm view ' + PKG + ' version --registry ' + REGISTRY);
    }
  }
}

console.log(
  dryRun
    ? '\nDRY RUN — nothing was copied, committed, pushed or published'
    : '\nDONE  ' + PKG + '@' + next + '  (' + Math.round((Date.now() - startedAt) / 1000) + 's)',
);
console.log('install: dsh plugin add ' + PKG + '@' + next + '   (desktop: fully quit and restart DSH)');
