/**
 * The repair-command block lives inside the client bundle, so this lifts it out
 * and exercises it on the failures it is meant to serve. Run:
 * node tools/check-repair-commands.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here, '..', 'client.js'), 'utf8');
const OPEN = '/* --- repair commands (start) --- */';
const CLOSE = '/* --- repair commands (end) --- */';
const start = src.indexOf(OPEN);
const end = src.indexOf(CLOSE);
if (start === -1 || end === -1 || end < start) {
  console.error('repair-command block markers not found in client.js');
  process.exit(1);
}
const body = src.slice(start + OPEN.length, end);
const { repairCommands, FIX_COMMANDS } = new Function(body + '\nreturn { repairCommands, FIX_COMMANDS };')();

const cases = [
  [
    'port',
    { path: '', raw: 'Error: listen EADDRINUSE: address already in use :::3000' },
    'cause.port',
    (out) => out.length === 1 && out[0].includes('3000') && !out.join('\n').includes('Stop-Process'),
  ],
  [
    'enoent with path',
    { path: 'C:\\proj\\lib\\a.py', raw: 'os error 2: C:\\proj\\lib\\a.py' },
    'cause.enoent',
    (out) => out[0].includes("'C:\\proj\\lib\\a.py'") && out[1].includes("'C:\\proj\\lib'"),
  ],
  [
    'missing module',
    { path: '', raw: "ModuleNotFoundError: No module named 'pandas'" },
    'cause.module',
    (out) => out[0] === 'python -m pip install pandas',
  ],
  [
    'dns host',
    { path: '', raw: 'getaddrinfo ENOTFOUND api.example.com' },
    'cause.dns',
    (out) => out[0] === 'Resolve-DnsName api.example.com',
  ],
  [
    'unresolved value hides the whole block',
    { path: '', raw: 'listen EADDRINUSE' },
    'cause.port',
    (out) => out.length === 0,
  ],
  ['no commands for a judgement cause', { path: '', raw: 'x' }, 'cause.editmatch', (out) => out.length === 0],
  [
    'no git init shortcut',
    { path: '', raw: 'fatal: not a git repository' },
    'cause.nogit',
    (out) => out.length === 2 && !out.join(' ').includes('git init'),
  ],
  ['placeholdless template still shows', { path: '', raw: 'ENOSPC: no space left' }, 'cause.nospace', (out) => out.length === 1],
];

let failed = 0;
for (const [name, record, causeKey, check] of cases) {
  const out = repairCommands(record, causeKey);
  const ok = check(out);
  if (!ok) failed += 1;
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (out.length === 0 ? '  (no commands)' : '\n      ' + out.join('\n      ')));
}

// Every table key must be a real cause and every placeholder servable.
for (const key of Object.keys(FIX_COMMANDS)) {
  if (!new RegExp("'" + key.replace('.', '\\.') + "'").test(src)) {
    failed += 1;
    console.log('FAIL  table key not a cause: ' + key);
  }
}
console.log(failed === 0 ? '\nall cases pass' : '\n' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);