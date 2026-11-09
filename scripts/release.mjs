#!/usr/bin/env node
/**
 * One-command release for @alb233/dsh-error-monitor.
 *
 *   node scripts/release.mjs                        # patch bump, copy client.js, commit, push, publish
 *   node scripts/release.mjs --bump minor --yes     # same, no prompt
 *   node scripts/release.mjs --dry-run              # print what would happen, touch nothing
 *   node scripts/release.mjs --readme               # also copy the plugin README
 *
 * The script never rewrites history: it copies, commits, pushes a fast-forward and
 * publishes. Anything it cannot prove — clean tree, in sync with origin, version still
 * free upstream — stops it before the first irreversible step.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';

const REGISTRY = 'https://registry.npmjs.org';
const PKG = '@alb233/dsh-error-monitor';

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
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const die = (message) => {
  console.error('\nSTOP: ' + message);
  process.exit(1);
};

const run = (cmd, args, opts = {}) => {
  if (dryRun && opts.mutating) {
    console.log('   [dry] ' + cmd + ' ' + args.join(' '));
    return '';
  }
  try {
    return execFileSync(cmd, args, { stdio: opts.quiet ? 'pipe' : 'inherit', encoding: 'utf8' });
  } catch {
    die(cmd + ' ' + args.join(' ') + ' failed' + (opts.hint ? ' — ' + opts.hint : ''));
  }
};

/** Pushes are the one step that meets a flaky network; give them a few tries. */
const pushWithRetry = (attempts = 3) => {
  for (let i = 1; i <= attempts; i += 1) {
    if (i > 1) console.log('   retry ' + i + '/' + attempts);
    const ok = run('git', ['push', 'origin', 'HEAD:main'], {
      mutating: true,
      hint: 'GitHub unreachable; the commit is local, push when the network is back',
    });
    const local = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    run('git', ['fetch', '--quiet', 'origin'], { quiet: true, hint: 'GitHub unreachable' });
    const remote = execFileSync('git', ['rev-parse', 'origin/main'], { encoding: 'utf8' }).trim();
    if (local === remote) return ok;
  }
  die('push never reached origin/main; the commit stays local');
};

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
const dirty = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
if (dirty !== '') die('working tree is not clean:\n' + dirty);
run('git', ['fetch', '--quiet', 'origin'], { hint: 'GitHub unreachable; check the network and retry' });
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const upstream = execFileSync('git', ['rev-parse', 'origin/main'], { encoding: 'utf8' }).trim();
if (head !== upstream) die('local main is not origin/main; run git pull --ff-only first');

const clientSrc = path.join(pluginDir, 'client.js');
const readmeSrc = path.join(pluginDir, 'README.md');
if (!fs.existsSync(clientSrc)) die('plugin client.js not found at ' + clientSrc);
if (copyReadme && !fs.existsSync(readmeSrc)) die('plugin README.md not found at ' + readmeSrc);

const registryInfo = await fetch(REGISTRY + '/' + PKG.replace('/', '%2f'), {
  headers: { 'cache-control': 'no-cache' },
}).then((r) => r.json());
if (registryInfo.versions && registryInfo.versions[next]) {
  die('version ' + next + ' already exists on npm; pick another bump');
}

if (!yes && !dryRun) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question('Proceed with ' + next + '? [y/N] ');
  rl.close();
  if (!/^y(es)?$/i.test(answer.trim())) die('cancelled');
}

/* ---- the release itself ---- */
console.log('\n1/5 copying client.js');
if (dryRun) console.log('   [dry] copy ' + clientSrc + ' -> client.js');
else fs.copyFileSync(clientSrc, 'client.js');
if (copyReadme) {
  console.log('   copying README.md');
  if (dryRun) console.log('   [dry] copy ' + readmeSrc + ' -> README.md');
  else fs.copyFileSync(readmeSrc, 'README.md');
}

console.log('2/5 bumping version to ' + next);
pkg.version = next;
if (dryRun) console.log('   [dry] write package.json version ' + next);
else fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

console.log('3/5 committing');
run('git', ['add', '-A']);
run('git', ['commit', '-m', next + ': release'], { mutating: true });

console.log('4/5 pushing to origin/main');
pushWithRetry();

if (flag('no-publish')) {
  console.log('\n5/5 publishing skipped (--no-publish)');
} else {
  console.log('5/5 publishing to npm');
  run(NPM, ['publish', '--registry', REGISTRY], {
    mutating: true,
    hint: 'check npm auth with: npm whoami --registry https://registry.npmjs.org',
  });
  if (!dryRun) {
    console.log('   waiting for the registry to expose ' + next + ' ...');
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const info = await fetch(REGISTRY + '/' + PKG.replace('/', '%2f'), {
        headers: { 'cache-control': 'no-cache' },
      }).then((r) => r.json());
      if (info.versions && info.versions[next]) {
        console.log('   registry has ' + next + ' (latest: ' + info['dist-tags'].latest + ')');
        break;
      }
      if (attempt === 19) die('published but the registry never listed ' + next);
    }
  }
}

console.log('\nDONE  ' + PKG + '@' + next);
console.log('install: dsh plugin add ' + PKG + '@' + next + '   (desktop: fully quit and restart DSH)');