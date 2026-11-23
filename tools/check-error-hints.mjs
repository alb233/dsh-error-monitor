/**
 * The cause table lives inside the client bundle, so this script lifts the marked
 * block out of client.js verbatim and exercises it on the signatures the panel
 * meets in practice. Run: node tools/check-error-hints.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(here, '..', 'client.js');
const src = fs.readFileSync(file, 'utf8');

const OPEN = '/* --- error causes (start) --- */';
const CLOSE = '/* --- error causes (end) --- */';
const start = src.indexOf(OPEN);
const end = src.indexOf(CLOSE);
if (start === -1 || end === -1 || end < start) {
  console.error('cause block markers not found in client.js');
  process.exit(1);
}
const body = src.slice(start + OPEN.length, end);
const { explainFailure } = new Function(body + '\nreturn { explainFailure };')();

const cases = [
  [
    'grep search failed (exit 2): rg: C:\\p\\backend\\workspace_lock.py: IO error for operation on C:\\p\\backend\\workspace_lock.py: 系统找不到指定的文件。 (os error 2)',
    'cause.enoent',
  ],
  ['[sandbox: file access denied under workspace-write mode]', 'cause.sandbox'],
  ['EPERM: cannot open named pipe for capture', 'cause.pipe'],
  ['Workspace is already in use by another Sharp GUI service (PID 2068): C:\\w', 'cause.inuse'],
  ['connect ECONNREFUSED 127.0.0.1:5050', 'cause.refused'],
  ['request ETIMEDOUT after 30000ms', 'cause.timeout'],
  ['HTTP 401 Unauthorized', 'cause.auth'],
  ['HTTP 403 OWNER_REQUIRED', 'cause.forbidden'],
  ['ModuleNotFoundError: No module named "torch"', 'cause.module'],
  ["'foo' 不是内部或外部命令，也不是可运行的程序", 'cause.command'],
  ['fatal: not a git repository (or any of the parent directories): .git', 'cause.nogit'],
  ['Traceback (most recent call last):\n  File "app.py", line 10, in <module>\nZeroDivisionError: division by zero', 'cause.traceback'],
  ['  File "train.py", line 42\n    for i in range(n)\n                    ^\nSyntaxError: expected \':\'', 'cause.syntax'],
  ['npm ERR! code ERESOLVE\nnpm ERR! ERESOLVE unable to resolve dependency tree', 'cause.eresolve'],
  ['npm ERR! Missing script: "build"', 'cause.npm'],
  ['sqlite3.OperationalError: no such table: sessions', 'cause.sqlite'],
  ['UnicodeDecodeError: \'gbk\' codec can\'t decode byte 0x80 in position 12', 'cause.encoding'],
  ['yaml.scanner.ScannerError: mapping values are not allowed here', 'cause.yaml'],
  ['json.decoder.JSONDecodeError: Expecting property name enclosed in double quotes: line 2', 'cause.json'],
  ['torch.cuda.OutOfMemoryError: CUDA out of memory. Tried to allocate 2.50 GiB', 'cause.oom'],
  ['OSError: [WinError 10048] 通常每个套接字地址(协议/网络地址/端口)只允许使用一次。 : bind: 0.0.0.0:5050', 'cause.port'],
  ['OSError: [Errno 28] No space left on device', 'cause.nospace'],
  ['grep search failed (exit 137): signal: killed', 'cause.killed'],
  ['HTTP 502 Bad Gateway from upstream proxy', 'cause.gateway'],
  ['getaddrinfo ENOTFOUND registry.npmjs.org', 'cause.dns'],
  ['unable to verify the first certificate (self-signed certificate in certificate chain)', 'cause.tls'],
  ['Insufficient Balance (request_id: 1260010a) [ACCOUNT_QUOTA]', 'cause.quota'],
  ['HTTP 429 Too Many Requests, rate limit exceeded', 'cause.rate'],
  // The signatures that repeat hundreds of times in real sessions: a broken
  // tool-call format, the host refusing the call, and state machines. They cost
  // more than every content-level error together, so they are pinned here.
  ['Error: unknown tool ""', 'cause.toolname'],
  ['Error: unknown tool "skill({\\"name\\": \\"remotion-video-toolkit\\"})"', 'cause.toolname'],
  [
    'Error: BLOCKED by CC Safety Net Reason: CC Safety Net could not check this tool call because it arrived without a usable tool name or arguments',
    'cause.safetynet',
  ],
  ['Error: cannot modify "D:\\\\p\\\\a.md": file has not been read — read the file, then retry', 'cause.notread'],
  ['Error: invalid arguments: missing required property "name"', 'cause.invalidargs'],
  ['Error: [Compression FAILED: Requested range(s) cannot be anchored (e.g. m00392..m00411)]', 'cause.compress'],
  ['Error: cannot read "C:\\\\p\\\\a.png" as an image: model "deepseek-v4.1-flash" does not support image input', 'cause.vision'],
  ['Error: 非法闭环迁移：reported → done', 'cause.state'],
  ['Error: status 必须是 pending / in_progress / done / blocked', 'cause.state'],
  ['Error: cross-origin redirect to https://cn.bing.com is not followed automatically; retry against that URL directly', 'cause.redirect'],
  ['Error: grep search failed (exit 2): rg: C:\\\\a\\\\app.asar\\\\dsh: IO error for operation', 'cause.asarpath'],
  // 48 occurrences across 13 sessions: the fetch never left the machine, and the
  // raw text says "TypeError", which used to file it as a JavaScript bug.
  ['web fetch failed: TypeError: fetch failed', 'cause.webnet'],
  // 15 occurrences across 10 sessions: a provider key that expired mid-session.
  ['Error: api key provided is invalid: sk-abc', 'cause.auth'],
  ['some unrelated failure text', null],
  // Mined from 633 local sessions (1669 tool errors): the signatures that
  // recurred but had no cause line yet.
  ['Error: cannot edit "D:\\p\\a.md": file changed since it was read — re-read the file, then retry', 'cause.stale'],
  ['Error: source path must stay inside the workspace: C:/Users/x/out.md', 'cause.pathguard'],
  ['Error: dsh auto-denied this action: approval prompts are disabled in this session, so nobody was asked.', 'cause.approvaloff'],
  ['Error: dsh-ops cordis mode replaced the official tool read with ops_inspect_local_file; call it instead', 'cause.modeReplace'],
  ['Error: unknown tool "bash"', 'cause.unknownTool'],
  ['Error: Host Cordis inspect Config.listConfigs rejected input: "input" must be an object', 'cause.invalidargs'],
  ['Error: the user cancelled ask_user_question [ASK_CANCELLED]', 'cause.askcancelled'],
  // Extended signatures: an image refusal worded differently, a compression that
  // was refused instead of failing on anchors, and a missing provider key.
  ['Error: cannot read "a.png" as an image: model "deepseek-v4.1-flash" does not declare image input', 'cause.vision'],
  ['Error: [Compression refused: no net shrink — the summary you supplied is not smaller than the range it replaces]', 'cause.compress'],
  ['Error: DeepSeek search has no API key for "DEEPSEEK_API_KEY" [WEB_PROVIDER_CREDENTIAL_MISSING]', 'cause.auth'],
];

let failed = 0;
for (const [text, want] of cases) {
  const got = explainFailure(text);
  const ok = got === want;
  if (!ok) failed += 1;
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + String(got) + '  <- ' + text.slice(0, 72));
}
console.log(failed === 0 ? '\nall ' + cases.length + ' cases pass' : '\n' + failed + ' failing');
process.exit(failed === 0 ? 0 : 1);
