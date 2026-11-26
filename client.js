window.__ModuleLoader__.load({
  id: '@dsh-local/view-ad2ab3ad-8a5c-4e88-a7bf-ee0bb5b23776',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } = React;

    const PACKAGE = '@dsh-local/view-ad2ab3ad-8a5c-4e88-a7bf-ee0bb5b23776';
    /** View cell id and the key its body registers under. */
    const TAB_TYPE_ID = PACKAGE;
    const SEEN_PREFIX = PACKAGE + '.seen.';
const SEEN_CHILD_PREFIX = PACKAGE + '.seenChild.';
    const RESOLVED_PREFIX = PACKAGE + '.resolved.';
// Ledger of verified-fix markers already applied, so un-marking a card sticks.
const AUTO_PREFIX = PACKAGE + '.autofix.';
// Session-scoped rules learned from repeated failures, plus the ledger of rules
// already injected into this session so a rule is announced only once.
const RULES_PREFIX = PACKAGE + '.sessionRules.';
const RULES_INJECTED_PREFIX = PACKAGE + '.sessionRulesInjected.';
// Rules whose injection prompt is queued but not yet accepted by the session.
// An accepted prompt writes a user/message, which re-runs the learning effect;
// this guard stops the same rule being queued again while that runs in flight.
const pendingInjections = new Set();
// Persisted preference: hide already-resolved cards behind a fold by default.
const HIDE_RESOLVED_KEY = PACKAGE + '.hideResolvedByDefault.';
// Opt-in for automatic session-rule learning + injection. OFF by default: until
// the user enables it, the plugin only displays cards and the user fixes them
// manually through the 直接修复 button.
const AUTO_RULES_KEY = PACKAGE + '.autoRules.';
    const VIEW_ORDER = 50;

    /* ---------------------------------------------------------------- locale */

    const MESSAGES = {
      en: {
        'tab.title': 'Session errors',
        'row.alert': 'This session has unread errors',
        'guide.description': 'Every error this session reported, newest first.',
        'panel.subtitle': 'From this session record',
        'panel.total': '{n} total',
        'panel.empty.title': 'No errors recorded in this session',
        'panel.empty.body': 'Errors appear here as soon as the runtime reports one.',
        'panel.loading': 'Waiting for this session…',
        'panel.noSession': 'This session is not available yet.',
        'panel.loadOlder': 'Load earlier records',
        'panel.loadingOlder': 'Loading…',
        'panel.hasMore': 'Earlier records are not loaded yet',
        'panel.showMore': 'Show {n} earlier entries',
  'panel.notes': '{n} retried by the agent itself',
  'panel.notesHint': 'The agent usually retries these on its own, so usually nothing to do; open to read the raw errors.',
  'panel.quietFold': '{n} folded (resolved or self-retried)',
  'panel.childOverflow': '{n} more subagent sessions exist but are not read (cap {max}).',
  'item.thrashHint': 'The same tool has failed for the same reason {n} times with different arguments — it looks stuck in place. Diagnose first, then change the approach instead of retrying.',
  'item.childHint': 'Its own errors are folded below ({n}).',
        'banner.new': '{n} new since you last looked',
        'banner.autoResolved': '{n} card(s) ticked off from the agent\u2019s verified-fix report',
        'banner.markRead': 'Mark as read',
        'banner.latest': 'Latest error',
        'filter.all': 'All',
        'filter.unread': 'Unread only',
        'filter.hideResolved': 'Hide resolved',
        'filter.hideResolvedHint': 'Fold cards already marked as resolved; new repeats still alert',
        'filter.autoRules': 'Auto rules',
        'filter.autoRulesHint': 'Off by default. On: repeats learn a rule and inject a reminder. Off: fix manually with 直接修复.',
        'filter.markAll': 'Clear unread',
        'filter.markAllHint': 'Clears the unread badge only; does not mark any error resolved or delete it',
        'docs.toggle': 'How to use this panel',
        'docs.toggleHint': 'what each button does',
        'docs.groupCard': 'On an error card',
  'docs.note.name': 'Folded retries',
  'docs.note.desc': 'A single-step failure the agent can still recover from is not shown in the list; it waits in a fold at the bottom (one line, opened to full cards) and never raises the new-error banner. Turn errors and three-time loops stay in the list.',
        'docs.groupBar': 'Top bar and filters',
        'docs.copy.name': 'Copy',
        'docs.copy.desc': 'Copies this error as plain text, cause and arguments included, for pasting somewhere else.',
        'docs.resolve.name': 'Mark resolved',
        'docs.resolve.desc': 'Marks this cause as fixed; every repeat of it follows. Click again to reopen. The mark survives a restart.',
        'docs.disposition.name': 'Handling',
        'docs.disposition.desc': 'Every card states how it is handled. Rule can prevent it: repeated at least 3 times, a session rule was learned and injected so the agent avoids it. Needs a human: outside rule injection (turn interruption, subagent, or a one-off), a person should look. Self-recovered: the agent already retried successfully.',
        'docs.fix.name': 'Fix it now',
        'docs.fix.desc': 'Repair: tells the agent to read the raw event, apply the fix for this cause, then rerun the same call to verify. When it reports that verified fix, the card ticks itself off. Use it when you want the step repaired, not explained.',
        'docs.fixcmd.name': 'Repair commands',
        'docs.fixcmd.desc':
          'Terminal commands for this cause, already filled in from the failure — ready to copy and run. Read-only checks, except when the fix is an install. Nothing is sent to the model.',
        'docs.report.name': 'Copy report',
        'docs.report.desc': 'Turns the current filtered view into a Markdown report on the clipboard, ready to hand to a fresh session.',
        'docs.search.name': 'Search',
        'docs.search.desc': 'Keyword search over message, raw error, tool, path, arguments and code. Space-separated words must all match.',
        'docs.source.name': 'Source chips',
        'docs.source.desc': 'Narrows the list to one source: turns, tools, commands, subagents, runtime.',
        'docs.unresolved.name': 'Only unresolved',
        'docs.unresolved.desc': 'Hides groups already marked resolved. This chip appears only once something is marked.',
        'docs.unread.name': 'Only unread',
        'docs.unread.desc': 'Shows what arrived after the last time you read the list.',
        'docs.markAll.name': 'Clear unread',
        'docs.markAll.desc': 'Only clears the unread badge so the alert stops; the error cards stay exactly as they are — not marked resolved, not deleted.',
        'docs.loadOlder.name': 'Load earlier',
        'docs.loadOlder.desc': 'Reads older records back out of the session log when the list starts mid-history.',
        'filter.empty': 'No failures match this filter',
        'time.now': 'just now',
        'time.min': '{n} min ago',
        'time.hour': '{n} h ago',
        'time.day': '{n} d ago',
        'report.copy': 'Copy as Markdown',
        'report.copied': 'Report copied',
        'report.title': 'Session failure report',
        'report.exported': 'Exported {time}',
        'report.count': '{groups} groups / {records} failures',
        'item.source.turn': 'Turn error',
        'item.source.tool': 'Tool failure',
        'item.source.command': 'Command failed',
        'item.source.subagent': 'Subagent failed',
        'item.source.runtime': 'Runtime notice',
        'item.fromChild': 'From subagent {id}',
        'item.turn': 'Turn {n}',
        'item.turnUnknown': 'No turn position',
        'item.code': 'Code {code}',
        'item.cause': 'Cause: {cause}',
        'item.next': 'Suggested fix: {next}',
        'item.fatal': 'Turn aborted',
        'item.noteBadge': 'Single-step',
        'item.recover': 'Step failed — you can continue',
        'item.disposition.rule': 'Rule can prevent it',
        'item.disposition.ruleHint': 'Repeated at least 3 times; a session rule was learned and injected so the agent avoids it next time',
        'item.disposition.manual': 'Needs a human',
        'item.disposition.manualHint': 'Outside rule injection (turn interruption, subagent, or a one-off) — inspect or fix it yourself',
        'item.disposition.selfheal': 'Self-recovered',
        'item.disposition.selfhealHint': 'The agent retried and recovered on its own; no action needed',
        'next.quota': 'Top up the account or switch route, then rerun this step',
        'next.rate': 'Wait 30–60s and rerun; repeated hits mean throttling — different arguments will not help',
        'next.auth': 'Check the API key is valid and points at the profile you meant',
        'next.forbidden': 'This path or action is outside the current permission — move it into reachable scope, or raise permission for this step only',
        'next.editmatch': 'Read the file again, then copy the anchor from that fresh read instead of rewriting it from memory',
        'next.editambig': 'Lengthen the anchor until it appears once (include the surrounding line); do not widen it with replace_all',
        'next.sandbox': 'Put the file inside the workspace, or rerun this step with escalated permission',
        'next.pathguard': 'Point the call at a path inside the workspace (relative paths work), or move the file there first',
        'next.approvaloff': 'This needs an approval the session cannot ask for — enable approvals, or take another route',
        'next.denied': 'Confirm the path is inside the allowed scope, then decide whether to escalate',
        'next.timeout': 'Do less in one step (fewer commands, smaller reads) and rerun',
        'next.payload': 'The request shape was rejected — fix the arguments, not the model',
        'next.module': 'The module or import is missing — check the name and that it is installed',
        'next.coderun': 'Read the failing line in the raw text, fix the code, then rerun — resending the same code will not help',
        'next.review': 'Apply what the review asked, then resubmit; the same submission will fail again',
        'next.enoent': 'The path is wrong or the file is gone — list the directory first',
        'next.net': 'Check network, proxy and VPN, then rerun; stop after repeated failures',
        'next.gateway': 'Upstream gateway failed (5xx) — retry; if it keeps happening the service behind the proxy is down, switch route or wait',
        'next.jstype': 'Read the first line of the stack trace — it names the undefined variable or wrong type; fix the code and rerun',
        'next.syntax': 'Fix the syntax or indentation on the reported line, then rerun — the interpreter failed before running',
        'next.notdir': 'Check each path segment — one component that should be a directory is actually a file',
        'next.inuse': 'Stop the other instance holding this resource, then rerun',
        'next.busy': 'Close the process locking this file, then rerun',
        'next.pipe': 'The sandbox blocks named pipes — use plain redirection or rerun this step with escalated permission',
        'next.command': 'Check the command spelling and PATH — the executable was not found',
        'next.encoding': 'Re-decode the file as UTF-8; try GBK/GB18030 if it is legacy Chinese text',
        'next.sqlite': 'Check for a locked database, a missing table, or a constraint conflict, then fix that specific cause',
        'next.yaml': 'Check indentation and unquoted values on the reported line',
        'next.json': 'Check for trailing commas, comments, or unquoted keys',
        'next.eresolve': 'Align the conflicting dependency versions, or reinstall with --legacy-peer-deps',
        'next.npm': 'Read the first npm ERR! line — it names the real cause',
        'next.oom': 'Lower the batch size or free memory/VRAM, then rerun',
        'next.cuda': 'Check the driver, free VRAM, and confirm torch/cuDNN versions match',
        'next.port': 'Stop the process on this port or pick a different one',
        'next.tls': 'Check certificate expiry, the trust chain, and the system clock',
        'next.nospace': 'Free disk space, then rerun',
        'next.readonly': 'Write the output to a writable location instead',
        'next.mfile': 'Close unused file handles or raise the open-file limit',
        'next.killed': 'Check whether it ran out of memory or was killed manually — reduce the workload',
        'next.nogit': 'Run git init here first, or point at the correct repository',
        'next.missing': 'Confirm the URL or resource actually exists',
        'next.traceback': 'Read the last line of the traceback — the exception type and message there are the root cause',
        'next.abort': 'Find what cancelled the request, then start it again',
        'next.default': 'Use More → Diagnose only so the model reads the original event, instead of guessing at the arguments',
        'next.loop': 'Stop resending this call — {next}',
        'next.toolname':
          'Do not send it again: this provider cannot produce a usable tool call here — switch model or route for this session',
        'next.safetynet': 'Read the rule it names: rename or move the path out of sensitive scope, or make the call carry a real tool name — an identical retry changes nothing',
        'next.notread': 'Read the file first, then edit from what you just read',
        'next.stale': 'Re-read the file, then retry the edit with an anchor copied from that read',
        'next.unknownTool': 'Use a tool this profile actually has — the same name will be rejected again',
        'next.exitcode': 'Read the command output above [EXIT_CODE], fix that specific line, then rerun once — do not just repeat the same command',
        'next.imgtype': 'Give read_image a PNG/JPEG/WebP/GIF path, or use read for text; for a fetch, check the URL returns HTML/JSON',
        'next.abspath': 'Give every deliverable a full absolute path (e.g. E:\\proj\\out\\a.xlsx) — no relative paths and no ... or shared-prefix shortcuts',
        'next.offline': 'Reconnect the Harness page or MCP server, then rerun — changing arguments will not help',
        'next.limit': 'Wait for an existing child to finish, or complete the work with the agents already running',
        'next.askcancelled': 'Nothing is broken — ask again if the answer is still wanted',
        'next.invalidargs': 'Open the tool schema and fill the argument it names — the model is fine, the call is not',
        'next.compress': 'Call acp_status for live refs, then compress a range that still exists',
        'next.vision': 'Switch to a model that sees images, or ask the user to paste the text instead of the picture',
        'next.asarpath': 'Search the unpacked tree or a single file instead — app.asar is an archive, not a directory',
        'next.state': 'List the legal states and move through them — there is no direct jump to that target',
        'next.webnet': 'Try a single URL on its own first; if that also fails it is the network or proxy, not the page — resending the same batch fails the same way',
        'next.redirect': 'Request the URL it points at, not the redirector',
        'item.args': 'Call arguments: {args}',
        'item.resolved': 'Resolved',
        'item.resolvedHint': 'Ticked by you, or by the verified-fix report the agent sends back',
        'item.resolve': 'Mark resolved',
        'item.unresolve': 'Reopen',

        'cause.enoent': 'The path does not exist — the file or directory is misnamed or was never created',
        'cause.notdir': 'A segment of the path is not a directory',
        'cause.inuse': 'Another instance already holds this resource — stop it first',
        'cause.busy': 'The file is locked by another process',
        'cause.pipe': 'The sandbox blocks named pipes, so piped output cannot be captured',
        'cause.sandbox': 'The file sandbox rejected this path — it is outside this session’s reach',
        'cause.denied': 'Permission denied — this account may not read or write that path',
        'cause.command': 'The command or program to run does not exist',
        'cause.module': 'A Python module is missing',
        'cause.refused': 'No service is listening on that port',
        'cause.timeout': 'The request timed out (slow network or unresponsive peer)',
        'cause.auth': 'Authentication failed — credentials missing or expired',
        'cause.forbidden': 'Access denied — this endpoint needs local or higher privilege',
        'cause.missing': 'The target does not exist',
        'cause.rate': 'Rate limited — retry later',
        'cause.quota': 'The model service account is out of balance — top up the account or switch to another route',
        'cause.nogit': 'The current directory is not a git repository',
        'cause.editmatch': 'The text to replace was not found in the file — the file changed since it was read, or the snippet differs by one character',
        'cause.editambig': 'The anchor matches more than once — the snippet is too loose; extend it with the surrounding lines instead of opening up the match',
        'cause.syntax': 'Python syntax or indentation error — the interpreter failed before running anything',
        'cause.traceback': 'Python raised an exception — the last traceback line names the real cause',
        'cause.encoding': 'Text encoding mismatch — the file is probably not UTF-8 (try GBK/GB18030)',
        'cause.sqlite': 'SQLite error — usually a locked database, a missing table or a UNIQUE violation',
        'cause.yaml': 'YAML is malformed — indentation or an unquoted value usually breaks it',
        'cause.json': 'Invalid JSON — trailing commas, comments or unquoted keys are the usual causes',
        'cause.eresolve': 'Dependency version conflict (ERESOLVE) — align versions or use --legacy-peer-deps',
        'cause.npm': 'npm/pnpm failed — the first ERR! line states the real reason',
        'cause.oom': 'Ran out of memory (RAM or GPU) — reduce the batch or free memory',
        'cause.cuda': 'CUDA runtime error — check driver, VRAM and torch/cuDNN versions',
        'cause.port': 'The port is already taken — stop the other process or pick another port',
        'cause.dns': 'DNS resolution failed — check the hostname and network',
        'cause.tls': 'TLS/certificate failure — expired, self-signed or untrusted certificate',
        'cause.payload': 'Request body too large (413)',
        'cause.gateway': 'Upstream gateway error (502/503/504) — the service behind the proxy is unavailable',
        'cause.nospace': 'Disk is full',
        'cause.readonly': 'The file system is read-only',
        'cause.mfile': 'Too many open files — raise the limit or close handles',
        'cause.killed': 'The process was killed (exit 137 / SIGKILL) — often OOM or a forced stop',
        'cause.reset': 'The connection dropped mid-request — network hiccup or the upstream stream died; just retry',
        'cause.abort': 'The request was aborted before it finished',
        'cause.jstype': 'JavaScript/TypeScript runtime error — the first stack line names the undefined variable or the wrong type',
        'cause.coderun': 'Code execution failed — the exception line right after it names the real cause',
        'cause.review': 'Tool auto-review failed — the review step itself broke; the reason quoted after it is the real one',
        'cause.unknown': 'No known signature — the raw error has to be read',
        'cause.toolname':
          'The tool call arrived without a usable name (or with its arguments glued onto the name) — this provider is not speaking the tool-call format the runtime expects, so every call in the session fails the same way',
        'cause.safetynet': 'The host blocked the call before it ran — an unusable tool name, or a path it treats as sensitive',
        'cause.notread': 'The file was never read in this session, so the edit was refused before its content could be checked',
        'cause.invalidargs': 'The call was rejected before it ran — a required argument is missing or malformed',
        'cause.compress': 'The compression anchors no longer exist — those refs have aged out of the context window',
        'cause.vision': 'The image was refused — this model, or this machine, has no vision capability',
        'cause.stale': 'The file changed after it was read — the edit was refused instead of applied to a stale copy',
        'cause.unknownTool': 'This profile has no tool by that name',
        'cause.exitcode': 'The command ran but exited non-zero; the real reason is in its output just above the [EXIT_CODE] notice',
        'cause.imgtype': 'The wrong file type reached a tool — not an image for read_image, or not a fetchable document',
        'cause.abspath': 'A path hard-gate rejected the call — the deliverable path was relative or abbreviated',
        'cause.offline': 'The client or service behind the tool is disconnected — no connected page, or a server unavailable in this scope',
        'cause.limit': 'A concurrency limit was reached — too many active child agents',
        'cause.askcancelled': 'You cancelled the question, so nothing was answered',
        'cause.pathguard': 'The path sits outside the allowed root, so the tool refused it',
        'cause.approvaloff': 'Approval prompts are disabled in this session, so the action was auto-denied without asking',
        'cause.asarpath': 'The path runs into an app.asar archive, which the search tool cannot read as a directory — nothing was actually searched',
        'cause.state': 'The state machine refused the move — the target state is not reachable from the current one',
        'cause.webnet': 'The fetch never produced a response — it failed before any HTTP status existed (DNS, proxy, TLS or an unreachable host)',
        'cause.redirect': 'The request was redirected to another origin, which is not followed automatically',
        'item.loop': 'Retry loop: this same call has already failed {n} times — the next identical attempt will fail too',
        'item.loopBadge': 'retry loop ×{n}',
        'item.scale': 'Last request ≈ {tokens} tokens ({input} in · {cache} cached)',
        'item.scaleNoCache': 'Last request ≈ {tokens} tokens ({input} in)',
        'item.since': 'first {time}',
        'item.latest': 'latest {time}',
        'item.seqs': 'seqs={seqs}',
        'item.raw': 'Raw error',
        'item.fix': 'Fix it now',
        'item.fixHint': 'Read the raw event, apply the fix, then rerun this call to verify',
        'item.fixCmd': 'Repair commands',
        'item.fixCmdHint': 'Filled in from the error — paste and run',
        'item.fixCopy': 'Copy commands',
        'item.fixCopied': 'Copied',
        'item.fixCopyFailed': 'Copy failed',
        'item.copy': 'Copy details',
        'item.copied': 'Copied',
        'item.copyFailed': 'Copy failed',
        'item.sendFull': 'Send full raw',
        'item.sending': 'Sending…',
        'item.sent': 'Sent to the model',
        'item.sendFailed': 'Send failed',
        'item.expand': 'Show raw error',
        'item.collapse': 'Hide raw error',
        'send.promptFull':
          'I hit an error in this session. Please analyse the cause and propose a fix.\n\nSource: {source}\nTurn: {turn}\nTime: {time}\nCode: {code}\nLikely cause: {cause}\nArguments: {args}\nSession id: {sessionId}{childNote}\nSession event seq: {seq}\nRaw error:\n```\n{raw}\n```\n\nIf the raw text above is still cut off, read the original event with session_event_read(seq={seq}) (add session_id={sessionId} if needed) before concluding.',
        'send.fix':
          'I hit an error in this session. Fix it now — do not stop at a diagnosis.\n\nSource: {source}\nTurn: {turn}\nTool: {tool}\nArguments: {args}\nCode: {code}\nLikely cause: {cause}\nSuggested fix: {next}\nError: {summary}\nSession id: {sessionId}{childNote}\nSession event seq: {seq}\nRepair commands:\n{fixes}\n\nWork in this order:\n1. Read the original event with session_event_read(seq={seq}) (add session_id={sessionId} if needed) and confirm the real error and the exact place it failed: file, line, port, process or argument.\n2. Apply the fix directly — edit the file, change the argument, stop the blocking process, install the missing module or correct the path. If it needs a permission escalation or touches a file outside the workspace, say so before acting.\n3. {verifyStep}\n4. Report three things: what changed, the verification result, and — if it still fails — where to look next. If this should not be repaired automatically (deletes, privacy, an external account), stop and state only what the user has to do.\n5. If — and only if — the rerun succeeded, end the reply with a line of its own: {marker} (verbatim). The monitor reads that line to tick this card off; never write it when the fix is unverified or still failing.',
        'send.fixNone': '(no ready-made command for this cause — derive one from the suggested fix above)',
        'rule.badge': 'Session rule',
        'rule.tool': 'Tool: {tool}',
        'rule.learned': 'Repeated failure — saved a session rule and injected it: {rule}',
        'rule.injected.prompt':
          'A repeated failure in this session produced a rule: {rule}\nKeep it in mind for the rest of this session so the same error is not repeated.\nSuggested fix: {ruleText}',
        'rules.title': 'Session rules ({n}) — click to show/hide',
        'send.childNote':
          '\nThis failure happened inside a subagent session {id}: read it with session_id={id}, not the parent session id.',
        'send.verifyParent':
          'Rerun exactly this call to verify, with the same tool and the same arguments; do not swap in a different test.',
        'send.verifyChild':
          'That call lived in the subagent session, which has already ended, so verify differently: redo the same delegation from the parent session, or check the file, port or environment you changed.',
        'send.turn': '{n}',
        'send.unknown': 'unknown',
        'new.tag': 'NEW',
      },
      zh: {
        'tab.title': '会话报错',
        'row.alert': '本会话有未读报错',
        'guide.description': '本会话每次报错的来源、时间与原始错误。',
        'panel.subtitle': '来自本会话记录',
        'panel.total': '共 {n} 条',
        'panel.empty.title': '本会话暂无报错记录',
        'panel.empty.body': '运行时一旦报错，会立即列在这里。',
        'panel.loading': '正在等待本会话…',
        'panel.noSession': '当前会话尚未就绪。',
        'panel.loadOlder': '加载更早记录',
        'panel.loadingOlder': '加载中…',
        'panel.hasMore': '更早的记录尚未加载',
        'panel.showMore': '显示更早的 {n} 条',
  'panel.notes': '{n} 条模型已自行重试',
  'panel.notesHint': '模型一般会自己重试，通常不用管；想看原始报错再展开。',
  'panel.quietFold': '{n} 条折叠记录（已解决或自行重试）',
  'panel.childOverflow': '另有 {n} 个子智能体会话没有读取（上限 {max} 个）。',
  'item.thrashHint': '同一个工具、同一个原因已经出现 {n} 次，参数却各不相同——像是在原地试。先「只诊断」定位，再换做法，别继续重试。',
  'item.childHint': '它自己的报错收在下方折叠区（{n} 条）。',
        'banner.new': '新报错 {n} 条',
        'banner.autoResolved': '{n} 张卡片已按模型的修复回报自动标记为已解决',
        'banner.markRead': '标记已读',
        'banner.latest': '最新报错',
        'filter.all': '全部',
        'filter.unread': '只看未读',
        'filter.hideResolved': '默认折叠已解决',
        'filter.hideResolvedHint': '把已解决的卡片收进折叠区；新出现的重复报错仍会提醒',
        'filter.autoRules': '自动规则注入',
        'filter.autoRulesHint': '默认关闭。开启后重复报错会学成规则并注入提醒；关闭时只显示卡片，用「直接修复」手动处理。',
        'filter.markAll': '清除未读',
        'filter.markAllHint': '只清掉未读角标，不会把报错标记为已解决，也不会删除卡片',
        'docs.toggle': '使用说明',
        'docs.toggleHint': '每个按钮干什么',
        'docs.groupCard': '单条报错卡片上',
  'docs.note.name': '折叠的自愈重试',
  'docs.note.desc': '模型还能自己纠正的单步失败不进列表，只收在底部一个折叠区里（默认一行，展开后是完整卡片），也不计入“新报错”提醒。中断整轮的错误和重复三次以上的循环留在列表里。',
        'docs.groupBar': '顶栏与筛选',
        'docs.copy.name': '复制',
        'docs.copy.desc': '把这条报错的详情文本复制走，含归因与调用参数，方便贴到别处。',
        'docs.resolve.name': '标记已解决',
        'docs.resolve.desc': '给这个根因打上已解决，同根因的重复报错一起标记；再点一次撤销，重启不丢。',
        'docs.disposition.name': '处理方式',
        'docs.disposition.desc': '每张卡片都会标明处理方式。「可注入规则避免」指同一错误重复 3 次以上，已形成规则注入本会话，模型下次会避开；「需人工处理」指不在规则注入范围（轮次中断、子代理或单次偶发），需要人工查看；「模型已自愈」指模型已自行重试成功，无需处理。',
        'docs.fix.name': '直接修复',
        'docs.fix.desc': '修复：要求模型先读原始事件，按这个根因动手改，再原样重跑这一步验证；验证通过它会回报，卡片随即自己标成已解决。要的是修好，不是再分析一遍。',
        'docs.fixcmd.name': '修复命令',
        'docs.fixcmd.desc': '针对这个根因的终端命令，参数已从报错里填好，可直接复制运行；除装依赖外都是只读检查。不消耗模型 token。',
        'docs.report.name': '复制报告',
        'docs.report.desc': '把当前筛选结果整理成 Markdown 报告复制到剪贴板，可整段交给新会话。',
        'docs.search.name': '搜索',
        'docs.search.desc': '在报错文本、工具名、路径、参数、错误码里查关键词；空格分词表示都要命中。',
        'docs.source.name': '来源筛选',
        'docs.source.desc': '只看某一类报错：轮次、工具、命令、子代理、运行时。',
        'docs.unresolved.name': '只看未解决',
        'docs.unresolved.desc': '藏掉已经标记已解决的分组；没有任何标记时这个按钮不出现。',
        'docs.unread.name': '只看未读',
        'docs.unread.desc': '只看上次阅读之后新出现的报错。',
        'docs.markAll.name': '清除未读',
        'docs.markAll.desc': '只清掉未读角标、让提醒停下来；错误卡片原样保留，不会标记为已解决，也不会删除。',
        'docs.loadOlder.name': '加载更早',
        'docs.loadOlder.desc': '列表从会话中段开始时，从日志里往前补更早的记录。',
        'filter.empty': '没有符合筛选的报错',
        'time.now': '刚刚',
        'time.min': '{n} 分钟前',
        'time.hour': '{n} 小时前',
        'time.day': '{n} 天前',
        'report.copy': '复制 Markdown 报告',
        'report.copied': '报告已复制',
        'report.title': '会话报错报告',
        'report.exported': '导出时间 {time}',
        'report.count': '{groups} 组 / {records} 条',
        'item.source.turn': '回合错误',
        'item.source.tool': '工具失败',
        'item.source.command': '命令失败',
        'item.source.subagent': '子智能体异常',
        'item.source.runtime': '运行时通知',
        'item.fromChild': '来自子智能体 {id}',
        'item.turn': '第 {n} 轮',
        'item.turnUnknown': '无轮次位置',
        'item.code': '错误码 {code}',
        'item.cause': '原因：{cause}',
        'item.next': '处理建议：{next}',
        'item.fatal': '会话中断',
        'item.noteBadge': '单步失败',
        'item.recover': '单步失败，会话可继续',
        'item.disposition.rule': '可注入规则避免',
        'item.disposition.ruleHint': '同一错误重复 3 次以上，已形成规则注入本会话，模型下次会避开',
        'item.disposition.manual': '需人工处理',
        'item.disposition.manualHint': '不在规则注入范围（轮次中断、子代理，或单次偶发），需要人工查看或处理',
        'item.disposition.selfheal': '模型已自愈',
        'item.disposition.selfhealHint': '模型已自行重试成功，无需处理',
        'next.quota': '充值或换一条可用路由，再重跑这一步',
        'next.rate': '等 30–60 秒再重跑；连续触发就是被限流，换参数没用',
        'next.auth': '检查 API key 是否有效、是否指向你以为的那个 profile',
        'next.forbidden': '这个路径或操作超出当前权限：挪到可操作范围内，或只给这一步提权',
        'next.editmatch': '先重新读文件再改；锚点从刚读到的原文复制，别凭记忆写',
        'next.editambig': '把锚点加长到只出现一次（带上前后行），别用 replace_all 硬覆盖',
        'next.sandbox': '把文件放进工作区内，或给这一步提权后重跑',
        'next.pathguard': '改成工作区内的路径（相对路径即可），或先把文件放进来',
        'next.approvaloff': '这件事需要审批而本会话问不了——开启审批，或换一条不需要审批的路',
        'next.denied': '先确认路径在允许范围内，再决定要不要提权',
        'next.timeout': '把单步做小一点（少跑几条命令、少读几个文件）再重跑',
        'next.payload': '请求形状被拒：改参数，不是换模型',
        'next.module': '模块或引用不存在：核对名字，确认装过',
        'next.coderun': '看原文里报错的那一行，改代码再重跑；同一份代码重试没用',
        'next.review': '按审查意见改完再提交；同一份提交还会被拒',
        'next.enoent': '路径写错或文件没了：先列目录确认',
        'next.net': '检查网络、代理与 VPN 再重跑；连续失败就先停',
        'next.gateway': '稍后重试；持续 5xx 说明代理后面的服务挂了，换路由或等恢复',
        'next.jstype': '看栈顶第一行，它点名了未定义变量或用错的类型；改代码再重跑',
        'next.syntax': '按报错行号修语法或缩进；解释器在运行前就失败了',
        'next.notdir': '检查路径每一段，把本该是目录的那一段改成目录',
        'next.inuse': '停掉占用这个资源的旧实例，再重跑',
        'next.busy': '关掉锁定这个文件的进程，再重跑',
        'next.pipe': '沙箱禁止命名管道：改用普通重定向，或给这一步提权后重跑',
        'next.command': '核对命令拼写和 PATH：这个可执行程序没找到',
        'next.encoding': '按 UTF-8 重新解码；若是老中文文件试 GBK/GB18030',
        'next.sqlite': '查是库被占用、表不存在还是约束冲突，针对具体原因处理',
        'next.yaml': '按报错行检查缩进和未加引号的值',
        'next.json': '检查尾逗号、注释或未加引号的键',
        'next.eresolve': '对齐冲突的依赖版本，或加 --legacy-peer-deps 重装',
        'next.npm': '看第一条 npm ERR! 行，它写明了真正原因',
        'next.oom': '调小批量或先释放内存/显存，再重跑',
        'next.cuda': '检查驱动、释放显存，确认 torch/cuDNN 版本匹配',
        'next.port': '停掉占用端口的进程，或换一个端口',
        'next.tls': '检查证书是否过期、信任链和系统时间',
        'next.nospace': '清理磁盘空间，再重跑',
        'next.readonly': '把输出路径换到可写目录',
        'next.mfile': '关闭多余的文件句柄，或提高打开文件数上限',
        'next.killed': '查是内存不足还是被手动杀掉，减小任务规模',
        'next.nogit': '先在这个目录 git init（或指到正确的仓库）',
        'next.missing': '确认这个地址或资源确实存在',
        'next.traceback': '读 traceback 最后一行，那里的异常类型和消息通常就是根因',
        'next.abort': '查清是谁取消了请求，再重新发起',
        'next.default': '从「更多」里点「只诊断」，让模型读原始事件后给定位；别在参数上瞎试',
        'next.loop': '先别重发这次调用——{next}',
        'next.toolname': '别重发：是这个 provider 生不出可用的工具调用，本会话换模型或换路由',
        'next.safetynet': '看它点名的规则：把路径改名或挪出敏感范围，或让调用带上真实的工具名——原样重试不会有变化',
        'next.notread': '先 read 这个文件，再按刚读到的内容改',
        'next.stale': '重新读一次文件，再用这次读到的原文当锚点重试',
        'next.unknownTool': '换成当前 profile 真有的工具，同一个名字再发一次还是会被拒',
        'next.exitcode': '看 [EXIT_CODE] 上方的命令输出，按真实报错改完再重跑一次——不要原样重试同一条命令',
        'next.imgtype': '给 read_image 传 PNG/JPEG/WebP/GIF 路径，文本文件用 read；抓取时确认 URL 返回 HTML/JSON',
        'next.abspath': '产物一律用完整绝对路径（如 E:\\proj\\out\\a.xlsx），不要用相对路径，也不要用 ... 或共用前缀省略',
        'next.offline': '重连 Harness 页面或 MCP 服务后再试；改参数没用',
        'next.limit': '等现有子代理结束，或直接用当前已有的代理完成工作',
        'next.askcancelled': '没有坏东西——还想问就再问一次',
        'next.invalidargs': '打开工具 schema 补上它点名的那一项：模型没问题，是这次调用缺东西',
        'next.compress': '先 acp_status 拿最新 refs，再压缩还存在的范围',
        'next.vision': '换有视觉能力的模型，或让用户把图里的文字贴出来',
        'next.asarpath': '改在解包后的目录或单个文件里搜——app.asar 是归档，不是目录',
        'next.state': '先看合法状态列表再一步步推进——没有直达那个目标状态的路',
        'next.webnet': '先单独试一条 URL；如果也失败，那是网络或代理的问题、不是页面的问题——重发同一批会一样失败',
        'next.redirect': '直接请求它指向的 URL，不要请求跳转入口',
        'item.args': '调用参数：{args}',
        'item.resolved': '已解决',
        'item.resolvedHint': '你点的，或模型验证通过后回报时自动标的',
        'item.resolve': '标记已解决',
        'item.unresolve': '重新打开',

        'cause.enoent': '路径不存在：文件或目录名写错，或该文件尚未创建',
        'cause.notdir': '路径中有一段不是目录',
        'cause.inuse': '资源已被另一个实例占用，需先停掉旧实例',
        'cause.busy': '文件被其他进程锁定',
        'cause.pipe': '沙箱禁止命名管道，无法捕获子进程输出',
        'cause.sandbox': '被文件沙箱拒绝：该路径不在本会话可操作范围',
        'cause.denied': '权限不足：当前账户无权读写该路径',
        'cause.command': '要执行的命令或程序不存在',
        'cause.module': '缺少 Python 依赖模块',
        'cause.refused': '目标端口没有服务在监听',
        'cause.timeout': '请求超时（网络慢或对端无响应）',
        'cause.auth': '鉴权失败：凭据缺失或已失效',
        'cause.forbidden': '权限被拒：该接口需要本机或更高权限',
        'cause.missing': '目标不存在',
        'cause.rate': '触发限流，稍后重试',
        'cause.quota': '模型服务账号余额不足：充值或切换路由',
        'cause.nogit': '当前目录不是 git 仓库',
        'cause.editmatch': '要替换的文本在文件中不存在：文件在读取后被改动，或匹配片段差了一个字符',
        'cause.editambig': '锚点文本在文件中出现多次：片段太宽，应带上上下文行把它唯一化，而不是放开匹配范围',
        'cause.syntax': 'Python 语法或缩进错误：解释器在运行前就失败了',
        'cause.traceback': 'Python 抛了异常：traceback 最后一行（异常类型与消息）通常是根因',
        'cause.encoding': '文本编码不匹配：文件可能不是 UTF-8，可试 GBK/GB18030',
        'cause.sqlite': 'SQLite 报错：常见原因是库被占用、表不存在或唯一约束冲突',
        'cause.yaml': 'YAML 格式有误：缩进或未加引号的值最容易破坏结构',
        'cause.json': 'JSON 不合法：常见原因是尾逗号、注释或键未加引号',
        'cause.eresolve': '依赖版本冲突（ERESOLVE）：需要对齐版本或加 --legacy-peer-deps',
        'cause.npm': 'npm/pnpm 执行失败：第一条 ERR! 行写明具体原因',
        'cause.oom': '内存不足（内存或显存）：调小批量或先释放内存',
        'cause.cuda': 'CUDA 运行时报错：检查驱动、显存与 torch/cuDNN 版本',
        'cause.port': '端口已被占用：停掉占用进程或换端口',
        'cause.dns': '域名解析失败：检查主机名与网络',
        'cause.tls': 'TLS/证书失败：证书过期、自签名或不受信任',
        'cause.payload': '请求体过大（413）',
        'cause.gateway': '上游网关错误（502/503/504）：代理后面的服务不可用',
        'cause.nospace': '磁盘空间不足',
        'cause.readonly': '文件系统只读',
        'cause.mfile': '打开的文件数超限：提高上限或关闭句柄',
        'cause.killed': '进程被强杀（exit 137 / SIGKILL）：常见于内存不足或手动终止',
        'cause.reset': '请求中途连接断开：网络抖动或上游断流，直接重试即可',
        'cause.abort': '请求在完成前被中止',
        'cause.jstype': 'JavaScript/TypeScript 运行时错误：栈顶第一行通常点名未定义变量或类型用错',
        'cause.coderun': '代码执行失败：紧跟其后的异常行才是真正原因',
        'cause.review': '工具自动审查失败：是审查步骤本身出错，其后引用的原因才是真因',
        'cause.unknown': '未匹配到已知特征：需要读原始错误',
        'cause.toolname':
          '工具调用没有可用的名字（或把参数粘在了名字里）——这个 provider 的工具调用格式和运行时对不上，本会话每次调用都会这样失败',
        'cause.safetynet': '宿主在调用执行前就拦下了——工具名不可用，或路径被判定为敏感',
        'cause.notread': '这个文件本次会话还没读过，改动在校验内容之前就被拒了',
        'cause.invalidargs': '调用在执行前被拒：缺少必填参数，或参数形状不对',
        'cause.compress': '压缩锚点已失效——那些 ref 已经被挤出上下文窗口',
        'cause.vision': '图片被拒：当前模型或本机没有视觉能力',
        'cause.stale': '文件在读取之后又被改过，编辑被拒绝，而不是写到过期副本上',
        'cause.unknownTool': '当前 profile 里没有这个工具名',
        'cause.exitcode': '命令执行了但以非零码退出；真正原因在 [EXIT_CODE] 提示上方的输出里',
        'cause.imgtype': '传给工具的文件类型不对：read_image 拿到的不是图片，或抓取目标不是可解析的文档',
        'cause.abspath': '路径硬门拒绝：产物路径写了相对路径，或省略了中间目录段',
        'cause.offline': '工具背后的客户端或服务没连上：页面断开、服务未连接，或当前 scope 不可用',
        'cause.limit': '并发上限已到：活跃的子代理数量超限',
        'cause.askcancelled': '你自己取消了提问，没有作答',
        'cause.pathguard': '路径在允许的根目录之外，工具直接拒了',
        'cause.approvaloff': '本会话禁用了审批提示，所以动作被自动拒绝，没有问过你',
        'cause.asarpath': '路径落在 app.asar 归档里，搜索工具没法当目录读——这次其实什么都没搜到',
        'cause.state': '状态机拒绝了这次流转：从当前状态到不了目标状态',
        'cause.webnet': '抓取没拿到任何响应：在 HTTP 状态出现之前就失败了（DNS、代理、TLS 或主机不可达）',
        'cause.redirect': '请求被跳到另一个域名，跨域跳转不会自动跟随',
        'item.loop': '重试循环：同一次调用已经失败 {n} 次，再原样试还会失败',
        'item.loopBadge': '重试循环 ×{n}',
        'item.scale': '最近一次请求 ≈ {tokens} tokens（输入 {input} · 缓存 {cache}）',
        'item.scaleNoCache': '最近一次请求 ≈ {tokens} tokens（输入 {input}）',
        'item.since': '最早 {time}',
        'item.latest': '最新 {time}',
        'item.seqs': 'seq={seqs}',
        'item.raw': '原始错误',
        'item.fix': '直接修复',
        'item.fixHint': '先读原始事件，再动手修，然后原样重跑这一步验证',
        'item.fixCmd': '修复命令',
        'item.fixCmdHint': '参数已从报错里填好，可直接粘贴运行',
        'item.fixCopy': '复制命令',
        'item.fixCopied': '已复制',
        'item.fixCopyFailed': '复制失败',
        'item.copy': '复制详情',
        'item.copied': '已复制',
        'item.copyFailed': '复制失败',
        'item.sendFull': '发送完整原文',
        'item.sending': '发送中…',
        'item.sent': '已发送给模型',
        'item.sendFailed': '发送失败',
        'item.expand': '展开原始错误',
        'item.collapse': '收起原始错误',
        'send.promptFull':
          '我在本会话遇到一次报错，请帮我分析原因并给出处理方案。\n\n来源：{source}\n轮次：{turn}\n时间：{time}\n错误码：{code}\n初步归因：{cause}\n调用参数：{args}\n会话 ID：{sessionId}{childNote}\n会话事件 seq：{seq}\n原始错误：\n```\n{raw}\n```\n\n若上面的原文仍被截断，先用 session_event_read(seq={seq})（必要时加 session_id={sessionId}）读出原始事件再下结论。',
        'send.fix':
          '我在本会话遇到一次报错，请直接修复，不要停在诊断。\n\n来源：{source}\n轮次：{turn}\n工具：{tool}\n调用参数：{args}\n错误码：{code}\n初步归因：{cause}\n处理建议：{next}\n错误摘要：{summary}\n会话 ID：{sessionId}{childNote}\n会话事件 seq：{seq}\n修复命令：\n{fixes}\n\n按这个顺序做：\n1. 先 session_event_read(seq={seq}) 读原始事件（需要时加 session_id={sessionId}），确认真实报错和失败的具体位置：文件、行号、端口、进程或参数。\n2. 直接执行修复：改文件、改参数、停掉占用进程、补装缺失模块或纠正路径。需要提权、或要动工作区外的文件，先说清再动手。\n3. {verifyStep}\n4. 汇报三件事：改了什么、验证结果、如果还失败下一步该看哪里。若判断不该在本会话自动修（涉及删除、隐私、外部账号），停下来说清需要用户做什么。\n5. 只有重跑确认成功时，才在回复最后单独写一行：{marker}（原样照抄）。监控插件读这一行把卡片标为已解决；没验证过、或还失败，不要写。',
        'send.fixNone': '（这个根因没有现成命令，按上面的处理建议自行推导）',
        'rule.badge': '本会话规则',
        'rule.tool': '工具：{tool}',
        'rule.learned': '重复报错——已保存本会话规则并注入：{rule}',
        'rule.injected.prompt':
          '本会话因重复报错形成了一条规则：{rule}\n请在余下的会话中遵守它，避免再次触发同样的错误。\n处理建议：{ruleText}',
        'rules.title': '本会话规则（{n}）— 点击展开/收起',
        'send.childNote':
          '\n这条失败发生在子智能体会话 {id} 里：读取时要用 session_id={id}，不要用父会话 ID。',
        'send.verifyParent':
          '修完后原样重跑这一次调用验证——同一个工具、同一份参数，别换成另一个测试。',
        'send.verifyChild':
          '这一步发生在已经结束的子智能体会话里，没法原样重跑：要么在父会话里重做一次同样的委派来验证，要么直接检查你改的文件、端口或环境。',
        'send.turn': '第 {n} 轮',
        'send.unknown': '未知',
        'new.tag': '新',
      },
    };

    /** One shared placeholder pattern: a card renders hundreds of strings per pass. */
    const PLACEHOLDER = /\{(\w+)\}/g;

    function translator(locale) {
      const table = MESSAGES[locale] || MESSAGES.en;
      return (key, params) => {
        let text = table[key];
        if (text === undefined) text = MESSAGES.en[key];
        if (text === undefined) return key;
        if (params === undefined) return text;
        return text.replace(PLACEHOLDER, (whole, name) =>
          Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : whole,
        );
      };
    }

    function safeService(ctx, name) {
      try {
        return typeof ctx.get === 'function' ? ctx.get(name) : undefined;
      } catch {
        return undefined;
      }
    }

    function useActiveLocale(ctx) {
      const service = safeService(ctx, 'locale');
      const subscribe = useCallback(
        (listener) => {
          if (service !== undefined && typeof service.subscribe === 'function') return service.subscribe(listener);
          return () => {};
        },
        [service],
      );
      const getSnapshot = useCallback(() => {
        try {
          const active = service !== undefined && typeof service.getLocale === 'function' ? service.getLocale().active : 'en';
          return typeof active === 'string' && active !== '' ? active : 'en';
        } catch {
          return 'en';
        }
      }, [service]);
      return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    }

    function normalizeLocale(tag) {
      const text = String(tag === undefined || tag === null ? '' : tag).toLowerCase();
      return text.startsWith('zh') ? 'zh' : 'en';
    }

    /* ----------------------------------------------------------------- store */

    function useStoreValue(store) {
      const subscribe = useCallback(
        (listener) => {
          if (store !== undefined && store !== null && typeof store.subscribe === 'function') return store.subscribe(listener);
          return () => {};
        },
        [store],
      );
      const getSnapshot = useCallback(() => {
        if (store !== undefined && store !== null && typeof store.getSnapshot === 'function') {
          try {
            return store.getSnapshot();
          } catch {
            return undefined;
          }
        }
        return undefined;
      }, [store]);
      return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    }

    /**
     * Leading-edge throttle with trailing catch-up: the first change lands at
     * once, further changes inside the window wait, and the timer always flushes
     * the newest value — so a burst collapses into at most two updates and the
     * last value is never dropped.
     */
    function useThrottledValue(value, delay) {
      const [state, setState] = useState(value);
      const latest = useRef(value);
      const timer = useRef(null);
      useEffect(() => {
        latest.current = value;
        if (timer.current !== null) return undefined;
        setState(value);
        timer.current = window.setTimeout(() => {
          timer.current = null;
          setState(latest.current);
        }, delay);
        return undefined;
      }, [value, delay]);
      useEffect(
        () => () => {
          if (timer.current !== null) window.clearTimeout(timer.current);
        },
        [],
      );
      return state;
    }

    /**
     * Panel state is read here and in the header badge, so a write must wake both.
     * localStorage alone gives no cross-component notification.
     */
    const storeListeners = new Set();

    function readNumber(key) {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw === null) return null;
        const value = Number(raw);
        return Number.isFinite(value) ? value : null;
      } catch {
        return null;
      }
    }

    function writeNumber(key, value) {
      try {
        window.localStorage.setItem(key, String(value));
        if (typeof key === 'string' && key.startsWith(SEEN_PREFIX)) touchSeenIndex(key.slice(SEEN_PREFIX.length));
      } catch {
        /* storage unavailable: the panel keeps working, only the watermark resets */
      }
      for (const listener of storeListeners) listener();
    }

    /**
     * A string store for the small JSON blobs the panel keeps per Session. The
     * hook below hands out the raw string, because useSyncExternalStore compares
     * snapshots by identity and a freshly parsed object would never settle.
     */
    function readStoreString(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    }

    function writeStoreString(key, value) {
      try {
        if (value === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, value);
      } catch {
        /* storage unavailable: the mark is lost, the panel keeps working */
      }
      for (const listener of storeListeners) listener();
    }

    /**
     * Seen watermarks live forever otherwise; an insertion-order index keeps only
     * the most recent sessions and evicts the rest. The index itself is storage
     * hygiene: losing it only delays future eviction.
     */
    const SEEN_INDEX_KEY = PACKAGE + '.seen.index';
    const SEEN_CAP = 200;

    function touchSeenIndex(sessionId) {
      try {
        let order = [];
        try {
          const raw = window.localStorage.getItem(SEEN_INDEX_KEY);
          const parsed = raw === null ? [] : JSON.parse(raw);
          if (Array.isArray(parsed)) order = parsed.filter((id) => typeof id === 'string');
        } catch {
          /* a broken index just loses the ordering, not the watermarks */
        }
        order = order.filter((id) => id !== sessionId);
        order.unshift(sessionId);
        while (order.length > SEEN_CAP) {
          const evicted = order.pop();
          try {
            window.localStorage.removeItem(SEEN_PREFIX + evicted);
          } catch {
            /* eviction is best-effort */
          }
        }
        window.localStorage.setItem(SEEN_INDEX_KEY, JSON.stringify(order));
      } catch {
        /* storage unavailable: nothing to prune */
      }
    }

    function useSeenValue(key) {
      const subscribe = useCallback((listener) => {
        storeListeners.add(listener);
        return () => storeListeners.delete(listener);
      }, []);
      const getSnapshot = useCallback(() => readNumber(key), [key]);
      return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    }

    function useStoreString(key) {
      const subscribe = useCallback((listener) => {
        storeListeners.add(listener);
        return () => storeListeners.delete(listener);
      }, []);
      const getSnapshot = useCallback(() => readStoreString(key), [key]);
      return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    }

    /**
     * A failure the user has declared fixed. The mark hangs off the group key, so
     * it survives restarts and covers every repeat of the same root cause; a new
     * occurrence of a fixed failure still shows up as unread.
     */
    /**
     * Child generations carry their own sequence space, so the parent's single
     * watermark cannot judge them: seq 3 in a child is neither before nor after
     * "read up to 40" in the parent. One small map per session, keyed by child.
     */
    const SEEN_CHILD_CAP = 60;

    function readSeenChildren(sessionId) {
      const raw = readStoreString(SEEN_CHILD_PREFIX + String(sessionId));
      if (raw === null) return {};
      try {
        const parsed = JSON.parse(raw);
        if (!isRecord(parsed)) return {};
        const map = {};
        for (const id of Object.keys(parsed)) {
          const value = parsed[id];
          if (typeof value === 'number' && Number.isFinite(value)) map[id] = value;
        }
        return map;
      } catch {
        return {};
      }
    }

    function writeSeenChildren(sessionId, map) {
      const keys = Object.keys(map);
      const trimmed = {};
      for (const id of keys.slice(Math.max(0, keys.length - SEEN_CHILD_CAP))) trimmed[id] = map[id];
      writeStoreString(SEEN_CHILD_PREFIX + String(sessionId), keys.length === 0 ? null : JSON.stringify(trimmed));
    }

    function useSeenChildren(sessionId) {
      return useStoreString(SEEN_CHILD_PREFIX + String(sessionId));
    }

    const RESOLVED_CAP = 300;

    function readResolved(sessionId) {
      const raw = readStoreString(RESOLVED_PREFIX + String(sessionId));
      if (raw === null) return {};
      try {
        const parsed = JSON.parse(raw);
        return isRecord(parsed) ? parsed : {};
      } catch {
        return {};
      }
    }

    function writeResolved(sessionId, map) {
      let keys = Object.keys(map);
      if (keys.length > RESOLVED_CAP) {
        keys = keys
          .sort((a, b) => (Number(map[b]) || 0) - (Number(map[a]) || 0))
          .slice(0, RESOLVED_CAP);
        const kept = {};
        for (const key of keys) kept[key] = map[key];
        map = kept;
        keys = Object.keys(map);
      }
      writeStoreString(
        RESOLVED_PREFIX + String(sessionId),
        keys.length === 0 ? null : JSON.stringify(map),
      );
    }

    function unmarkResolved(sessionId, key) {
      if (typeof key !== 'string' || key === '') return;
      const map = readResolved(sessionId);
      if (!Object.prototype.hasOwnProperty.call(map, key)) return;
      delete map[key];
      writeResolved(sessionId, map);
    }

    /** Mark one group as fixed, recording when so the cap evicts the oldest. */
    function markResolved(sessionId, key, at) {
      if (typeof key !== 'string' || key === '') return;
      const map = readResolved(sessionId);
      map[key] = typeof at === 'number' && Number.isFinite(at) ? at : Date.now();
      writeResolved(sessionId, map);
    }


    /**
     * Which verified-fix markers were already applied to which group. The ledger
     * exists for one reason: without it, un-marking a card would be undone on the
     * next render — the old marker would look fresh again and the card would close
     * itself under the user's hand. A group only takes a marker once per seq.
     */
    const AUTO_CAP = 300;

    function readAutoFix(sessionId) {
      const raw = readStoreString(AUTO_PREFIX + String(sessionId));
      if (raw === null) return {};
      try {
        const parsed = JSON.parse(raw);
        return isRecord(parsed) ? parsed : {};
      } catch {
        return {};
      }
    }

    function writeAutoFix(sessionId, ledger) {
      let keys = Object.keys(ledger);
      if (keys.length > AUTO_CAP) {
        keys = keys.slice(keys.length - AUTO_CAP);
        const kept = {};
        for (const key of keys) kept[key] = ledger[key];
        ledger = kept;
      }
      writeStoreString(AUTO_PREFIX + String(sessionId), keys.length === 0 ? null : JSON.stringify(ledger));
    }

    const RULES_CAP = 50;

    /** Session rules learned from repeated failures, newest last. Disabled rules
     * stay here so the learning effect cannot silently revive them. */
    function readSessionRules(sessionId) {
      const raw = readStoreString(RULES_PREFIX + String(sessionId));
      if (raw === null) return [];
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((rule) => isRecord(rule) && typeof rule.id === 'string' && typeof rule.pattern === 'string').slice(-RULES_CAP);
      } catch {
        return [];
      }
    }

    function writeSessionRules(sessionId, rules) {
      const kept = rules.slice(-RULES_CAP);
      writeStoreString(RULES_PREFIX + String(sessionId), kept.length === 0 ? null : JSON.stringify(kept));
    }

    function useSessionRules(sessionId) {
      const raw = useStoreString(RULES_PREFIX + String(sessionId));
      return useMemo(() => {
        if (raw === null) return [];
        try {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed)
            ? parsed.filter((rule) => isRecord(rule) && typeof rule.id === 'string' && typeof rule.pattern === 'string')
            : [];
        } catch {
          return [];
        }
      }, [raw]);
    }

    /** Rules already announced to a session; each is injected at most once. */
    function readInjectedRules(sessionId) {
      const raw = readStoreString(RULES_INJECTED_PREFIX + String(sessionId));
      if (raw === null) return {};
      try {
        const parsed = JSON.parse(raw);
        return isRecord(parsed) ? parsed : {};
      } catch {
        return {};
      }
    }

    function writeInjectedRules(sessionId, ledger) {
      let keys = Object.keys(ledger);
      if (keys.length > RULES_CAP) {
        keys = keys.slice(keys.length - RULES_CAP);
        const kept = {};
        for (const key of keys) kept[key] = ledger[key];
        ledger = kept;
      }
      writeStoreString(RULES_INJECTED_PREFIX + String(sessionId), keys.length === 0 ? null : JSON.stringify(ledger));
    }

    /** The resolved marks of one Session, re-read whenever they are written. */
    function useResolvedMap(sessionId) {
      const raw = useStoreString(RESOLVED_PREFIX + String(sessionId));
      return useMemo(() => {
        if (raw === null) return {};
        try {
          const parsed = JSON.parse(raw);
          return isRecord(parsed) ? parsed : {};
        } catch {
          return {};
        }
      }, [raw]);
    }

    /* ------------------------------------------------------------- error feed */

    /**
     * A runtime notice is one continuing condition, not a new failure on every
     * render. Its arrival time and its ordering slot are captured once, on first
     * sight: once a watermark moves past it, it stays past.
     */
    const noticeStates = new Map();

    /** Resolve the Session object behind an id, or undefined while unretained. */
    function sessionOf(sessions, sessionId) {
      if (typeof sessionId !== 'string' || sessionId === '' || sessions === undefined) return undefined;
      try {
        const binding = typeof sessions.binding === 'function' ? sessions.binding(sessionId) : undefined;
        const session = binding !== undefined && binding !== null ? binding.session : undefined;
        return session !== undefined && session !== null ? session : undefined;
      } catch {
        return undefined;
      }
    }

    /** Fold durable failures and the live runtime notice into one newest-first list. */
    function collectRecords(entriesSnapshot, sessionSnapshot) {
      const entries = isRecord(entriesSnapshot) ? entriesSnapshot.entries : undefined;
      let list = foldErrors(entries);
      const notice = isRecord(sessionSnapshot) ? sessionSnapshot.lastAgentError : undefined;
      if (typeof notice === 'string' && notice.trim() !== '') {
        const key = String(notice.trim());
        // Both values live for the page's lifetime; a cap keeps a very long
        // session from growing the map without bound.
        if (!noticeStates.has(key)) {
          if (noticeStates.size >= 100) noticeStates.delete(noticeStates.keys().next().value);
          let top = 0;
          for (const record of list) if (Number.isFinite(record.seq) && record.seq > top) top = record.seq;
          noticeStates.set(key, { at: Date.now(), seq: top + 0.5 });
        }
        const state = noticeStates.get(key);
        list = mergeRuntimeNotice(list, key, state.at, state.seq);
      }
      return sortRecords(list);
    }

    /**
     * The Session on screen, read synchronously for non-React callers such as the
     * View tab's label thunk.
     */
    function onScreenSessionId(ctx) {
      const sidebarRight = safeService(ctx, 'sidebarRight');
      try {
        const mounted = sidebarRight !== undefined && sidebarRight !== null ? sidebarRight.mounted : undefined;
        const value = mounted !== undefined && mounted !== null && typeof mounted.getSnapshot === 'function'
          ? mounted.getSnapshot()
          : undefined;
        return typeof value === 'string' && value !== '' ? value : undefined;
      } catch {
        return undefined;
      }
    }

    /** How many failures this Session has that the user has not looked at yet. */
    function unreadNow(ctx, sessionId) {
      const sessions = safeService(ctx, 'sessions');
      const session = sessionOf(sessions, sessionId);
      if (session === undefined) return 0;
      try {
        const entries = session.eventSource !== undefined ? session.eventSource.getSnapshot() : undefined;
        const snapshot = typeof session.getSnapshot === 'function' ? session.getSnapshot() : undefined;
        const records = collectRecords(entries, snapshot);
        const seen = readNumber(SEEN_PREFIX + String(sessionId));
        return seen === null ? 0 : records.filter((record) => record.seq > seen).length;
      } catch {
        return 0;
      }
    }

    /**
     * One Session's failure feed plus its unread watermark, shared by the View body
     * and the header badge so both agree on what "unread" means.
     */
    /**
     * Open a child generation once and fold its own failures into display records.
     * Children live in separate sessions whose event sequences restart at 1, so the
     * records are tagged with their child id; ordering uses a separate orderSeq that
     * the caller derives from the parent's failure notice.
     */
    /** Child transcripts are re-read at most once per window, and polled that often. */
    const CHILD_TTL_MS = 20000;
    const CHILD_CAP = 25;
    const CHILD_BATCH = 5;

    async function readChildRecords(sessions, childId) {
      if (sessions === undefined || typeof childId !== 'string' || childId === '') return [];
      try {
        const address = typeof sessions.subagentAddress === 'function' ? sessions.subagentAddress(childId) : undefined;
        if (address === undefined) return [];
        const readEntries = (reference) => {
          const binding = reference !== undefined && reference.binding !== undefined ? reference.binding : undefined;
          const eventSource = binding !== undefined ? binding.eventSource : undefined;
          const snapshot = eventSource !== undefined && typeof eventSource.getSnapshot === 'function'
            ? eventSource.getSnapshot()
            : undefined;
          return isRecord(snapshot) && Array.isArray(snapshot.entries) ? snapshot.entries : [];
        };
        let entries;
        if (typeof sessions.using === 'function') {
          entries = await sessions.using(address, { source: 'gateway' }, readEntries);
        } else if (typeof sessions.retain === 'function') {
          const reference = sessions.retain(address, { source: 'gateway' });
          try {
            if (reference !== undefined && reference.ready !== undefined) await reference.ready;
            entries = readEntries(reference);
          } finally {
            if (reference !== undefined && typeof reference.release === 'function') reference.release();
          }
        } else {
          return [];
        }
        const list = foldErrors(entries);
        list.sort((left, right) => right.seq - left.seq);
        return list.map((record) => {
          const copy = Object.assign({}, record, { fromChild: true, childId, child: childId });
          copy.message = describeError(copy);
          return copy;
        });
      } catch {
        return [];
      }
    }

    function useErrorFeed(ctx, sessionId, options) {
      const baseline = options !== undefined && options.baseline === true;
      const sessions = safeService(ctx, 'sessions');
      const sessionsRef = useRef(sessions);
      sessionsRef.current = sessions;
      // The Session object arrives once the runtime retains its generation.
      const withChildren = options === undefined || options.children !== false;
      // Only child discovery needs the catalog; a plain unread badge must not
      // wake on every unrelated session being listed.
      const listSnapshot = useStoreValue(withChildren && sessions !== undefined ? sessions.list : undefined);
      const session = sessionOf(sessions, sessionId);
      const entriesSnapshot = useStoreValue(session !== undefined ? session.eventSource : undefined);
      const sessionSnapshot = useStoreValue(session !== undefined ? session : undefined);
      // Every snapshot change re-runs the full fold; a short merge keeps a run of
      // failures from recomputing and re-rendering on every single event, while a
      // lone error still lands immediately (leading edge).
      const feedInput = useMemo(
        () => ({ entries: entriesSnapshot, session: sessionSnapshot }),
        [entriesSnapshot, sessionSnapshot],
      );
      const settled = useThrottledValue(feedInput, 200);
      const records = useMemo(() => collectRecords(settled.entries, settled.session), [settled]);
      const fixedSeqs = useMemo(() => fixedSeqsIn(isRecord(settled.entries) ? settled.entries.entries : undefined), [settled.entries]);
      const topSeq = records.length === 0 ? 0 : records[0].seq;
      const seenKey = SEEN_PREFIX + String(sessionId);
      const seen = useSeenValue(seenKey);
      const seenChildRaw = useSeenChildren(sessionId);
      const seenChildren = useMemo(() => {
        if (seenChildRaw === null) return {};
        try {
          const parsed = JSON.parse(seenChildRaw);
          return isRecord(parsed) ? parsed : {};
        } catch {
          return {};
        }
      }, [seenChildRaw]);

      // Seeding happens on first sight of a session with no watermark yet: without
      // it, installing the plugin (or a fresh storage) would light up every
      // historical failure of every session as unread. Once seeded, the watermark
      // is durable, so a restart never re-seeds over a real unread state.
      useEffect(() => {
        if (baseline && seen === null) writeNumber(seenKey, topSeq);
      }, [baseline, seen, seenKey, topSeq]);

      // A child generation's errors never reach the parent's live window. Discover
      // its id from failure notices and from the catalog (workflow children send no
      // notice), then open each child's eventSource once and fold its own failures.
      const childScan = useMemo(() => {
        if (!withChildren) return { ids: [], overflow: 0 };
        const found = [];
        const push = (id) => {
          if (typeof id === 'string' && id !== '' && found.indexOf(id) === -1) found.push(id);
        };
        for (const record of records) {
          if (record.source === 'subagent' && typeof record.child === 'string') push(record.child);
        }
        const byId = isRecord(listSnapshot) && isRecord(listSnapshot.byId) ? listSnapshot.byId : undefined;
        if (byId !== undefined && typeof sessionId === 'string') {
          for (const id of Object.keys(byId)) {
            const row = byId[id];
            if (isRecord(row) && row.origin === 'subagent' && row.parentId === sessionId) push(id);
          }
        }
        // Notices are the strongest signal, so keep them ahead of a long catalog.
        return { ids: found.slice(0, CHILD_CAP), overflow: Math.max(0, found.length - CHILD_CAP) };
      }, [records, listSnapshot, sessionId, withChildren]);
      const childIds = childScan.ids;
      const childOverflow = childScan.overflow;
      const childIdsKey = childIds.join(String.fromCharCode(1));
      // Keyed by child id and re-read whenever the parent learns of a new failure,
      // so a child that failed again is never frozen at its first read. The effect
      // depends on the failure count rather than the record array: an ordinary
      // event must not re-open every child generation.
      const childCache = useRef(new Map());
      const childFingerprint = useRef('');
      const recordsRef = useRef(records);
      recordsRef.current = records;
      const [childRecords, setChildRecords] = useState([]);
      const [childTick, setChildTick] = useState(0);
      const childSet = useRef('');
      const childCursor = useRef(0);

      useEffect(() => {
        let cancelled = false;
        const ids = childIdsKey === '' ? [] : childIdsKey.split(String.fromCharCode(1));
        // Opening 25 children at once costs 25 retain/release round trips. Read a
        // slice per pass instead, rotating; only a change in the child set (or a
        // first sight) reads them all, because those records are new anyway.
        const previous = childSet.current === '' ? [] : childSet.current.split(String.fromCharCode(1));
        const added = ids.filter((id) => previous.indexOf(id) === -1);
        childSet.current = childIdsKey;
        let batch;
        if (previous.length === 0) {
          batch = ids;
        } else if (added.length > 0) {
          // A new child is the one most likely to be mid-run: read it now, and let
          // the rotation pick up the rest.
          batch = added.slice(0, CHILD_BATCH);
        } else if (ids.length > CHILD_BATCH) {
          const start = childCursor.current % ids.length;
          batch = [];
          for (let k = 0; k < CHILD_BATCH; k += 1) batch.push(ids[(start + k) % ids.length]);
          childCursor.current = start + batch.length;
        } else {
          batch = ids;
        }
        const run = async () => {
          const current = sessionsRef.current;
          const cache = childCache.current;
          for (const id of batch) {
            const entry = cache.get(id);
            const age = entry === undefined ? Infinity : Date.now() - (Number.isFinite(entry.stamp) ? entry.stamp : 0);
            if (entry !== undefined && entry.topSeq === topSeq && age < CHILD_TTL_MS) continue;
            const fresh = await readChildRecords(current, id);
            if (cancelled) return;
            cache.set(id, { records: fresh, topSeq, stamp: Date.now() });
          }
          if (cancelled) return;
          const merged = [];
          const latest = recordsRef.current;
          for (const id of ids) {
            const found = cache.get(id);
            if (found === undefined || !Array.isArray(found.records)) continue;
            let noticeSeq = 0;
            for (const record of latest) {
              if (record.source === 'subagent' && record.child === id && Number.isFinite(record.seq) && record.seq > noticeSeq) noticeSeq = record.seq;
            }
            const base = Math.max(noticeSeq, topSeq, 1);
            for (let i = 0; i < found.records.length; i += 1) {
              merged.push(Object.assign({}, found.records[i], { orderSeq: base - 0.01 - i * 0.0001 }));
            }
          }
          const fingerprint = merged
            .map((record) => String(record.childId) + ':' + String(record.seq) + ':' + String(record.orderSeq))
            .join('|');
          if (fingerprint === childFingerprint.current) return;
          childFingerprint.current = fingerprint;
          setChildRecords(merged);
        };
        void run();
        return () => { cancelled = true; };
      }, [childIdsKey, topSeq, records.length, childTick]);

      // A workflow child reports nothing to its parent, so its own transcript can
      // advance with the parent's topSeq standing still: poll slowly while any child
      // exists instead of trusting that sole trigger.
      useEffect(() => {
        if (!withChildren || childIdsKey === '') return undefined;
        const timer = window.setInterval(() => setChildTick((value) => value + 1), CHILD_TTL_MS);
        return () => window.clearInterval(timer);
      }, [childIdsKey, withChildren]);

      // First sight of a session must not light up history either: seed each child's
      // watermark from the failures already read for it, once.
      const childSeeded = useRef(false);
      useEffect(() => {
        if (!baseline || childSeeded.current || childRecords.length === 0) return;
        const map = readSeenChildren(sessionId);
        let touched = false;
        for (const record of childRecords) {
          if (typeof record.childId !== 'string' || !Number.isFinite(record.seq)) continue;
          if (typeof map[record.childId] === 'number') continue;
          map[record.childId] = record.seq;
          touched = true;
        }
        childSeeded.current = true;
        if (touched) writeSeenChildren(sessionId, map);
      }, [baseline, childRecords, sessionId]);

      // A child generation's own failures only count when no parent notice already
      // reports that child: counting both would show one failure twice.
      const unread = useMemo(() => {
        const noticeChildren = new Set();
        for (const record of records) {
          if (record.source === 'subagent' && typeof record.child === 'string' && record.child !== '') noticeChildren.add(record.child);
        }
        const fresh = (seq) => (Number.isFinite(seq) ? (seen === null ? false : seq > seen) : false);
        let count = 0;
        for (const record of records) if (fresh(record.seq)) count += 1;
        for (const record of childRecords) {
          if (noticeChildren.has(record.childId)) continue;
          const mark = seenChildren[record.childId];
          if (typeof mark === 'number' && Number.isFinite(record.seq) && record.seq > mark) count += 1;
        }
        return count;
      }, [records, childRecords, seen, seenChildren, baseline]);

      // Reading one failure is not reading the newer ones, so the watermark only
      // moves up to that record.
      const markReadThrough = useCallback(
        (throughSeq) => {
          const next = Math.max(seen ?? 0, Number.isFinite(throughSeq) ? throughSeq : 0);
          writeNumber(seenKey, next);
        },
        [seen, seenKey],
      );
      const markRead = useCallback(() => {
        let through = topSeq;
        for (const record of childRecords) {
          if (typeof record.orderSeq === 'number' && record.orderSeq > through) through = record.orderSeq;
        }
        markReadThrough(through);
        // Children need their own marks: the parent watermark says nothing about
        // a sequence space that restarts at 1.
        const map = readSeenChildren(sessionId);
        let touched = false;
        for (const record of childRecords) {
          if (typeof record.childId !== 'string' || !Number.isFinite(record.seq)) continue;
          if (typeof map[record.childId] === 'number' && map[record.childId] >= record.seq) continue;
          map[record.childId] = record.seq;
          touched = true;
        }
        if (touched) writeSeenChildren(sessionId, map);
      }, [markReadThrough, topSeq, childRecords, sessionId]);

      // Older pages are not in the live window: one Turn-aligned page per request.
      const loadOlder = useCallback(() => {
        try {
          if (session !== undefined && typeof session.loadOlder === 'function') void session.loadOlder();
        } catch {
          /* a cold or already-loading window ignores the request */
        }
      }, [session]);

      return {
        session,
        records,
        childRecords,
        childOverflow,
        seenChildren,
        fixedSeqs,
        topSeq,
        seen,
        unread,
        markRead,
        markReadThrough,
        loadOlder,
        hasMore: isRecord(entriesSnapshot) ? entriesSnapshot.hasMore === true : false,
        loadingOlder: isRecord(sessionSnapshot) ? sessionSnapshot.loadingOlder === true : false,
      };
    }

    /* ------------------------------------------------------- sidebar badge */

    /** Folded per snapshot object: the badge re-renders far more often than events arrive. */
    const BADGE_SCAN = new WeakMap();

    /**
     * The failure signatures only. This is the fold without messages, raw payloads
     * or cause attribution, because the sidebar needs a count and nothing else.
     * Failures the agent recovers from on its own are left out unless they repeat
     * into a loop, so a session row lights up when something actually stopped.
     */
    function badgeScan(snapshot) {
      if (!isRecord(snapshot)) return { seqs: [], texts: [], top: 0 };
      const cached = BADGE_SCAN.get(snapshot);
      if (cached !== undefined) return cached;
      const entries = Array.isArray(snapshot.entries) ? snapshot.entries : [];
      const items = [];
      const texts = [];
      let top = 0;
      for (const entry of entries) {
        const event = durableEvent(entry);
        if (event === undefined) continue;
        const failure = failureSignature(event);
        if (failure === undefined) continue;
        items.push(failure);
        texts.push(failure.text);
        if (failure.seq > top) top = failure.seq;
      }
      const counts = new Map();
      for (const item of items) {
        const key = item.source + '\u0000' + item.text;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      const seqs = [];
      for (const item of items) {
        const repeated = counts.get(item.source + '\u0000' + item.text) >= LOOP_MIN_COUNT;
        if (item.source === 'turn' || item.source === 'subagent' || repeated) {
          seqs.push(item.seq);
        }
      }
      const result = { seqs, texts, top };
      BADGE_SCAN.set(snapshot, result);
      return result;
    }

    /**
     * The sidebar's unread count for one Session. It keeps the runtime notice and
     * the first-sight seed of useErrorFeed, but never builds a card.
     */
    function useRowUnread(ctx, sessionId) {
      const sessions = safeService(ctx, 'sessions');
      const session = sessionOf(sessions, sessionId);
      const entriesSnapshot = useStoreValue(session !== undefined ? session.eventSource : undefined);
      const sessionSnapshot = useStoreValue(session !== undefined ? session : undefined);
      const seen = useSeenValue(SEEN_PREFIX + String(sessionId));
      const scan = useMemo(() => badgeScan(entriesSnapshot), [entriesSnapshot]);
      const parentTop = scan.top;
      const notice =
        isRecord(sessionSnapshot) && typeof sessionSnapshot.lastAgentError === 'string'
          ? sessionSnapshot.lastAgentError.trim()
          : '';
      let noticeSeq = 0;
      if (notice !== '') {
        const known = scan.texts.some((text) => text !== '' && (text.indexOf(notice) !== -1 || notice.indexOf(text) !== -1));
        if (!known) {
          let state = noticeStates.get(notice);
          if (state === undefined) {
            if (noticeStates.size >= 100) noticeStates.delete(noticeStates.keys().next().value);
            state = { at: Date.now(), seq: parentTop + 0.5 };
            noticeStates.set(notice, state);
          }
          noticeSeq = state.seq;
        }
      }
      const topSeq = Math.max(parentTop, noticeSeq);

      // The same seed as the panel: installing the plugin must not light up every
      // failure a session ever recorded.
      useEffect(() => {
        if (seen === null) writeNumber(SEEN_PREFIX + String(sessionId), topSeq);
      }, [seen, sessionId, topSeq]);

      if (seen === null) return 0;
      let count = 0;
      for (const seq of scan.seqs) if (seq > seen) count += 1;
      if (noticeSeq > seen) count += 1;
      return count;
    }

    /* ------------------------------------------------------------------ fold */

    function isRecord(value) {
      return typeof value === 'object' && value !== null;
    }

    function safeJson(value) {
      try {
        const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
        return text === undefined ? String(value) : text;
      } catch {
        try {
          return String(value);
        } catch {
          return '';
        }
      }
    }

    function messageOf(raw) {
      if (typeof raw === 'string') return raw;
      if (!isRecord(raw)) return raw === undefined || raw === null ? '' : String(raw);
      const parts = [];
      if (typeof raw.message === 'string' && raw.message !== '') parts.push(raw.message);
      else if (typeof raw.detail === 'string' && raw.detail !== '') parts.push(raw.detail);
      else if (typeof raw.reason === 'string' && raw.reason !== '') parts.push(raw.reason);
      if (typeof raw.reason === 'string' && raw.reason !== '' && parts[0] !== raw.reason) parts.push(raw.reason);
      if (typeof raw.code === 'string' && raw.code !== '') parts.push('[' + raw.code + ']');
      if (parts.length === 0) return safeJson(raw);
      return parts.join(' ');
    }

    /**
     * A turn error often arrives as `400: {"message":"…","param":"","code":null}`:
     * a gateway envelope wrapped in a string. Parse it so the card reads like a
     * sentence; the untouched envelope stays in the raw detail.
     */
    function turnDetail(raw) {
      const fallback = messageOf(raw);
      if (!isRecord(raw) || typeof raw.message !== 'string') return fallback;
      const match = /^(\d{3}):\s*(\{[\s\S]*\})$/.exec(raw.message.trim());
      if (match === null) return fallback;
      let inner;
      try {
        inner = JSON.parse(match[2]);
      } catch {
        return fallback;
      }
      if (!isRecord(inner) || typeof inner.message !== 'string' || inner.message === '') return fallback;
      const status = match[1];
      const param = typeof inner.param === 'string' && inner.param !== '' ? ' param: ' + inner.param : '';
      return inner.message + ' (' + status + ')' + param;
    }

    function codeOf(raw) {
      if (!isRecord(raw)) return null;
      const candidates = [raw.code, raw.status, raw.type];
      for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate !== '') return candidate;
        if (typeof candidate === 'number') return String(candidate);
      }
      return null;
    }

    /** The first text block of a tool result, without the wire's "Error: " prefix. */
    function resultText(data) {
      const message = isRecord(data) ? data.message : undefined;
      const content = isRecord(message) ? message.content : undefined;
      if (!Array.isArray(content)) return '';
      for (const block of content) {
        if (isRecord(block) && block.type === 'text' && typeof block.text === 'string' && block.text.trim() !== '') {
          return block.text.trim().replace(/^Error:\s*/i, '');
        }
      }
      return '';
    }

    /**
     * Tool failures sometimes append escalation guidance meant for the model
     * ("retry this exact operation once with sandbox_permissions…"). That is noise
     * on a user-facing card, so the detail stops where the guidance begins; the
     * full text stays in the raw error.
     */
    const TOOL_HINTS = ['[sandbox: escalation available', 'retry this exact operation once', 'sandbox_permissions'];

    function stripToolHints(text) {
      if (typeof text !== 'string' || text === '') return '';
      let out = text;
      for (const marker of TOOL_HINTS) {
        const at = out.indexOf(marker);
        if (at !== -1) out = out.slice(0, at);
      }
      return out.trim().replace(/[\s\-–—(]+$/, '').trim();
    }

    /** The first text block of a message content array, unprompted by a prefix. */
    function contentText(content) {
      if (!Array.isArray(content)) return '';
      for (const block of content) {
        if (isRecord(block) && block.type === 'text' && typeof block.text === 'string' && block.text.trim() !== '') {
          return block.text.trim();
        }
      }
      return '';
    }

    /**
     * A subagent settles into the parent as a `user/message` notice, not as an
     * error event. Its only status is the wording: a clean finish says the child
     * "finished and will do no further work", anything else ended abnormally.
     * Success notices are ignored so the panel keeps reporting failures only.
     */
    function subagentNotice(data) {
      if (!isRecord(data)) return null;
      const source = isRecord(data.source) ? data.source : null;
      if (source === null || source.kind !== 'subagent-settled') return null;
      const text = contentText(data.content);
      if (text === '') return null;
      // The child's own closing words follow this marker; they stay in the raw
      // record, never on the card.
      const head = text.split('Its closing message:')[0].trim();
      if (head === '' || /finished and will do no further work/i.test(head)) return null;
      return {
        child: typeof source.senderSessionId === 'string' ? source.senderSessionId : null,
        text: head,
      };
    }

    /** The target path a tool call names, when its arguments carry one. */
    function argumentPath(argumentsText) {
      if (typeof argumentsText !== 'string' || argumentsText === '') return null;
      let parsed;
      try {
        parsed = JSON.parse(argumentsText);
      } catch {
        return null;
      }
      if (!isRecord(parsed)) return null;
      const keys = ['path', 'file_path', 'filePath', 'notebook_path', 'target_file', 'file'];
      for (const key of keys) {
        const value = parsed[key];
        if (typeof value === 'string' && value !== '') return value;
      }
      return null;
    }

    /**
     * The arguments a failing call was made with. A path alone does not say
     * what went wrong: the command, the url and the pattern are the scene of
     * the failure, and whoever reads the report needs them to reproduce it.
     * Secret-looking values are masked, because this text leaves the panel.
     */
    function argumentSummary(argumentsText) {
      if (typeof argumentsText !== 'string' || argumentsText === '') return null;
      let parsed;
      try {
        parsed = JSON.parse(argumentsText);
      } catch {
        return null;
      }
      if (!isRecord(parsed)) return null;
      const secret = /(token|secret|password|passwd|api[_-]?key|authorization|credential)/i;
      // A secret can also sit inside a value the key name does not betray:
      // `curl -H "Authorization: Bearer sk-..."` is still a credential.
      const scrub = (text) =>
        text
          .replace(/(Bearer\s+)[A-Za-z0-9._\-]{6,}/gi, '$1***')
          .replace(/\bsk-[A-Za-z0-9._\-]{6,}/gi, '***')
          .replace(/((?:password|passwd|pwd|token|api[_-]?key|secret)\s*[=:]\s*)[^\s"',;]+/gi, '$1***');
      // File bodies and patches say nothing about why a call failed besides
      // being long; the path already names the target.
      const bulky = /^(content|new_string|old_string|text|body|diff|patch)$/i;
      const parts = [];
      for (const key of Object.keys(parsed)) {
        const value = parsed[key];
        if (typeof value !== 'string' || value === '') continue;
        if (secret.test(key)) {
          parts.push(key + '=***');
          continue;
        }
        const flat = scrub(value.replace(/\s+/g, ' '));
        if (bulky.test(key) && flat.length > 80) {
          parts.push(key + '=(' + String(value.length) + ' chars)');
          continue;
        }
        const shown = flat.length > 160 ? flat.slice(0, 160) + '…' : flat;
        parts.push(key + '=' + shown);
      }
      if (parts.length === 0) return null;
      const out = parts.join(' · ');
      return out.length <= 600 ? out : out.slice(0, 600) + '…';
    }

    /* --- error causes (start) --- */

    /**
     * Raw stderr rarely names its own cause: “系统找不到指定的文件。(os error 2)” is a
     * path problem, but a reader has to know that “2” means ENOENT. This table maps
     * the recurring signatures onto a locale key, so the card can state the cause in
     * one plain sentence instead of leaving the reader to decode it.
     *
     * Order carries the whole weight, because the first match wins: a specific
     * signature is always tested before a broad one. “403 insufficient balance” is a
     * billing failure and not a permission one, so quota is tested before forbidden;
     * the generic words (timeout, reset, abort) sit at the very end and only fire
     * when nothing more specific did. An unrecognised failure gets no cause line
     * rather than a wrong guess.
     */
    const CAUSES = [
      // Protocol and guard-rail failures happen before any content is touched, so
      // they are tested first: a broken tool-call format repeats on every step of
      // the session and would otherwise be filed as whatever word it happens to
      // contain. “unknown tool” is the runtime, “CC Safety Net” is the host.
      // The host block comes first: its own reason text quotes the broken call,
      // and the block — not the call — is what the reader can act on.
      { key: 'cause.safetynet', re: /CC Safety Net|BLOCKED by CC Safety Net/i },
      { key: 'cause.exitcode', re: /\[EXIT_CODE;/i },
      // Tool-level input/format errors mined from 824 sessions: these are the
      // recurring ones that had no cause line at all.
      { key: 'cause.imgtype', re: /does not declare a supported image format|unsupported content type/i },
      { key: 'cause.abspath', re: /路径硬门拒绝|非完整绝对路径|must be an absolute path/i },
      { key: 'cause.offline', re: /no connected Harness page|server is disconnected|is unavailable in this agent.s scope/i },
      { key: 'cause.limit', re: /subagent limit reached|active child limit/i },
      { key: 'cause.toolname', re: /unknown tool ""|unknown tool "[^"]*[({]/i },
      { key: 'cause.unknownTool', re: /unknown tool "(?!")[^"]+"|UNKNOWN_TOOL/i },
      { key: 'cause.askcancelled', re: /ASK_CANCELLED|user cancelled ask_user_question/i },
      { key: 'cause.notread', re: /file has not been read|FS_NOT_OBSERVED|has not been read yet/i },
      { key: 'cause.stale', re: /file changed since it was read|FS_STALE_VERSION/i },
      { key: 'cause.invalidargs', re: /invalid arguments|INVALID_ARGS|missing required (property|parameter)|rejected input: "[^"]+" must be|needs an http\(s\)|old_string and new_string must differ|regex parse error|look-around, including look-ahead and look-behind, is not supported|not a regular file|invalid escalation|justification is only valid together with sandbox_permissions|reasoning_effort.{0,6}requires both|is invalid; use 1-32 lower-case/i },
      { key: 'cause.compress', re: /cannot be anchored|Compression FAILED|COMPRESS_ANCHOR|Compression refused|no net shrink/i },
      { key: 'cause.vision', re: /does not support image|No vision provider|vision provider is not set|does not declare image/i },
      { key: 'cause.asarpath', re: /\.asar[\\/]|app\.asar/i },
      { key: 'cause.state', re: /非法闭环迁移|状态必须|status 必须是|invalid (status )?transition/i },
      { key: 'cause.redirect', re: /cross-origin redirect|is not followed automatically/i },
      // A fetch that dies before any status exists is a network fault, not a page
      // fault — and it repeats on every URL until the proxy is fixed.
      { key: 'cause.webnet', re: /web fetch failed|TypeError: fetch failed/i },
      { key: 'cause.quota', re: /ACCOUNT_QUOTA|insufficient balance|insufficient_quota|quota exceeded|billing_error|余额不足/i },
      { key: 'cause.rate', re: /(?<![0-9])(429|424)(?![0-9])|Too Many Requests|rate[ _-]?limit|bili_throttle|throttl|限流/i },
      { key: 'cause.auth', re: /(?<![0-9])401(?![0-9])|Unauthorized|authentication required|invalid api key|api key [^.\n]*is invalid|incorrect api key|has no API key for|CREDENTIAL_MISSING/i },
      { key: 'cause.forbidden', re: /(?<![0-9])403(?![0-9])|Forbidden|OWNER_REQUIRED|权限被拒/i },
      { key: 'cause.payload', re: /(?<![0-9])413(?![0-9])|Payload Too Large|request entity too large/i },
      { key: 'cause.gateway', re: /(?<![0-9])50[234](?![0-9])|Bad Gateway|Service Unavailable|Gateway Timeout/i },
      { key: 'cause.jstype', re: /ReferenceError|TypeError|is not defined|Cannot read propert|Cannot access|undefined is not/i },
      { key: 'cause.syntax', re: /SyntaxError|IndentationError|TabError/i },
      { key: 'cause.module', re: /ModuleNotFoundError|No module named|ModuleNotFound|Cannot find module|ERR_MODULE_NOT_FOUND/i },
      { key: 'cause.coderun', re: /CODE_RUN_FAILED|CodeRunFailedError|code run failed/i },
      { key: 'cause.review', re: /AUTO_REVIEW_FAILED|AutoReviewFailedError|auto-review|auto review failed/i },
      { key: 'cause.enoent', re: /os error 2(?![0-9])|ENOENT|No such file or directory|系统找不到指定的文件|找不到指定的文件|The system cannot find the file|FileNotFoundError|File does not exist/i },
      { key: 'cause.notdir', re: /os error 3(?![0-9])|ENOTDIR|不是目录/i },
      { key: 'cause.inuse', re: /already in use by another|已有另一个|已被占用|being used by another process|另一个程序正在使用/i },
      { key: 'cause.busy', re: /os error 32(?![0-9])|EBUSY/i },
      { key: 'cause.pipe', re: /named pipe|命名管道|EPERM.*pipe|pipe.*EPERM/i },
      { key: 'cause.pathguard', re: /rejected: PATH_RESTRICTED|must stay inside the workspace|path must stay inside/i },
      { key: 'cause.approvaloff', re: /approval prompts are disabled|auto-denied this action/i },
      { key: 'cause.sandbox', re: /sandbox: file access denied|sandbox denied|sandbox: denied|sandbox blocked/i },
      { key: 'cause.denied', re: /os error 5(?![0-9])|EACCES|EPERM|PermissionError|Permission denied|拒绝访问|Access is denied/i },
      { key: 'cause.command', re: /command not found|不是内部或外部命令|Executable not found/i },
      { key: 'cause.encoding', re: /UnicodeDecodeError|UnicodeEncodeError|codec can.t decode|codec can.t encode|GBK|gb18030/i },
      { key: 'cause.sqlite', re: /sqlite3[.]|no such table|database is locked|UNIQUE constraint failed|OperationalError/i },
      { key: 'cause.yaml', re: /yaml[.]scanner|YAMLException|mapping values are not allowed/i },
      { key: 'cause.json', re: /EJSONPARSE|JSONDecodeError|Unexpected token .* in JSON|Unexpected end of JSON/i },
      { key: 'cause.eresolve', re: /ERESOLVE|peer dep/i },
      { key: 'cause.npm', re: /npm ERR!|pnpm ERR|ELIFECYCLE/i },
      { key: 'cause.oom', re: /MemoryError|out of memory|CUDA out of memory|OOM/i },
      { key: 'cause.cuda', re: /CUDA error|no CUDA-capable device|cuDNN|CUBLAS/i },
      { key: 'cause.refused', re: /ECONNREFUSED|Connection refused|拒绝连接|actively refused/i },
      { key: 'cause.port', re: /EADDRINUSE|Address already in use|端口.*被占用|10048/i },
      { key: 'cause.dns', re: /getaddrinfo|ENOTFOUND|could not resolve host|cannot resolve host|Name or service not known/i },
      { key: 'cause.tls', re: /CERT_HAS_EXPIRED|certificate verify failed|self.signed certificate|SSL handshake|TLS handshake/i },
      { key: 'cause.nospace', re: /ENOSPC|No space left on device|磁盘空间不足/i },
      { key: 'cause.readonly', re: /EROFS|read-only file system|只读文件系统/i },
      { key: 'cause.mfile', re: /EMFILE|too many open files/i },
      { key: 'cause.killed', re: /exit code 137|SIGKILL|signal: killed/i },
      { key: 'cause.nogit', re: /not a git repository/i },
      { key: 'cause.editmatch', re: /FS_EDIT_NOT_FOUND|old_string was not found|String to replace not found|replace_all.*not found/i },
      { key: 'cause.editambig', re: /FS_AMBIGUOUS_EDIT|old_string matched \d+ times|matched multiple times|is not unique/i },
      { key: 'cause.missing', re: /(?<![0-9])404(?![0-9])|Not Found|unknown job|no current goal/i },
      { key: 'cause.traceback', re: /Traceback .most recent call last./i },
      { key: 'cause.timeout', re: /ETIMEDOUT|timed out|timeout|超时/i },
      { key: 'cause.reset', re: /ECONNRESET|ECONNABORTED|EPIPE|socket hang up|connection reset|fetch failed|unexpected EOF|Empty reply from server|network error/i },
      { key: 'cause.abort', re: /aborted|request was aborted|AbortError|operation was canceled|operation cancelled|was interrupted after it was recorded/i },
    ];

    /**
     * The locale key of the most likely cause, or null when nothing matches.
     * The runtime appends its own notices to tool output ("[sandbox: escalation
     * available ...]"); those name the sandbox and a denial, so a table running
     * over the raw text would blame them. They are removed before any signature
     * is tested.
     */
    function explainFailure(text) {
      if (typeof text !== 'string' || text === '') return null;
      const clean = stripHintNoise(text);
      // DSH itself runs from app.asar, so every run_code stack frame carries a
      // file:///.../app.asar/... URL. Testing the asar-path signature against
      // URL-free text keeps a JavaScript exception from being filed as a path
      // error; every other cause still sees the untouched text.
      const noStackUrls = clean.replace(/file:\/\/\S+/gi, ' ');
      for (const cause of CAUSES) {
        const haystack = cause.key === 'cause.asarpath' ? noStackUrls : clean;
        if (cause.re.test(haystack)) return cause.key;
      }
      return null;
    }

    /**
     * Host notices that ride along with tool output. They are not part of the
     * failure, so they must not decide what the failure is called.
     */
    const NEXT_ACTIONS = {
  'cause.toolname': 'next.toolname',
  'cause.unknownTool': 'next.unknownTool',
  'cause.askcancelled': 'next.askcancelled',
  'cause.stale': 'next.stale',
  'cause.exitcode': 'next.exitcode',
  'cause.imgtype': 'next.imgtype',
  'cause.abspath': 'next.abspath',
  'cause.offline': 'next.offline',
  'cause.limit': 'next.limit',
  'cause.pathguard': 'next.pathguard',
  'cause.approvaloff': 'next.approvaloff',
  'cause.safetynet': 'next.safetynet',
  'cause.notread': 'next.notread',
  'cause.invalidargs': 'next.invalidargs',
  'cause.compress': 'next.compress',
  'cause.vision': 'next.vision',
  'cause.asarpath': 'next.asarpath',
  'cause.state': 'next.state',
  'cause.webnet': 'next.webnet',
  'cause.redirect': 'next.redirect',
  'cause.quota': 'next.quota',
  'cause.rate': 'next.rate',
  'cause.auth': 'next.auth',
  'cause.forbidden': 'next.forbidden',
  'cause.editmatch': 'next.editmatch',
  'cause.editambig': 'next.editambig',
  'cause.sandbox': 'next.sandbox',
  'cause.denied': 'next.denied',
  'cause.timeout': 'next.timeout',
  'cause.payload': 'next.payload',
  'cause.module': 'next.module',
  'cause.coderun': 'next.coderun',
  'cause.review': 'next.review',
  'cause.enoent': 'next.enoent',
  'cause.dns': 'next.net',
  'cause.refused': 'next.net',
  'cause.reset': 'next.net',
  'cause.gateway': 'next.gateway',
  'cause.jstype': 'next.jstype',
  'cause.syntax': 'next.syntax',
  'cause.notdir': 'next.notdir',
  'cause.inuse': 'next.inuse',
  'cause.busy': 'next.busy',
  'cause.pipe': 'next.pipe',
  'cause.command': 'next.command',
  'cause.encoding': 'next.encoding',
  'cause.sqlite': 'next.sqlite',
  'cause.yaml': 'next.yaml',
  'cause.json': 'next.json',
  'cause.eresolve': 'next.eresolve',
  'cause.npm': 'next.npm',
  'cause.oom': 'next.oom',
  'cause.cuda': 'next.cuda',
  'cause.port': 'next.port',
  'cause.tls': 'next.tls',
  'cause.nospace': 'next.nospace',
  'cause.readonly': 'next.readonly',
  'cause.mfile': 'next.mfile',
  'cause.killed': 'next.killed',
  'cause.nogit': 'next.nogit',
  'cause.missing': 'next.missing',
  'cause.traceback': 'next.traceback',
  'cause.abort': 'next.abort',
};

/* --- repair commands (start) --- */

    /**
     * The causes whose fix is a terminal command and not a reasoning step. The
     * card lists these under the advice, ready to copy: fixing a stuck port or a
     * missing module costs no model turn, so it should not need one.
     *
     * A cause whose repair needs judgement (a bad argument, a wrong anchor, an
     * unclear 4xx) stays out of this table — it belongs to the repair prompt,
     * where the agent can look at the real error first. The same holds for
     * anything that would touch files outside the workspace.
     *
     * {placeholders} are filled from the failure itself; one that cannot be read
     * stays visible in upper case, because silently substituting a guessed path
     * would send the reader to the wrong file.
     */
    const FIX_COMMANDS = {
      'cause.port': [
        'Get-NetTCPConnection -LocalPort {port} -ErrorAction SilentlyContinue | Select-Object -First 5 LocalAddress,OwningProcess',
      ],
      'cause.enoent': [
        "Test-Path -LiteralPath '{path}'",
        "Get-ChildItem -LiteralPath '{dir}' -Force | Select-Object -First 20 Name,Length",
      ],
      'cause.notdir': ["Get-Item -LiteralPath '{path}' | Select-Object FullName,PSIsContainer"],
      'cause.module': ['python -m pip install {module}'],
      'cause.command': ["Get-Command '{command}' -ErrorAction SilentlyContinue | Select-Object Name,Source", 'where.exe {command}'],
      'cause.nospace': [
        "Get-PSDrive -PSProvider FileSystem | Select-Object Name,@{n='FreeGB';e={[math]::Round($_.Free/1GB,1)}}",
      ],
      'cause.nogit': [
        'git rev-parse --show-toplevel',
        'Get-ChildItem -Force -Directory | Select-Object -First 20 Name',
      ],
      'cause.eresolve': ['pnpm install --no-strict-peer-dependencies'],
      'cause.npm': ['pnpm install'],
      'cause.encoding': ["Get-Content -LiteralPath '{path}' -Encoding UTF8 -TotalCount 5"],
      'cause.dns': ['Resolve-DnsName {host}'],
      'cause.refused': ['Test-NetConnection -ComputerName {host} -Port {port} -InformationLevel Quiet'],
      'cause.tls': ["curl.exe -vI '{url}' 2>&1 | Select-String -Pattern 'SSL|certificate|expire'"],
      'cause.webnet': ["curl.exe -sI --max-time 10 '{url}'"],
    };

    /**
     * The same repairs for a POSIX shell. Rendered only when the failure itself
     * points at one (a /abs/path, bash: or sh: text): a PowerShell line on a mac
     * is a command that fails, which is worse than no command at all.
     */
    const FIX_COMMANDS_POSIX = {
      'cause.port': ["ss -ltnp 'sport = :{port}' 2>/dev/null || lsof -nP -iTCP:{port} -sTCP:LISTEN"],
      'cause.enoent': ["test -e '{path}' && ls -ld '{path}' || ls -la '{dir}' | head -20"],
      'cause.notdir': ["ls -ld '{path}'"],
      'cause.module': ['python -m pip install {module}'],
      'cause.command': ['command -v {command} || type -a {command}'],
      'cause.nospace': ['df -h .'],
      'cause.nogit': ['git rev-parse --show-toplevel', 'ls -la | head -20'],
      'cause.eresolve': ['pnpm install --no-strict-peer-dependencies'],
      'cause.npm': ['pnpm install'],
      'cause.encoding': ["file '{path}' && head -c 200 '{path}' | iconv -f utf-8 -t utf-8 >/dev/null && echo utf8-ok"],
      'cause.dns': ['getent hosts {host} || nslookup {host}'],
      'cause.refused': ["timeout 5 bash -c 'exec 3<>/dev/tcp/{host}/{port}' && echo open || echo blocked"],
      'cause.tls': ["curl -vI '{url}' 2>&1 | grep -iE 'ssl|certificate|expire'"],
      'cause.webnet': ["curl -sI --max-time 10 '{url}'"],
    };

    function firstMatch(text, re) {
      if (typeof text !== 'string' || text === '') return '';
      const match = re.exec(text);
      return match === null ? '' : String(match[1] === undefined ? match[0] : match[1]).trim();
    }

    /**
     * The values a repair command needs, read from the failure itself. The call
     * arguments are the best source for a path — that is the exact string the
     * call was made with — and the raw body is the fallback for everything else.
     */
    function repairValues(record, raw) {
      const argPath =
        typeof record.path === 'string' && record.path !== ''
          ? record.path
          : typeof record.args === 'string'
            ? firstMatch(record.args, /"(?:path|file_path|filePath|file)"\s*:\s*"([^"]+)"/)
            : '';
      const path =
        argPath !== ''
          ? argPath
          : firstMatch(raw, /([A-Za-z]:\\[^\s"'`<>|*?]+)/) || firstMatch(raw, /(?:^|[\s'"])(\/[^\s'"]+)/);
      const dir =
        path === ''
          ? ''
          : path.replace(/[\\/][^\\/]*$/, '') || path;
      const url = firstMatch(raw, /(https?:\/\/[^\s'"`)\]<>]+)/);
      const hostFromUrl = firstMatch(url, /^https?:\/\/([^\/:?#]+)/);
      const host =
        hostFromUrl !== ''
          ? hostFromUrl
          : firstMatch(raw, /(?:getaddrinfo|resolve host|hostname|Name or service not known)[^\n]*?([a-z0-9][a-z0-9.-]*\.[a-z]{2,})/i);
      const port =
        firstMatch(raw, /:(\d{2,5})(?![\d])/) ||
        firstMatch(raw, /\bport\s+(\d{2,5})(?![\d])/i);
      const moduleName =
        firstMatch(raw, /No module named '?([\w.]+)'?/) ||
        firstMatch(raw, /(?:Cannot find module|ERR_MODULE_NOT_FOUND)[^\n'"]*['"]([^'"]+)['"]/);
      const command =
        firstMatch(raw, /([\w.-]+)[^\n]{0,40}(?:is not recognized as|不是内部或外部命令)/i) ||
        firstMatch(raw, /(?:command not found|找不到)[:\s]*([\w.-]+)/i);
      const unixPath = path.charAt(0) === '/';
      const windowsPath = /^[A-Za-z]:[\\/]/.test(path);
      const unixText = /\bash:|\/bin\/sh\b|\bsh: \d+:/i.test(raw) || /command not found/i.test(raw);
      const platform = windowsPath || (!unixPath && !unixText) ? 'ps' : 'posix';
      return { path, dir, url, host, port, module: moduleName, command, platform };
    }

    /**
     * The command lines for one card, or an empty list. A line whose value could
     * not be read from the failure is not shown at all: a half-filled command such
     * as Stop-Process -Id <PID> reads as an instruction and fails when run, which
     * is worse than offering no shortcut. Cards with such a cause keep the repair
     * prompt only.
     */
    function repairCommands(record, causeKey) {
      if (causeKey === null) return [];
      const raw = [record.detail, record.message, record.code, record.raw, record.args]
        .filter((part) => typeof part === 'string' && part !== '')
        .join('\n');
      const values = repairValues(record, raw);
      const table = values.platform === 'posix' ? FIX_COMMANDS_POSIX : FIX_COMMANDS;
      const templates = table[causeKey];
      if (templates === undefined) return [];
      let complete = true;
      const lines = templates.map((line) =>
        line.replace(/\{(\w+)\}/g, (whole, name) => {
          const value = values[name];
          if (typeof value === 'string' && value !== '') return value;
          complete = false;
          return '';
        }),
      );
      return complete ? lines : [];
    }

    /* --- repair commands (end) --- */

    function stripHintNoise(text) {
      if (typeof text !== 'string' || text === '') return '';
      return text
        .replace(/\[[^\]]*escalation available[^\]]*\]/gi, ' ')
        .replace(/retry this exact operation once with sandbox_permissions[^\n]* /gi, ' ');
    }

    /**
     * The cause of one record. Attribution reads the whole raw payload and not
     * only the visible summary: the class of a failure often appears only in the
     * untouched error body.
     */
    function causeKeyOf(record) {
      if (record === undefined || record === null) return null;
      const parts = [
        record.detail,
        record.message,
        record.code === null || record.code === undefined ? '' : String(record.code),
        record.raw,
      ];
      const text = parts
        .filter((part) => typeof part === 'string' && part !== '')
        .join('\n');
      return explainFailure(text);
    }

    /* --- error causes (end) --- */

    /** Volatile numbers, paths and whitespace must not split a repeated failure. */
    function normalizeRuleText(text) {
      return String(text)
        .replace(/[A-Za-z]:[\\/][^\s'"]*/g, '<PATH>')
        .replace(/\b[\w-]{8,}\b/g, '<ID>')
        .replace(/\d+/g, '#')
        .replace(/\s+/g, ' ')
        .trim();
    }

    const REGEXP_SPECIALS = ['\\', '.', '*', '+', '?', '^', '$', '{', '}', '(', ')', '|', '[', ']'];
    function escapeRegExp(text) {
      let out = text;
      for (const ch of REGEXP_SPECIALS) out = out.split(ch).join('\\' + ch);
      return out;
    }

    /** The fields a session rule is matched against. */
    function ruleHaystack(record) {
      if (record === undefined || record === null) return '';
      const parts = [
        record.message,
        record.code === null || record.code === undefined ? '' : String(record.code),
        record.tool,
        record.path,
        record.args,
        record.raw,
      ];
      return normalizeRuleText(
        parts.filter((part) => typeof part === 'string' && part !== '').join('\n').slice(0, 4000),
      );
    }

    /** A stable, escaped fragment of the failure text used as a rule pattern. */
    function sessionRulePattern(group) {
      return escapeRegExp(ruleHaystack(group).slice(0, 120));
    }

    /** First enabled rule that matches this failure, if any. */
    function matchSessionRule(record, rules) {
      if (!Array.isArray(rules) || rules.length === 0) return undefined;
      const haystack = ruleHaystack(record);
      if (haystack === '') return undefined;
      for (const rule of rules) {
        if (!isRecord(rule) || typeof rule.pattern !== 'string' || rule.pattern === '') continue;
        try {
          if (new RegExp(rule.pattern, 'i').test(haystack)) return rule;
        } catch {
          /* a broken user rule must not hide the built-in attribution */
        }
      }
      return undefined;
    }

    /** The tool a session rule was learned from, for display disambiguation. */
    function ruleToolOf(rule) {
      if (!isRecord(rule)) return '';
      if (typeof rule.tool === 'string' && rule.tool !== '') return rule.tool;
      const id = typeof rule.id === 'string' ? rule.id : '';
      const at = id.lastIndexOf('|');
      return at === -1 ? '' : id.slice(at + 1);
    }

    /**
     * The single description of one failure, shared by the card and the outgoing
     * prompt. A new source is taught here once instead of in two places.
     * Order: tool name, its target, then the most human detail available, falling
     * back to the bare code so an unknown failure is still identifiable.
     */
    function describeError(record) {
      const bits = [];
      if (typeof record.tool === 'string' && record.tool !== '') bits.push(record.tool);
      if (typeof record.path === 'string' && record.path !== '') bits.push(record.path);
      if (typeof record.child === 'string' && record.child !== '') bits.push('subagent ' + record.child.slice(0, 8));
      const head = bits.join(' · ');
      const code = typeof record.code === 'string' && record.code !== '' ? record.code : null;
      const detail = stripMarkup(typeof record.detail === 'string' ? record.detail : '');
      const tail = detail !== '' ? detail : code === null ? 'error' : '[' + code + ']';
      const shown = head === '' ? tail : head + ' — ' + tail;
      return shown.length <= 300 ? shown : shown.slice(0, 300) + '…';
    }

    /**
     * Keep both ends of a long text. The head says what failed and the tail says
     * why, because a stack trace keeps its root cause in the last line. A middle
     * cut would throw away exactly the line a reader needs.
     */
    function truncate(text, limit) {
      if (typeof text !== 'string') return '';
      if (text.length <= limit) return text;
      const head = Math.floor(limit * 0.6);
      const tail = limit - head;
      const dropped = text.length - head - tail;
      const marker = '\n...[' + dropped + ' chars omitted]...\n';
      return text.slice(0, head) + marker + text.slice(text.length - tail);
    }

    /**
     * Reduce a response body to its readable text. An HTML error page carries its
     * meaning in a few words and spends thousands of characters on conditional
     * comments, inline CSS and markup, so a digest must strip those first.
     * Anything that is not markup is returned unchanged.
     */
    function stripMarkup(text) {
      if (typeof text !== 'string' || text === '') return '';
      let out = text;
      if (/<[a-z!/][^>]*>/i.test(out)) {
        out = out.replace(/<script[\s\S]*?<\/script>/gi, ' ');
        out = out.replace(/<style[\s\S]*?<\/style>/gi, ' ');
        out = out.replace(/<!--[\s\S]*?-->/g, ' ');
        out = out.replace(/<[^>]+>/g, ' ');
      }
      out = out
        .replace(/&nbsp;/gi, ' ')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&amp;/gi, '&');
      return out.replace(/\s+/g, ' ').trim();
    }

    /**
     * Durable entries only: the live window tags them `'event'`, while a persisted
     * log line tags the same record `'durable'`, so both spellings are accepted.
     */
    function durableEvent(entry) {
      if (!isRecord(entry) || !isRecord(entry.event)) return undefined;
      if (entry.type !== 'event' && entry.type !== 'durable') return undefined;
      return entry.event;
    }

    /**
     * The one place that decides whether a durable event is a failure, and what
     * its smallest signature is. The fold and the sidebar badge both read it, so
     * a new failure type can never light one without the other.
     */
    function failureSignature(event) {
      if (!isRecord(event)) return undefined;
      const data = isRecord(event.data) ? event.data : {};
      const seq = Number(event.seq);
      if (!Number.isFinite(seq)) return undefined;
      if (event.type === 'turn/end') {
        if (!isRecord(data.reason) || data.reason.kind !== 'error') return undefined;
        return { seq, source: 'turn', text: messageOf(data.reason.error) };
      }
      if (event.type === 'tool/result') {
        const resultMessage = isRecord(data.message) ? data.message : undefined;
        const isErrorResult = resultMessage !== undefined && resultMessage.isError === true;
        const resultBody = resultText(data);
        if (!isRecord(data.error) && !isErrorResult) return undefined;
        const explicit =
          isRecord(data.error) && typeof data.error.reason === 'string' && data.error.reason !== ''
            ? data.error.reason
            : '';
        return { seq, source: 'tool', text: explicit !== '' ? explicit : resultBody };
      }
      if (event.type === 'user/message') {
        const notice = subagentNotice(data);
        if (notice === null) return undefined;
        return { seq, source: 'subagent', text: notice.text, notice };
      }
      if (event.type === 'command/done' && data.kind === 'error') {
        return {
          seq,
          source: 'command',
          text: typeof data.text === 'string' && data.text !== '' ? data.text : messageOf(data),
        };
      }
      return undefined;
    }

    /**
     * The repair handshake: after a "Fix it now" run, the agent appends a marker
     * line naming the seq it fixed. Reading it back is what closes the loop — the
     * card is ticked off without the user clicking anything, and a fix that was
     * never verified never emits the line, so nothing is marked by accident.
     */
    const FIXED_MARKER = /ERROR-MONITOR-FIXED\s+seq=(\d+)(?:\s+child=([A-Za-z0-9_.:-]+))?/g;

    /**
     * The seqs the agent reported as verified-fixed in its own messages. A child
     * card must name its child: child sequences restart at 1, so "seq=12" alone
     * would also tick off an unrelated parent failure with the same number.
     */
    function fixedSeqsIn(entries) {
      const parent = new Set();
      const children = new Map();
      if (!Array.isArray(entries)) return { parent, children };
      for (const entry of entries) {
        const event = durableEvent(entry);
        if (event === undefined || event.type !== 'assistant/message') continue;
        const data = isRecord(event.data) ? event.data : {};
        const message = isRecord(data.message) ? data.message : undefined;
        const content = message !== undefined && Array.isArray(message.content) ? message.content : [];
        let text = '';
        for (const part of content) {
          if (isRecord(part) && part.type === 'text' && typeof part.text === 'string') text += part.text + '\n';
        }
        if (text === '') continue;
        for (const match of text.matchAll(FIXED_MARKER)) {
          const seq = Number(match[1]);
          if (!Number.isFinite(seq)) continue;
          const child = typeof match[2] === 'string' ? match[2] : '';
          if (child === '') {
            parent.add(seq);
            continue;
          }
          const bucket = children.get(child) ?? new Set();
          bucket.add(seq);
          children.set(child, bucket);
        }
      }
      return { parent, children };
    }

    /**
     * Every failure this session recorded, read from its durable events:
     * a `turn/end` whose reason kind is `error` is a failed model call, a
     * `tool/result` carrying `error` is a failed tool, and a `command/done`
     * with kind `error` is a failed slash command.
     */
    function foldErrors(entries) {
      const records = [];
      if (!Array.isArray(entries)) return records;

      // A result only carries the call id, so names and target paths are indexed
      // from the matching tool/call first.
      const calls = new Map();
      for (const entry of entries) {
        const event = durableEvent(entry);
        if (event === undefined || event.type !== 'tool/call') continue;
        const data = isRecord(event.data) ? event.data : {};
        if (typeof data.callId !== 'string') continue;
        calls.set(data.callId, {
          name: typeof data.name === 'string' ? data.name : null,
          path: argumentPath(data.arguments),
          args: argumentSummary(data.arguments),
        });
      }

      // A turn error is often a provider rejecting the request before it emits
      // anything; the last completed request's usage is the closest size clue the
      // window holds, so it rides along on that card.
      let lastUsage = null;

      for (const entry of entries) {
        const event = durableEvent(entry);
        if (event === undefined) continue;
        const data = isRecord(event.data) ? event.data : {};
        const seq = Number(event.seq);
        const at = Number.isFinite(Number(event.time)) ? Number(event.time) : null;
        const turn = typeof data.turn === 'number' ? data.turn : null;

        if (event.type === 'assistant/message') {
          const usage = isRecord(data.usage) ? data.usage : null;
          if (usage !== null && typeof usage.inputTokens === 'number') {
            lastUsage = {
              input: usage.inputTokens,
              cache: typeof usage.cacheReadTokens === 'number' ? usage.cacheReadTokens : 0,
              output: typeof usage.outputTokens === 'number' ? usage.outputTokens : 0,
              seq,
            };
          }
          continue;
        }

        if (event.type === 'turn/end') {
          if (failureSignature(event) === undefined) continue;
          const raw = data.reason.error;
          const record = {
            id: 'turn:' + String(event.seq),
            seq,
            source: 'turn',
            turn,
            at,
            tool: null,
            path: null,
            step: typeof data.step === 'number' ? data.step : null,
            code: codeOf(raw),
            usage: lastUsage,
            detail: turnDetail(raw),
            raw: truncate(safeJson(raw), 8000),
          };
          record.cause = causeKeyOf(record);
          record.message = describeError(record);
          records.push(record);
          continue;
        }

        if (event.type === 'tool/result') {
          const failure = failureSignature(event);
          if (failure === undefined) continue;
          const error = data.error;
          const message = isRecord(data.message) ? data.message : undefined;
          const source = isRecord(message) && isRecord(message.source) ? message.source : undefined;
          const callId =
            typeof data.callId === 'string'
              ? data.callId
              : typeof message?.toolCallId === 'string'
                ? message.toolCallId
                : typeof source?.callId === 'string'
                  ? source.callId
                  : null;
          const call = callId !== null ? calls.get(callId) : undefined;
          const tool = call !== undefined ? call.name : null;
          const path = call !== undefined ? call.path : null;
          // The runtime reports a tool failure as a bare {name, code}; the human
          // sentence lives in the result message, so it has to travel with the
          // raw payload or "send the full raw" would hand over an empty error.
          const detailText = stripToolHints(failure.text);
          const record = {
            id: 'tool:' + String(event.seq),
            seq,
            source: 'tool',
            turn,
            step: typeof data.step === 'number' ? data.step : null,
            at,
            tool,
            path,
            args: call !== undefined ? call.args : null,
            code: codeOf(error),
            detail: detailText,
            raw: truncate(
              safeJson({
                tool,
                path,
                args: call !== undefined ? call.args : null,
                callId,
                error,
                message: detailText,
              }),
              8000,
            ),
          };
          record.cause = causeKeyOf(record);
          record.message = describeError(record);
          records.push(record);
          continue;
        }

        if (event.type === 'user/message') {
          const failure = failureSignature(event);
          const notice = failure === undefined ? null : failure.notice;
          if (notice !== null) {
            const record = {
              id: 'subagent:' + String(event.seq),
              seq,
              source: 'subagent',
              turn: null,
              at,
              tool: null,
              path: null,
              step: null,
              child: notice.child,
              code: null,
              detail: notice.text,
              raw: truncate(safeJson({ source: data.source, content: data.content }), 8000),
            };
            record.cause = causeKeyOf(record);
            record.message = describeError(record);
            records.push(record);
          }
          continue;
        }

        if (event.type === 'command/done') {
          const failure = failureSignature(event);
          if (failure === undefined) continue;
          const record = {
            id: 'command:' + String(event.seq),
            seq,
            source: 'command',
            turn: null,
            at,
            tool: typeof data.name === 'string' && data.name !== '' ? data.name : null,
            path: null,
            step: null,
            code: null,
            detail: failure.text,
            raw: truncate(safeJson(data), 8000),
          };
          record.cause = causeKeyOf(record);
          record.message = describeError(record);
          records.push(record);
        }
      }
      return records;
    }

    function mergeRuntimeNotice(records, notice, observedAt, stableSeq) {
      if (typeof notice !== 'string' || notice.trim() === '') return records;
      const text = notice.trim();
      for (const record of records) {
        if (record.message.indexOf(text) !== -1 || text.indexOf(record.message) !== -1) return records;
      }
      const runtimeRecord = {
        id: 'runtime:' + text,
        seq: stableSeq,
        source: 'runtime',
        turn: null,
        at: observedAt,
        tool: null,
        path: null,
        step: null,
        code: null,
        detail: text,
        raw: text,
        message: '',
      };
      runtimeRecord.cause = causeKeyOf(runtimeRecord);
      runtimeRecord.message = describeError(runtimeRecord);
      return records.concat([runtimeRecord]);
    }

    /**
     * A failure's position in the parent's ordering. A child generation keeps its
     * own seq space, so its slot in this session is the orderSeq the merge gave it;
     * reading the raw seq would compare two different clocks.
     */
    function watermarkOf(record) {
      return typeof record.orderSeq === 'number' ? record.orderSeq : record.seq;
    }

    function sortRecords(records) {
      return records.slice().sort((left, right) => {
        const l = typeof left.orderSeq === 'number' ? left.orderSeq : left.seq;
        const r = typeof right.orderSeq === 'number' ? right.orderSeq : right.seq;
        return r - l;
      });
    }

    /**
     * Failures that repeat verbatim are one problem, not many. A tool failing on
     * every step would otherwise bury everything else, so the card keeps the
     * newest copy and counts the rest.
     */
    /**
     * A cause already attributed during the fold is reused instead of re-running
     * the whole signature table on every render, filter and export.
     */
    function ownedCause(record) {
      if (record !== null && typeof record === 'object' && Object.prototype.hasOwnProperty.call(record, 'cause')) {
        return record.cause;
      }
      return causeKeyOf(record);
    }

    function groupKey(record) {
      // Child records carry their own sequence space; prefixing the key keeps two
      // children with the same failure from collapsing into one group. Parent keys
      // stay byte-for-byte identical so saved resolved marks keep working.
      const child = record.childId === undefined || record.childId === '' ? '' : String(record.childId) + String.fromCharCode(1);
      const cause = ownedCause(record);
      if (cause !== null) {
        return child + [
          record.source,
          cause,
          record.tool === null ? '' : String(record.tool),
          record.path === null ? '' : String(record.path),
        ].join(String.fromCharCode(1));
      }
      return child + [
        record.source,
        record.code === null ? '' : String(record.code),
        record.tool === null ? '' : String(record.tool),
        record.path === null ? '' : String(record.path),
        record.message,
      ].join(String.fromCharCode(1));
    }

    function groupRecords(records) {
      const groups = new Map();
      const grouped = [];
      for (const record of records) {
        const key = groupKey(record);
        const existing = groups.get(key);
        if (existing === undefined) {
          const copy = Object.assign({}, record, { count: 1, seqs: [record.seq], firstAt: record.at });
          groups.set(key, copy);
          grouped.push(copy);
          continue;
        }
        // The input is newest first, so the first copy already holds the newest
        // slot (a parent's seq, a child's orderSeq). A merge must never move it.
        existing.count += 1;
        existing.seqs.push(record.seq);
        // Records arrive newest first, so the last merge carries the oldest time.
        if (typeof record.at === 'number') existing.firstAt = record.at;
      }
      return grouped;
    }

    /**
     * How many identical failures turn an incident into a loop. Three is the
     * point where “just try again” has already been disproved twice, so the card
     * stops offering the same call and says what to change instead.
     */
    const LOOP_MIN_COUNT = 3;

    /**
     * A loop that changes its arguments every time still shows one tool and one
     * cause again and again. Identical-text counting misses it; counting the pair
     * catches the agent thrashing without merging unrelated failures that merely
     * share a tool.
     */
    const THRASH_MIN_COUNT = 3;

    function thrashKeyOf(group) {
      const tool = typeof group.tool === 'string' ? group.tool : '';
      const cause = typeof group.cause === 'string' ? group.cause : '';
      return tool === '' || cause === '' ? '' : tool + String.fromCharCode(0) + cause;
    }

    function pad(value) {
      return String(value).padStart(2, '0');
    }

    /**
     * An absolute stamp, never a bare clock: a record can outlive the day it was
     * written, and the full date is what makes two runs comparable.
     */
    function formatTime(at) {
      if (typeof at !== 'number' || !Number.isFinite(at)) return '';
      const date = new Date(at);
      if (Number.isNaN(date.getTime())) return '';
      const day = date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
      const clock = pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
      return day + ' ' + clock;
    }

    /**
     * A spoken distance for hover titles; the card keeps the absolute stamp.
     */
    function relTime(at, t) {
      if (typeof at !== 'number' || !Number.isFinite(at)) return '';
      const diff = Date.now() - at;
      if (diff < 0) return '';
      const minute = 60000;
      const hour = 60 * minute;
      const day = 24 * hour;
      if (diff < minute) return t('time.now');
      if (diff < hour) return t('time.min', { n: Math.floor(diff / minute) });
      if (diff < day) return t('time.hour', { n: Math.floor(diff / hour) });
      return t('time.day', { n: Math.min(99, Math.floor(diff / day)) });
    }

    /** 180346 → '180.3K' so a scale line never wraps the card. */
    function formatTokens(value) {
      if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return '';
      if (value < 1000) return String(value);
      const thousands = value / 1000;
      const shown = thousands >= 100 ? Math.round(thousands) : Math.round(thousands * 10) / 10;
      return String(shown) + 'K';
    }

    /** 179912 → '179,912' — the compact form above hides the exact figure. */
    function formatCount(value) {
      if (typeof value !== 'number' || !Number.isFinite(value)) return '0';
      return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /* --------------------------------------------------------------- styles */

    const CSS = `
.emx-root { display: flex; flex-direction: column; height: 100%; min-height: 0; color: var(--dsw-alias-label-primary); font-size: 13px; line-height: 20px; }
.emx-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px; row-gap: 4px; padding: 12px 14px 8px; flex: none; }
.emx-headTitle { font-weight: 600; font-size: 13px; }
.emx-headMeta { color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.emx-banner { position: sticky; top: 0; z-index: 1; margin: 0 14px 10px; padding: 8px 10px; border-radius: var(--dsw-radius-md); border: 1px solid var(--dsw-alias-state-error-primary); background-color: var(--dsw-alias-bg-base); background-image: linear-gradient(color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent), color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent)); display: flex; align-items: center; gap: 8px; flex: none; }
.emx-bannerText { flex: 1; min-width: 0; color: var(--dsw-alias-label-primary); font-weight: 500; }
.emx-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--dsw-alias-state-error-primary); flex: none; }
.emx-list { flex: 1; min-height: 0; overflow: auto; padding: 0 14px 14px; display: flex; flex-direction: column; gap: 8px; }
.emx-card { border: 1px solid var(--dsw-alias-border-l2); border-radius: var(--dsw-radius-md); background: var(--dsw-alias-bg-module-platform); padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; }
.emx-cardNew { border-color: var(--dsw-alias-state-error-primary); box-shadow: 0 0 0 1px color-mix(in srgb, var(--dsw-alias-state-error-primary) 40%, transparent); }
.emx-cardResolved { opacity: 0.72; border-style: dashed; }
.emx-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.emx-badge { font-size: 11px; line-height: 16px; padding: 1px 6px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l3); color: var(--dsw-alias-label-secondary); }
.emx-badgeError { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); }
.emx-newTag { font-size: 10px; line-height: 14px; padding: 0 5px; border-radius: 999px; background: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-bg-base); font-weight: 600; }
.emx-meta { color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.emx-filters { display: flex; align-items: center; gap: 6px; padding: 0 14px 8px; flex-wrap: wrap; flex: none; }
.emx-autoRules { display: inline-flex; align-items: center; gap: 8px; min-width: 0; flex: 1 1 auto; }
.emx-autoRulesHint { color: var(--dsw-alias-label-tertiary); font-size: 11px; line-height: 16px; }
.emx-docsTrigger { flex: none; }
.emx-docsPanel { flex: none; display: grid; gap: 1px; max-height: 268px; overflow: auto; padding: 2px 14px 10px; border-bottom: 1px solid var(--dsw-alias-border-l1); }
.emx-docsGroup { padding: 6px 0 2px; color: var(--dsw-alias-label-tertiary); font-size: 10px; line-height: 14px; letter-spacing: 0.06em; text-transform: uppercase; }
.emx-docRow { display: grid; grid-template-columns: 84px 1fr; gap: 10px; padding: 2px 0; font-size: 12px; line-height: 17px; }
.emx-docName { color: var(--dsw-alias-label-primary); }
.emx-docText { color: var(--dsw-alias-label-secondary); }
.emx-chip { font: inherit; font-size: 11px; line-height: 16px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l2); background: transparent; color: var(--dsw-alias-label-tertiary); cursor: pointer; }
.emx-chip:hover { border-color: var(--dsw-alias-border-l3); color: var(--dsw-alias-label-primary); }
.emx-chipActive { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); }
.emx-switch { display: inline-flex; align-items: center; gap: 6px; border: 0; padding: 0; background: transparent; color: var(--dsw-alias-label-tertiary); font: inherit; font-size: 11px; line-height: 16px; cursor: pointer; }
.emx-switchTrack { position: relative; width: 26px; height: 15px; border-radius: 999px; background: var(--dsw-alias-border-l2); transition: background .15s; flex: none; }
.emx-switchThumb { position: absolute; top: 2px; left: 2px; width: 11px; height: 11px; border-radius: 50%; background: var(--dsw-alias-label-primary); transition: transform .15s; }
.emx-switchOn { color: var(--dsw-alias-label-primary); }
.emx-switchOn .emx-switchTrack { background: var(--dsw-alias-state-success-primary); }
.emx-switchOn .emx-switchThumb { transform: translateX(11px); }
.emx-badgeCount { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); }
.emx-badgeLoop { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); font-weight: 600; }
.emx-badgeResolved { border-color: var(--dsw-alias-state-success-primary); color: var(--dsw-alias-state-success-primary); }
.emx-metaSpacer { flex: 1; }
.emx-message { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-primary); white-space: pre-wrap; word-break: break-word; background: var(--dsw-alias-bg-base); border: 1px solid var(--dsw-alias-border-l1); border-radius: var(--dsw-radius-sm); padding: 6px 8px; max-height: 132px; overflow: auto; }
.emx-cause { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); padding-left: 8px; border-left: 2px solid var(--dsw-alias-state-error-primary); }
.emx-next { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-primary); padding-left: 8px; border-left: 2px solid var(--dsw-alias-state-success-primary); }
.emx-childHint { font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-secondary); padding-left: 8px; }
.emx-thrashHint { font-size: 11px; line-height: 16px; color: var(--dsw-alias-state-error-primary); padding-left: 8px; }
.emx-bannerQuiet { border-style: dashed; border-color: var(--dsw-alias-label-secondary); background-image: none; background-color: transparent; }
.emx-bannerQuiet .emx-bannerText { color: var(--dsw-alias-label-secondary); font-weight: 400; }
.emx-badgeFatal { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); font-weight: 600; }
.emx-badgeRecover { color: var(--dsw-alias-label-tertiary); }
.emx-badgeNote { color: var(--dsw-alias-label-secondary); border-style: dashed; }
.emx-disp { font-weight: 600; }
.emx-dispRule { border-color: var(--dsw-alias-state-success-primary); color: var(--dsw-alias-state-success-primary); }
.emx-dispManual { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); }
.emx-dispSelfheal { color: var(--dsw-alias-label-tertiary); border-style: dashed; }
.emx-noteFold { margin-top: 4px; padding-top: 8px; border-top: 1px dashed var(--dsw-alias-border-l2); display: flex; flex-direction: column; gap: 6px; }
.emx-quietSection { display: flex; flex-direction: column; gap: 6px; }
.emx-quietTitle { font-size: 11px; color: var(--dsw-alias-label-tertiary); font-weight: 500; }
.emx-noteToggle { align-self: flex-start; background: none; border: none; padding: 0; color: var(--dsw-alias-label-tertiary); font-size: 12px; cursor: pointer; }
.emx-noteToggle:hover { color: var(--dsw-alias-label-primary); }
.emx-noteHint { font-size: 12px; color: var(--dsw-alias-label-tertiary); }
.emx-noteList { display: flex; flex-direction: column; gap: 8px; }
.emx-args { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); white-space: pre-wrap; word-break: break-word; padding: 0 8px; max-height: 76px; overflow: auto; }
.emx-scale { color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.emx-rawToggle { align-self: flex-start; background: none; border: none; padding: 0; color: var(--dsw-alias-label-secondary); font-size: 12px; cursor: pointer; }
.emx-rawToggle:hover { color: var(--dsw-alias-label-primary); }
.emx-raw { margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; line-height: 16px; white-space: pre-wrap; word-break: break-word; max-height: 220px; overflow: auto; color: var(--dsw-alias-label-secondary); }
.emx-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.emx-btn { font: inherit; font-size: 12px; line-height: 18px; padding: 3px 10px; border-radius: var(--dsw-radius-md); border: 1px solid var(--dsw-alias-border-l2); background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; }
.emx-btn:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.emx-btn:disabled { opacity: 0.55; cursor: default; }
.emx-btnQuiet { border-color: transparent; color: var(--dsw-alias-label-tertiary); }
.emx-btnQuiet:hover { border-color: var(--dsw-alias-border-l2); }
.emx-state { color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.emx-stateError { color: var(--dsw-alias-state-error-primary); }
.emx-empty { padding: 20px 14px; color: var(--dsw-alias-label-tertiary); display: flex; flex-direction: column; gap: 6px; }
.emx-emptyTitle { color: var(--dsw-alias-label-secondary); font-weight: 500; }
.emx-loadOlder { display: flex; align-items: center; gap: 8px; padding: 0 14px 10px; flex: none; }
.emx-rowAlert { display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; color: var(--dsw-alias-state-error-primary); }
.emx-btnFix { border-color: var(--dsw-alias-state-success-primary); color: var(--dsw-alias-state-success-primary); }
.emx-btnFix:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-state-success-primary); border-color: var(--dsw-alias-state-success-primary); }
.emx-fix { display: flex; flex-direction: column; gap: 4px; padding: 6px 8px; border: 1px solid var(--dsw-alias-border-l2); border-radius: var(--dsw-radius-md); background: var(--dsw-alias-bg-l2); }
.emx-fixHead { display: flex; align-items: center; gap: 8px; font-size: 12px; line-height: 18px; }
.emx-fixLabel { font-weight: 600; color: var(--dsw-alias-label-primary); }
.emx-fixHint { color: var(--dsw-alias-label-tertiary); font-size: 11px; }
.emx-fixCode { margin: 0; font-size: 11.5px; line-height: 17px; white-space: pre-wrap; word-break: break-all; color: var(--dsw-alias-label-primary); font-family: ui-monospace, SFMono-Regular, Consolas, 'Courier New', monospace; }
.emx-rules { margin: 0 14px 10px; border: 1px dashed var(--dsw-alias-border-l3); border-radius: var(--dsw-radius-md); overflow: hidden; flex: none; }
.emx-rulesToggle { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 10px; background: transparent; border: none; color: var(--dsw-alias-label-secondary); font-size: 12px; text-align: left; cursor: pointer; }
.emx-rulesToggle:hover { background: var(--dsw-alias-interactive-bg-hover); }
.emx-rulesArrow { margin-left: auto; color: var(--dsw-alias-label-tertiary); }
.emx-rulesList { display: flex; flex-direction: column; gap: 6px; padding: 0 10px 8px; }
.emx-rule { padding: 6px 8px; border-radius: var(--dsw-radius-md); background: var(--dsw-alias-bg-l2); font-size: 12px; line-height: 18px; }
.emx-ruleHead { display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
.emx-ruleCause { color: var(--dsw-alias-label-primary); }
.emx-ruleTool { color: var(--dsw-alias-label-tertiary); font-size: 11px; }
.emx-ruleNext { color: var(--dsw-alias-label-secondary); }
`;

    function StyleTag() {
      return h('style', { dangerouslySetInnerHTML: { __html: CSS } });
    }

    function GuideIcon() {
      return h(
        'svg',
        { viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': true, className: 'emx-guideIcon' },
        h('path', {
          d: 'M8 1.6 15 14H1L8 1.6Zm0 3.6a.9.9 0 0 0-.9.95l.3 3.5a.6.6 0 0 0 1.2 0l.3-3.5A.9.9 0 0 0 8 5.2Zm0 6.1a.95.95 0 1 0 0 1.9.95.95 0 0 0 0-1.9Z',
          fill: 'currentColor',
        }),
      );
    }

    /* ------------------------------------------------------------- components */

    function mount(ctx) {
      const slots = ctx.slots;

      function ErrorItem(props) {
        const { record, t, locale, isNew, session, onHandled, sessionId, resolved, onResolve, onUnresolve, note, childFailures, thrashCount } = props;
        const sessionRef =
          typeof record.childId === 'string' && record.childId !== ''
            ? record.childId
            : typeof sessionId === 'string' && sessionId !== ''
              ? sessionId
              : session !== undefined && typeof session.id === 'string'
                ? session.id
                : '';
        const [open, setOpen] = useState(false);
        const [copyState, setCopyState] = useState('');
        const [sendState, setSendState] = useState('');
        const [fixCopyState, setFixCopyState] = useState('');
        // The mark hangs off the group key, so every repeat of this cause follows.
        const onToggleResolved = useCallback(() => {
          const key = groupKey(record);
          if (resolved) {
            if (typeof onUnresolve === 'function') onUnresolve(key);
          } else {
            if (typeof onResolve === 'function') onResolve(key, watermarkOf(record));
          }
        }, [resolved, onResolve, onUnresolve, record]);
        const timer = useRef(null);

        useEffect(
          () => () => {
            if (timer.current !== null) window.clearTimeout(timer.current);
          },
          [],
        );

        const label =
          record.source === 'runtime'
            ? t('item.source.runtime')
            : record.source === 'tool'
              ? t('item.source.tool')
              : record.source === 'command'
                ? t('item.source.command')
                : record.source === 'subagent'
                  ? t('item.source.subagent')
                  : t('item.source.turn');
        const turnText =
          record.turn === null ? t('item.turnUnknown') : t('item.turn', { n: String(record.turn) });
        const timeText = formatTime(record.at);
        const repeats = typeof record.count === 'number' && record.count > 1;
        const firstText = repeats ? formatTime(record.firstAt) : '';
        // A count on its own reads as “busy”; the point of it is that the method
        // is already proven wrong. From the third identical failure the card says
        // so, and the advice stops offering the same call again.
        const loop = repeats && record.count >= LOOP_MIN_COUNT;
        // How this failure is handled, kept in sync with the rule-learning
        // effect and the note-group split so the badge never promises
        // something the panel does not actually do.
        const canRule =
          record.fromChild !== true &&
          record.source !== 'turn' &&
          record.source !== 'subagent' &&
          ((typeof record.count === 'number' && record.count >= LOOP_MIN_COUNT) ||
            (typeof thrashCount === 'number' && thrashCount >= THRASH_MIN_COUNT));
        const disposition = resolved ? '' : note ? 'selfheal' : canRule ? 'rule' : 'manual';

        // A provider can reject a request before emitting anything, so no usage is
        // recorded for it; the previous completed request's size is the closest clue.
        const scaleText = useMemo(() => {
          const usage = record.usage;
          if (usage === undefined || usage === null) return '';
          const tokens = formatTokens(usage.input + usage.cache);
          if (tokens === '') return '';
          return usage.cache > 0
            ? t('item.scale', { tokens, input: formatCount(usage.input), cache: formatCount(usage.cache) })
            : t('item.scaleNoCache', { tokens, input: formatCount(usage.input) });
        }, [record.usage, t]);

        // Attribution reads the whole raw payload, not just the visible summary.
        const causeKey = useMemo(() => ownedCause(record), [record]);
        const sessionRules = useSessionRules(sessionRef);
        const customRule = useMemo(() => matchSessionRule(record, sessionRules), [record, sessionRules]);
        const causeText = customRule
          ? (locale === 'zh' ? customRule.causeZh : customRule.causeEn) || ''
          : causeKey === null
            ? ''
            : t(causeKey);
        // A cause whose fix is a terminal command carries those lines here, so
        // the step can be repaired without spending a model turn.
        const fixCommands = useMemo(() => repairCommands(record, causeKey), [record, causeKey]);

        // A turn error kills the turn; everything else leaves the session usable.
        const isFatal = record.source === 'turn';
        const plainNext = customRule
          ? (locale === 'zh' ? customRule.nextZh : customRule.nextEn) || ''
          : t((causeKey !== null && NEXT_ACTIONS[causeKey]) || 'next.default');
        const nextText = loop && !customRule ? t('next.loop', { next: plainNext }) : plainNext;

        // The arguments the call was made with are the scene of the failure.
        const argsText =
          typeof record.args === 'string' && record.args !== ''
            ? t('item.args', { args: record.args })
            : '';

        const detail = useMemo(() => {
          const lines = ['[' + label + ']'];
          lines.push(turnText);
          if (timeText !== '') lines.push(timeText);
          if (record.code !== null) lines.push(t('item.code', { code: record.code }));
          if (causeText !== '') lines.push(t('item.cause', { cause: causeText }));
          if (loop) lines.push(t('item.loop', { n: String(record.count) }));
          if (argsText !== '') lines.push(argsText);
          if (scaleText !== '') lines.push(scaleText);
          if (repeats) {
            // A failure repeating dozens of times would make this line run for
            // paragraphs; five samples plus the total says as much.
            const seqList =
              record.seqs.length <= 5
                ? record.seqs.join(', ')
                : record.seqs.slice(0, 5).join(', ') + ' …(' + String(record.seqs.length) + ')';
            lines.push(t('item.seqs', { seqs: seqList }));
          }
          else lines.push('seq=' + String(record.seq));
          lines.push('');
          // Copying is free, so the clipboard always carries the complete raw error.
          lines.push(record.raw);
          return lines.join('\n');
        }, [label, turnText, timeText, record.code, causeText, argsText, scaleText, record.raw, record.seq, repeats, record.seqs, loop, record.count, t]);

        const onCopy = useCallback(async () => {
          try {
            if (navigator.clipboard !== undefined && typeof navigator.clipboard.writeText === 'function') {
              await navigator.clipboard.writeText(detail);
            } else {
              throw new Error('clipboard unavailable');
            }
            setCopyState(t('item.copied'));
          } catch {
            setCopyState(t('item.copyFailed'));
          }
          if (timer.current !== null) window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setCopyState(''), 2200);
        }, [detail, t]);

        // Sending costs tokens, so the default message is a short digest plus the
        // event address; the full raw is one deliberate extra click away.
        // The card and the prompt read the same text; no second formatting pass.
        const summary =
          (record.message === '' ? truncate(stripMarkup(record.raw), 300) : record.message) +
          (repeats ? ' (×' + record.count + ')' : '') +
          (loop ? ' — ' + t('item.loopBadge', { n: String(record.count) }) : '');
        const sendPrompt = useCallback(
          async (templateKey, extra) => {
            if (session === undefined) return;
            // A child generation's failures live in the child's own transcript:
            // handing the agent the parent id makes it read the wrong event.
            const childId = record.fromChild && typeof record.childId === 'string' ? record.childId : '';
            const marker = 'ERROR-MONITOR-FIXED seq=' + String(record.seq) + (childId === '' ? '' : ' child=' + childId);
            setSendState('sending');
            const text = t(templateKey, {
              source: label,
              turn: record.turn === null ? t('send.unknown') : t('send.turn', { n: String(record.turn) }),
              time: timeText === '' ? t('send.unknown') : timeText,
              code: record.code === null ? t('send.unknown') : record.code,
              tool: record.tool === null ? t('send.unknown') : record.tool,
              summary,
              seq: String(record.seq),
              cause: causeKey === null ? t('cause.unknown') : causeText,
              args: argsText === '' ? t('send.unknown') : record.args,
              sessionId: childId === '' ? sessionRef : childId,
              childNote: childId === '' ? '' : t('send.childNote', { id: childId }),
              marker,
              verifyStep: childId === '' ? t('send.verifyParent') : t('send.verifyChild'),
              ...extra,
            });
            try {
              const result = await session.prompt([{ type: 'text', text }], 'queue');
              const failed = result !== undefined && result.ok === false;
              setSendState(failed ? 'failed' : 'sent');
              // Handing the failure to the agent is the strongest sign it was read.
              if (!failed && typeof onHandled === 'function') onHandled(watermarkOf(record));
            } catch {
              setSendState('failed');
            }
            if (timer.current !== null) window.clearTimeout(timer.current);
            timer.current = window.setTimeout(() => setSendState(''), 3200);
          },
          [session, label, record.turn, record.code, record.tool, record.seq, timeText, summary, causeKey, causeText, argsText, record.args, record.fromChild, record.childId, sessionRef, t],
        );

        const onSendFull = useCallback(
          () => sendPrompt('send.promptFull', { raw: truncate(record.raw, 4000) }),
          [sendPrompt, record.raw],
        );
        // The repair prompt asks for the fix, not another diagnosis: same scene,
        // the advice, the commands when there are any, and an explicit order
        // (read the raw event, act, verify by rerunning this call).
        const onFix = useCallback(
          () => {
            // A manual fix already carries the same advice as the automatic reminder.
            // Keep the rule in the list, but suppress the reminder: mark both locales
            // so a later UI-language switch cannot re-announce it.
            if (sessionRef !== '' && causeKey !== null) {
              const ruleId = String(causeKey) + '|' + String(record.tool === null || record.tool === undefined ? '' : record.tool);
              const ledger = readInjectedRules(sessionRef);
              ledger[ruleId + '|zh'] = Date.now();
              ledger[ruleId + '|en'] = Date.now();
              writeInjectedRules(sessionRef, ledger);
            }
            return sendPrompt('send.fix', {
              next: nextText,
              fixes: fixCommands.length === 0 ? t('send.fixNone') : fixCommands.join('\n'),
            });
          },
          [sendPrompt, nextText, fixCommands, t, sessionRef, causeKey, record.tool],
        );
        const onCopyFix = useCallback(async () => {
          try {
            if (navigator.clipboard !== undefined && typeof navigator.clipboard.writeText === 'function') {
              await navigator.clipboard.writeText(fixCommands.join('\n'));
            } else {
              throw new Error('clipboard unavailable');
            }
            setFixCopyState(t('item.fixCopied'));
          } catch {
            setFixCopyState(t('item.fixCopyFailed'));
          }
          if (timer.current !== null) window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setFixCopyState(''), 2200);
        }, [fixCommands, t]);

        const statusText =
          sendState === 'sending'
            ? t('item.sending')
            : sendState === 'sent'
              ? t('item.sent')
              : sendState === 'failed'
                ? t('item.sendFailed')
                : '';

        return h(
          'article',
          { className: 'emx-card' + (isNew ? ' emx-cardNew' : '') + (resolved ? ' emx-cardResolved' : '') },
          h(
            'div',
            { className: 'emx-row' },
            h('span', { className: 'emx-badge' + (note ? ' emx-badgeNote' : ' emx-badgeError') }, note ? t('item.noteBadge') : label),
            disposition === 'rule'
              ? h('span', { className: 'emx-badge emx-disp emx-dispRule', title: t('item.disposition.ruleHint') }, t('item.disposition.rule'))
              : disposition === 'manual'
                ? h('span', { className: 'emx-badge emx-disp emx-dispManual', title: t('item.disposition.manualHint') }, t('item.disposition.manual'))
                : disposition === 'selfheal'
                  ? h('span', { className: 'emx-badge emx-disp emx-dispSelfheal', title: t('item.disposition.selfhealHint') }, t('item.disposition.selfheal'))
                  : null,
            record.childId !== undefined && record.childId !== ''
              ? h('span', { className: 'emx-badge' }, t('item.fromChild', { id: String(record.childId).slice(0, 8) }))
              : null,
            resolved ? h('span', { className: 'emx-badge emx-badgeResolved', title: t('item.resolvedHint') }, t('item.resolved')) : null,
            isFatal
              ? h('span', { className: 'emx-badge emx-badgeFatal' }, t('item.fatal'))
              : note
                ? null
                : h('span', { className: 'emx-badge emx-badgeRecover' }, t('item.recover')),
            repeats ? h('span', { className: 'emx-badge emx-badgeCount' }, '×' + String(record.count)) : null,
            loop ? h('span', { className: 'emx-badge emx-badgeLoop' }, t('item.loopBadge', { n: String(record.count) })) : null,
            record.tool === null ? null : h('span', { className: 'emx-badge' }, record.tool),
            h('span', { className: 'emx-badge' }, turnText),
            isNew ? h('span', { className: 'emx-newTag' }, t('new.tag')) : null,
            h('span', { className: 'emx-metaSpacer' }),
            record.code !== null ? h('span', { className: 'emx-meta' }, t('item.code', { code: record.code })) : null,
            firstText !== ''
              ? h('span', { className: 'emx-meta', title: relTime(record.firstAt, t) }, t('item.since', { time: firstText }))
              : null,
            timeText !== ''
              ? h(
                  'time',
                  { className: 'emx-meta', title: relTime(record.at, t) },
                  repeats ? t('item.latest', { time: timeText }) : timeText,
                )
              : null,
          ),
          h('div', { className: 'emx-message' }, record.message === '' ? record.raw : record.message),
          customRule === undefined
            ? null
            : h('span', { className: 'emx-meta' }, t('rule.badge')),
          causeText === ''
            ? null
            : h('div', { className: 'emx-cause' }, t('item.cause', { cause: causeText })),
          h('div', { className: 'emx-next' }, t('item.next', { next: nextText })),
        childFailures > 0
          ? h('div', { className: 'emx-childHint' }, t('item.childHint', { n: String(childFailures) }))
          : null,
          thrashCount >= THRASH_MIN_COUNT
            ? h('div', { className: 'emx-thrashHint' }, t('item.thrashHint', { n: String(thrashCount) }))
            : null,
          fixCommands.length === 0 || note
            ? null
            : h(
                'div',
                { className: 'emx-fix' },
                h(
                  'div',
                  { className: 'emx-fixHead' },
                  h('span', { className: 'emx-fixLabel' }, t('item.fixCmd')),
                  h('span', { className: 'emx-fixHint' }, t('item.fixCmdHint')),
                  h('span', { className: 'emx-metaSpacer' }),
                  h(
                    'button',
                    { type: 'button', className: 'emx-btn emx-btnQuiet', onClick: onCopyFix },
                    fixCopyState === '' ? t('item.fixCopy') : fixCopyState,
                  ),
                ),
                h('pre', { className: 'emx-fixCode' }, fixCommands.join('\n')),
              ),
          argsText === '' ? null : h('div', { className: 'emx-args' }, argsText),
          scaleText === '' ? null : h('div', { className: 'emx-scale' }, scaleText),
          h(
            'button',
            {
              type: 'button',
              className: 'emx-rawToggle',
              onClick: () => setOpen((value) => !value),
              'aria-expanded': open,
            },
            open ? t('item.collapse') : t('item.expand'),
          ),
          !open
            ? null
            : h(
                'div',
                null,
                h('div', { className: 'emx-meta' }, t('item.raw')),
                h('pre', { className: 'emx-raw' }, record.raw),
                h(
                  'button',
                  { type: 'button', className: 'emx-btn emx-btnQuiet', onClick: onSendFull, disabled: session === undefined || sendState === 'sending' },
                  t('item.sendFull'),
                ),
              ),
          h(
            'div',
            { className: 'emx-actions' },
            h(
              'button',
              {
                type: 'button',
                className: 'emx-btn emx-btnFix',
                onClick: onFix,
                disabled: session === undefined || sendState === 'sending',
                title: t('item.fixHint'),
              },
              t('item.fix'),
            ),
            h('button', { type: 'button', className: 'emx-btn', onClick: onCopy }, copyState === '' ? t('item.copy') : copyState),
            h(
              'button',
              { type: 'button', className: 'emx-btn emx-btnQuiet', onClick: onToggleResolved },
              resolved ? t('item.unresolve') : t('item.resolve'),
            ),

            statusText === ''
              ? null
              : h('span', { className: 'emx-state' + (sendState === 'failed' ? ' emx-stateError' : '') }, statusText),
          ),
        );
      }

      function DocsBody(props) {
        const t = props.t;
        const cardKeys = ['disposition', 'note', 'fix', 'copy', 'resolve', 'fixcmd'];
        const barKeys = ['report', 'search', 'source', 'unresolved', 'unread', 'markAll', 'loadOlder'];
        const row = (section, key) =>
          h(
            'div',
            { key: section + '.' + key, className: 'emx-docRow' },
            h('span', { className: 'emx-docName' }, t('docs.' + key + '.name')),
            h('span', { className: 'emx-docText' }, t('docs.' + key + '.desc')),
          );
        return h(
          'div',
          { className: 'emx-docsPanel' },
          h('div', { className: 'emx-docsGroup' }, t('docs.groupCard')),
          cardKeys.map((key) => row('card', key)),
          h('div', { className: 'emx-docsGroup' }, t('docs.groupBar')),
          barKeys.map((key) => row('bar', key)),
        );
      }

      function Monitor(props) {
        const locale = normalizeLocale(useActiveLocale(ctx));
        const t = useMemo(() => translator(locale), [locale]);

        // The View seat hands this Session over as `sessionId`; a body rendered by
        // another seat may still carry `monitorSessionId`.
        const given = typeof props.monitorSessionId === 'string' && props.monitorSessionId !== ''
          ? props.monitorSessionId
          : typeof props.sessionId === 'string' && props.sessionId !== ''
            ? props.sessionId
            : undefined;

        const sessionId = given;
        const sessionRules = useSessionRules(sessionId === undefined ? '' : sessionId);
        const { session, records, childRecords, childOverflow, seenChildren, fixedSeqs, topSeq, seen, unread, markRead, markReadThrough, hasMore, loadingOlder, loadOlder } =
          useErrorFeed(ctx, sessionId, { baseline: true });
        const grouped = useMemo(() => groupRecords(sortRecords(records.concat(childRecords))), [records, childRecords]);
        const childCountById = useMemo(() => {
          const counts = new Map();
          for (const record of childRecords) {
            if (typeof record.childId === 'string') counts.set(record.childId, (counts.get(record.childId) ?? 0) + 1);
          }
          return counts;
        }, [childRecords]);
        const childFailuresOf = useCallback(
          (record) => (typeof record.child === 'string' ? childCountById.get(record.child) ?? 0 : 0),
          [childCountById],
        );
        const totalCount = records.length + childRecords.length;
        const [sourceFilter, setSourceFilter] = useState('all');
        const [unreadOnly, setUnreadOnly] = useState(false);
        // The resolved marks ride the group key, so one click covers every repeat
        // of the same root cause and survives a restart.
        const resolvedMap = useResolvedMap(sessionId);
        // Default ON: resolved cards start folded; storing 0 turns the fold off.
        const [hideResolved, setHideResolved] = useState(() => readNumber(HIDE_RESOLVED_KEY) !== 0);
        // Default OFF: automatic rule learning + injection is opt-in.
        const [autoRules, setAutoRules] = useState(() => readNumber(AUTO_RULES_KEY) === 1);
        // One click hands the current (filtered) view to the clipboard as a
        // Markdown report a fresh session can digest.
        const [reportState, setReportState] = useState('');
        const reportTimer = useRef(null);
        // A very long session must not mount hundreds of raw-carrying cards at
        // once; the list renders a window and grows one notch per click.
        const [renderLimit, setRenderLimit] = useState(50);
        const [docsOpen, setDocsOpen] = useState(false);
        const counts = useMemo(() => {
          const map = new Map();
          for (const group of grouped) map.set(group.source, (map.get(group.source) ?? 0) + 1);
          return map;
        }, [grouped]);
        const resolvedCount = useMemo(
          () => grouped.reduce((sum, group) => (resolvedMap[groupKey(group)] === undefined ? sum : sum + 1), 0),
          [grouped, resolvedMap],
        );
        // Closing the loop: the agent appends `ERROR-MONITOR-FIXED seq=N` only
        // after the same call was rerun and verified, so a group containing that
        // seq can be ticked off here instead of waiting for a click. A mark the
        // user already made is left alone — their state wins.
        useEffect(() => {
          if (fixedSeqs === undefined || (fixedSeqs.parent.size === 0 && fixedSeqs.children.size === 0)) return;
          const ledger = readAutoFix(sessionId);
          let changed = false;
          let ticked = 0;
          for (const group of records.concat(childRecords)) {
            const seqs = Array.isArray(group.seqs) && group.seqs.length > 0 ? group.seqs : [group.seq];
            const key = groupKey(group);
            const applied = Array.isArray(ledger[key]) ? ledger[key] : [];
            const childId = typeof group.childId === 'string' ? group.childId : '';
            const reported = childId === '' ? fixedSeqs.parent : fixedSeqs.children.get(childId);
            if (reported === undefined || reported.size === 0) continue;
            const fresh = seqs
              .map(Number)
              .filter((seq) => Number.isFinite(seq) && reported.has(seq) && applied.indexOf(seq) === -1);
            if (fresh.length === 0) continue;
            if (resolvedMap[key] === undefined) markResolved(sessionId, key, Date.now());
            ledger[key] = applied.concat(fresh);
            ticked += fresh.length;
            changed = true;
            // A verified fix is also proof the failure was read. Advance the read
            // watermark here so a resolved card stops counting as "new" even when
            // the user turned off "hide resolved". Child seqs live in their own
            // space and must be marked in the child's own ledger.
            let newest = 0;
            for (const seq of fresh) if (seq > newest) newest = seq;
            if (childId === '') {
              if (typeof markReadThrough === 'function') markReadThrough(newest);
            } else {
              const childSeen = readSeenChildren(sessionId);
              if (!(typeof childSeen[childId] === 'number' && childSeen[childId] >= newest)) {
                childSeen[childId] = newest;
                writeSeenChildren(sessionId, childSeen);
              }
            }
          }
          if (changed) writeAutoFix(sessionId, ledger);
          if (ticked > 0) setAutoTicked((value) => value + ticked);
        }, [fixedSeqs, records, childRecords, resolvedMap, sessionId, markReadThrough]);
        // A child card is new when its own child watermark is behind it, not when
        // the parent's watermark is: the two sequence spaces never compare.
        const freshGroup = useCallback(
          (group) => {
            if (group.fromChild) {
              const mark = seenChildren[group.childId];
              return typeof mark === 'number' && Number.isFinite(group.seq) && group.seq > mark;
            }
            return seen !== null && watermarkOf(group) > seen;
          },
          [seen, seenChildren],
        );
        const onResolve = useCallback(
          (key, seq) => {
            markResolved(sessionId, key, Date.now());
            // Declaring a failure fixed is also a statement that it was read.
            if (typeof markReadThrough === 'function' && typeof seq === 'number') markReadThrough(seq);
          },
          [sessionId, markReadThrough],
        );
        const onUnresolve = useCallback((key) => unmarkResolved(sessionId, key), [sessionId]);
        const freshRecord = useCallback((record) => freshGroup(record), [freshGroup]);
        const visible = useMemo(
          () =>
            grouped.filter((group) => {
              if (sourceFilter !== 'all' && group.source !== sourceFilter) return false;
              if (unreadOnly && !freshGroup(group)) return false;
              return true;
            }),
          [grouped, sourceFilter, unreadOnly, freshGroup, hideResolved, resolvedMap],
        );
        // A failure the agent recovered from on its own is history, not a task:
        // it lives in a fold at the bottom of the list and never raises the banner.
        // Only a killed turn or a proven loop is allowed to ask for attention.
        const [quietOpen, setQuietOpen] = useState(false);
        // Auto-ticking is silent otherwise: a card can vanish while the reader is
        // looking at it. One line, self-clearing, keeps that from reading as a bug.
        const [autoTicked, setAutoTicked] = useState(0);
        const [ruleLearned, setRuleLearned] = useState('');
        const [rulesOpen, setRulesOpen] = useState(false);
        const thrashCounts = useMemo(() => {
          const counts = new Map();
          for (const group of visible) {
            if (group.source === 'turn' || group.source === 'subagent') continue;
            if (resolvedMap[groupKey(group)] !== undefined) continue;
            const key = thrashKeyOf(group);
            if (key === '') continue;
            counts.set(key, (counts.get(key) ?? 0) + 1);
          }
          return counts;
        }, [visible, resolvedMap]);
        const thrashOf = useCallback((group) => {
          const key = thrashKeyOf(group);
          return key === '' ? 0 : (thrashCounts.get(key) ?? 0);
        }, [thrashCounts]);
        const isNoteGroup = useCallback(
          (group) =>
            group.source !== 'turn' &&
            group.source !== 'subagent' &&
            group.count < LOOP_MIN_COUNT &&
            thrashOf(group) < THRASH_MIN_COUNT &&
            resolvedMap[groupKey(group)] === undefined,
          [resolvedMap, thrashOf],
        );
        const noteGroups = useMemo(() => visible.filter(isNoteGroup), [visible, isNoteGroup]);
        const mainGroups = useMemo(() => visible.filter((group) => !isNoteGroup(group) && !(hideResolved && resolvedMap[groupKey(group)] !== undefined)), [visible, isNoteGroup, hideResolved, resolvedMap]);
        const resolvedGroups = useMemo(() => (hideResolved ? visible.filter((group) => resolvedMap[groupKey(group)] !== undefined) : []), [visible, hideResolved, resolvedMap]);
        // A failure repeated three times in this session is a rule worth keeping:
        // learn its cause and fix once, then inject a short reminder into the very
        // same session so the agent stops making the same mistake.
        useEffect(() => {
          if (!autoRules) return;
          if (session === undefined || typeof session.prompt !== 'function') return;
          if (typeof sessionId !== 'string' || sessionId === '') return;
          const rules = readSessionRules(sessionId);
          const injected = readInjectedRules(sessionId);
          const en = translator('en');
          const zh = translator('zh');
          let rulesChanged = false;
          let announced = '';
          for (const group of grouped) {
            if (group.fromChild || group.source === 'turn' || group.source === 'subagent') continue;
            if (group.count < LOOP_MIN_COUNT && thrashOf(group) < THRASH_MIN_COUNT) continue;
            const causeKey = ownedCause(group);
            const id = String(causeKey === null ? 'unknown' : causeKey) + '|' + String(group.tool === null || group.tool === undefined ? '' : group.tool);
            const pattern = sessionRulePattern(group);
            if (pattern === '') continue;
            const nextKey = (causeKey !== null && NEXT_ACTIONS[causeKey]) || 'next.default';
            const existing = rules.find((rule) => rule.id === id);
            if (existing === undefined) {
              rules.push({
                id,
                pattern,
                causeZh: causeKey === null ? '' : zh(causeKey),
                causeEn: causeKey === null ? '' : en(causeKey),
                nextZh: zh(nextKey),
                nextEn: en(nextKey),
                tool: group.tool === null || group.tool === undefined ? '' : String(group.tool),
                enabled: true,
              });
              rulesChanged = true;
            }
            // One announcement per rule per UI language. A rule first injected
            // while the UI was English must not block a Chinese announcement.
            const announcedKey = id + '|' + locale;
            // The in-flight guard is module-global, so its key must include the
            // session: two sessions repeating the same cause|tool must not
            // suppress each other's injection while a prompt is still pending.
            const pendingKey = sessionId + '|' + announcedKey;
            if (injected[announcedKey] || pendingInjections.has(pendingKey)) continue;
            const ui = locale === 'zh' ? zh : en;
            announced = causeKey === null ? '' : ui(causeKey);
            const ruleText = ui(nextKey);
            const text = t('rule.injected.prompt', { rule: announced, ruleText });
            // Only treat a rule as injected once the session has accepted the
            // prompt (a durable user/message). Before that the composer draft
            // can still be cancelled, and marking the ledger early made the
            // announcement silently "fake-succeed": no message in context, no
            // retry later. Write the ledger after success; on failure or cancel
            // leave it unset so a future repeat re-queues the reminder.
            pendingInjections.add(pendingKey);
            session.prompt([{ type: 'text', text }], 'queue').then(
              (result) => {
                pendingInjections.delete(pendingKey);
                if (result !== undefined && result.ok === false) return;
                const ledger = readInjectedRules(sessionId);
                ledger[announcedKey] = Date.now();
                writeInjectedRules(sessionId, ledger);
              },
              () => { pendingInjections.delete(pendingKey); },
            );
          }
          if (rulesChanged) writeSessionRules(sessionId, rules);
          // Learning a rule means the repeats have been digested: mark them read
          // so they stop counting as new failures in the badge and banner.
          if (typeof markReadThrough === 'function') {
            for (const group of grouped) {
              if (group.fromChild || group.source === 'turn' || group.source === 'subagent') continue;
              if (group.count < LOOP_MIN_COUNT && thrashOf(group) < THRASH_MIN_COUNT) continue;
              const seqs = Array.isArray(group.seqs) ? group.seqs : [];
              let newest = 0;
              for (const seq of seqs) if (Number.isFinite(seq) && seq > newest) newest = seq;
              if (newest > 0) markReadThrough(newest);
            }
          }
          if (announced !== '') setRuleLearned(announced);
        }, [autoRules, grouped, thrashOf, session, sessionId, t, locale, markReadThrough]);
        // Counting records rather than groups: "3 new" reads as three failures,
        // which is what the banner promises.
        const attentionNew = useMemo(() => {
          if (seen === null) return 0;
          let total = 0;
          for (const group of mainGroups) if (freshGroup(group)) total += group.count;
          return total;
        }, [mainGroups, freshGroup]);
        // One notice at a time, in priority order. Each is dismissed explicitly
        // (or by reading); no timer silently removes information while reading.
        const noticeKey = attentionNew > 0 ? 'new' : autoTicked > 0 ? 'auto' : ruleLearned !== '' ? 'rule' : '';
        const dismissedKey = useRef('');
        if (dismissedKey.current !== noticeKey) dismissedKey.current = '';
        const noticeVisible = noticeKey !== '' && dismissedKey.current !== noticeKey;
        const dismissNotice = useCallback(() => { dismissedKey.current = noticeKey; }, [noticeKey]);
        const onCopyReport = useCallback(async () => {
          const parts = [];
          parts.push('# ' + t('report.title'));
          parts.push('');
          parts.push(
            '- ' + t('report.exported', { time: formatTime(Date.now()) }),
          );
          parts.push(
            '- ' +
              t('report.count', {
                groups: mainGroups.length,
                records: mainGroups.reduce((sum, group) => sum + group.count, 0),
              }),
          );
          mainGroups.forEach((group, index) => {
            const repeats = group.count > 1;
            const heading =
              String(index + 1) +
              '. ' +
              t('item.source.' + group.source) +
              (group.code !== null && group.code !== undefined ? ' · ' + group.code : '') +
              (repeats ? ' ×' + String(group.count) : '');
            parts.push('', '## ' + heading);
            if (group.message !== '') parts.push(group.message);
            const groupCause = ownedCause(group);
            if (groupCause !== null) parts.push('- ' + t('item.cause', { cause: t(groupCause) }));
            // The report is handed to a fresh session, so a mark the user already
            // made must travel with it — otherwise the agent re-diagnoses a fix.
            if (resolvedMap[groupKey(group)] !== undefined) parts.push('- ' + t('item.resolved'));
            if (typeof group.args === 'string' && group.args !== '') {
              parts.push('- ' + t('item.args', { args: group.args }));
            }
            if (group.turn !== null && group.turn !== undefined) parts.push('- ' + t('item.turn', { n: String(group.turn) }));
            const latest = formatTime(group.at);
            if (latest !== '') parts.push('- ' + t('item.latest', { time: latest }));
            if (repeats) {
              const first = formatTime(group.firstAt);
              if (first !== '') parts.push('- ' + t('item.since', { time: first }));
              const seqList =
                group.seqs.length <= 5
                  ? group.seqs.join(', ')
                  : group.seqs.slice(0, 5).join(', ') + ' …(' + String(group.seqs.length) + ')';
              parts.push('- ' + t('item.seqs', { seqs: seqList }));
            } else {
              parts.push('- ' + 'seq=' + String(group.seq));
            }
            parts.push('', '```', truncate(String(group.raw), 1500), '```');
          });
          const report = parts.join('\n');
          try {
            if (navigator.clipboard !== undefined && typeof navigator.clipboard.writeText === 'function') {
              await navigator.clipboard.writeText(report);
            } else {
              throw new Error('clipboard unavailable');
            }
            setReportState(t('report.copied'));
          } catch {
            setReportState(t('item.copyFailed'));
          }
          if (reportTimer.current !== null) window.clearTimeout(reportTimer.current);
          reportTimer.current = window.setTimeout(() => setReportState(''), 2200);
        }, [mainGroups, t, resolvedMap]);

        if (session === undefined) {
          return h(
            'div',
            { className: 'emx-root' },
            h(StyleTag, null),
            h(
              'div',
              { className: 'emx-empty' },
              h('div', { className: 'emx-emptyTitle' }, t('panel.loading')),
              h('div', null, t('panel.noSession')),
            ),
          );
        }

        return h(
          'div',
          { className: 'emx-root' },
          h(StyleTag, null),
          h(
            'div',
            { className: 'emx-head' },
            h('span', { className: 'emx-headTitle' }, t('tab.title')),
            h('span', { className: 'emx-headMeta' }, t('panel.subtitle')),
            h('span', { className: 'emx-metaSpacer' }),
            h('span', { className: 'emx-headMeta' }, t('panel.total', { n: String(totalCount) })),
            h(
              'button',
              {
                type: 'button',
                className: 'emx-btn emx-btnQuiet',
                onClick: onCopyReport,
                disabled: mainGroups.length === 0,
              },
              reportState === '' ? t('report.copy') : reportState,
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'emx-btn emx-btnQuiet emx-docsTrigger',
                onClick: () => setDocsOpen((value) => !value),
                'aria-expanded': docsOpen,
                title: t('docs.toggleHint'),
              },
              (docsOpen ? '▾ ' : '▸ ') + t('docs.toggle'),
            ),
          ),
          docsOpen ? h(DocsBody, { t }) : null,
          h(
            'div',
            { className: 'emx-filters' },
            // Opt-in switch for automatic rule learning + injection. It takes the
            // filter box's old spot; the hint is shown inline, not on hover.
            h(
              'span',
              { className: 'emx-autoRules' },
              h(
                'button',
                {
                  type: 'button',
                  role: 'switch',
                  'aria-checked': autoRules,
                  className: 'emx-switch' + (autoRules ? ' emx-switchOn' : ''),
                  onClick: () => setAutoRules((value) => { writeNumber(AUTO_RULES_KEY, value ? 0 : 1); return !value; }),
                },
                h('span', null, t('filter.autoRules')),
                h('span', { className: 'emx-switchTrack', 'aria-hidden': true },
                  h('span', { className: 'emx-switchThumb' })),
              ),
              h('span', { className: 'emx-autoRulesHint' }, t('filter.autoRulesHint')),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'emx-chip' + (sourceFilter === 'all' ? ' emx-chipActive' : ''),
                onClick: () => setSourceFilter('all'),
              },
              t('filter.all') + ' ' + String(grouped.length),
            ),
            ['turn', 'tool', 'command', 'subagent', 'runtime'].map((source) => {
              const count = counts.get(source) ?? 0;
              if (count === 0) return null;
              return h(
                'button',
                {
                  key: source,
                  type: 'button',
                  className: 'emx-chip' + (sourceFilter === source ? ' emx-chipActive' : ''),
                  onClick: () => setSourceFilter(sourceFilter === source ? 'all' : source),
                },
                t('item.source.' + source) + ' ' + String(count),
              );
            }),
            h('span', { className: 'emx-metaSpacer' }),
            // Only meaningful once something is marked. It hides the whole group,
            // never the unread count above: a fresh occurrence of the same cause
            // still raises the banner, which is the point of the mark.
            resolvedCount > 0
              ? h(
                  'button',
                  {
                    type: 'button',
                    className: 'emx-chip' + (hideResolved ? ' emx-chipActive' : ''),
                    onClick: () => setHideResolved((value) => { writeNumber(HIDE_RESOLVED_KEY, value ? 0 : 1); return !value; }),
                    title: t('filter.hideResolvedHint'),
                  },
                  t('filter.hideResolved') + ' ' + String(resolvedCount),
                )
              : null,
            h(
              'button',
              {
                type: 'button',
                className: 'emx-chip' + (unreadOnly ? ' emx-chipActive' : ''),
                onClick: () => setUnreadOnly((value) => !value),
              },
              t('filter.unread'),
            ),
            h(
              'button',
              { type: 'button', className: 'emx-chip', onClick: markRead, disabled: unread === 0, title: t('filter.markAllHint') },
              t('filter.markAll'),
            ),
          ),
          noticeVisible
            ? h(
                'div',
                { className: 'emx-banner' + (noticeKey === 'new' ? '' : ' emx-bannerQuiet'), role: 'status' },
                noticeKey === 'new' ? h('span', { className: 'emx-dot', 'aria-hidden': true }) : null,
                h(
                  'span',
                  { className: 'emx-bannerText' },
                  noticeKey === 'new'
                    ? t('banner.new', { n: String(attentionNew) })
                    : noticeKey === 'auto'
                      ? t('banner.autoResolved', { n: String(autoTicked) })
                      : t('rule.learned', { rule: ruleLearned }),
                ),
                noticeKey === 'new'
                  ? h('button', { type: 'button', className: 'emx-btn', onClick: markRead }, t('banner.markRead'))
                  : h('button', { type: 'button', className: 'emx-btn emx-btnQuiet', onClick: dismissNotice }, '\u00d7'),
              )
            : null,
          sessionRules.length > 0
            ? h(
                'div',
                { className: 'emx-rules' },
                h(
                  'button',
                  { type: 'button', className: 'emx-rulesToggle', onClick: () => setRulesOpen((value) => !value) },
                  t('rules.title', { n: String(sessionRules.length) }),
                  h('span', { className: 'emx-rulesArrow' }, rulesOpen ? '▲' : '▼'),
                ),
                rulesOpen
                  ? h(
                      'div',
                      { className: 'emx-rulesList' },
                      sessionRules.map((rule, index) =>
                        h(
                          'div',
                          { className: 'emx-rule', key: rule.id + '|' + String(index) },
                          h(
                            'div',
                            { className: 'emx-ruleHead' },
                            h('span', { className: 'emx-ruleCause' }, locale === 'zh' ? (rule.causeZh || rule.causeEn || '') : (rule.causeEn || rule.causeZh || '')),
                            ruleToolOf(rule) !== '' ? h('span', { className: 'emx-ruleTool' }, t('rule.tool', { tool: ruleToolOf(rule) })) : null,
                          ),
                          h('div', { className: 'emx-ruleNext' }, t('item.next', { next: locale === 'zh' ? (rule.nextZh || rule.nextEn || '') : (rule.nextEn || rule.nextZh || '') })),
                        ),
                      ),
                    )
                  : null,
              )
            : null,
          hasMore
            ? h(
                'div',
                { className: 'emx-loadOlder' },
                h('span', { className: 'emx-meta' }, t('panel.hasMore')),
                h(
                  'button',
                  { type: 'button', className: 'emx-btn', onClick: loadOlder, disabled: loadingOlder },
                  loadingOlder ? t('panel.loadingOlder') : t('panel.loadOlder'),
                ),
              )
            : null,
          grouped.length === 0
            ? h(
                'div',
                { className: 'emx-empty' },
                h('div', { className: 'emx-emptyTitle' }, t('panel.empty.title')),
                h('div', null, t('panel.empty.body')),
              )
            : visible.length === 0
              ? h('div', { className: 'emx-empty' }, h('div', { className: 'emx-emptyTitle' }, t('filter.empty')))
              : h(
                  'div',
                  { className: 'emx-list' },
                  mainGroups.slice(0, renderLimit).map((record) =>
                    h(ErrorItem, {
                      key: record.id,
                      record,
                      t,
                      locale,
                      session,
                      sessionId,
                      isNew: freshRecord(record),
                      onHandled: record.fromChild ? undefined : markReadThrough,
                      resolved: resolvedMap[groupKey(record)] !== undefined,
                      childFailures: childFailuresOf(record),
                      thrashCount: thrashOf(record),
                      onResolve,
                      onUnresolve,
                    }),
                  ),
                  mainGroups.length > renderLimit
                    ? h(
                        'button',
                        {
                          type: 'button',
                          className: 'emx-btn emx-btnQuiet',
                          onClick: () => setRenderLimit((value) => value + 50),
                        },
                        t('panel.showMore', { n: String(mainGroups.length - renderLimit) }),
                      )
                    : null,
                  childOverflow > 0
                    ? h(
                        'div',
                        { className: 'emx-noteHint' },
                        t('panel.childOverflow', { n: String(childOverflow), max: String(CHILD_CAP) }),
                      )
                    : null,
                  // One quiet fold: resolved cards and self-retried failures share
                  // a single switch; each section keeps its own short heading.
                  resolvedGroups.length + noteGroups.length === 0
                    ? null
                    : h(
                        'div',
                        { className: 'emx-noteFold' },
                        h(
                          'button',
                          {
                            type: 'button',
                            className: 'emx-noteToggle',
                            onClick: () => setQuietOpen((value) => !value),
                            'aria-expanded': quietOpen,
                          },
                          (quietOpen ? '▾ ' : '▸ ') + t('panel.quietFold', { n: String(resolvedGroups.length + noteGroups.length) }),
                        ),
                        quietOpen
                          ? h(
                              'div',
                              null,
                              resolvedGroups.length > 0
                                ? h(
                                    'div',
                                    { className: 'emx-quietSection' },
                                    h('div', { className: 'emx-quietTitle' }, t('filter.hideResolved') + ' (' + String(resolvedGroups.length) + ')'),
                                    h(
                                      'div',
                                      { className: 'emx-noteList' },
                                      resolvedGroups.slice(0, renderLimit).map((record) =>
                                        h(ErrorItem, {
                                          key: 'resolved-' + record.id,
                                          record,
                                          t,
                                          locale,
                                          session,
                                          sessionId,
                                          note: true,
                                          isNew: false,
                                          onHandled: record.fromChild ? undefined : markReadThrough,
                                          resolved: true,
                                          childFailures: childFailuresOf(record),
                                          thrashCount: thrashOf(record),
                                          onResolve,
                                          onUnresolve,
                                        }),
                                      ),
                                    ),
                                  )
                                : null,
                              noteGroups.length > 0
                                ? h(
                                    'div',
                                    { className: 'emx-quietSection' },
                                    h('div', { className: 'emx-quietTitle' }, t('panel.notes', { n: String(noteGroups.length) })),
                                    h('span', { className: 'emx-noteHint' }, t('panel.notesHint')),
                                    h(
                                      'div',
                                      { className: 'emx-noteList' },
                                      noteGroups.slice(0, renderLimit).map((record) =>
                                        h(ErrorItem, {
                                          key: 'note-' + record.id,
                                          record,
                                          t,
                                          locale,
                                          session,
                                          sessionId,
                                          note: true,
                                          isNew: false,
                                          onHandled: record.fromChild ? undefined : markReadThrough,
                                          resolved: resolvedMap[groupKey(record)] !== undefined,
                                          childFailures: childFailuresOf(record),
                                          thrashCount: thrashOf(record),
                                          onResolve,
                                          onUnresolve,
                                        }),
                                      ),
                                    ),
                                  )
                                : null,
                            )
                          : null,
                      ),
                ),
        );
      }

      function TabTitle() {
        const locale = normalizeLocale(useActiveLocale(ctx));
        const t = useMemo(() => translator(locale), [locale]);
        return h(
          'span',
          { style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } },
          h(GuideIcon, null),
          t('tab.title'),
        );
      }

      /** Title text resolved in the user's current language, for non-React callers. */
      const titleText = (key) => {
        const service = safeService(ctx, 'locale');
        let active = 'en';
        try {
          active =
            service !== undefined && typeof service.getLocale === 'function' ? service.getLocale().active : 'en';
        } catch {
          active = 'en';
        }
        return translator(normalizeLocale(active))(key);
      };

      /* --------------------------------------- conversation View registration */

      // One Conversation View tab beside 对话 / 上下文 / …, registered on the very
      // slot the tab strip reads. Nothing else is required, so a missing sidebar
      // service can never hold activation hostage.
      const registerView = () => {
        try {
          ctx.effect(
            () =>
              slots.inject('conversation.view', () =>
                slots.register(
                  {
                    name: 'conversation.view',
                    id: TAB_TYPE_ID,
                    order: VIEW_ORDER,
                    // A fixed wording: unread state is the sidebar row's triangle,
                    // so the tab never changes shape under the reader.
                    label: () => titleText('tab.title'),
                  },
                  Monitor,
                ),
              ),
            'error-monitor: conversation view',
          );
        } catch (error) {
          console.error('[error-monitor] view registration failed: ' + String(error && error.message));
        }
      };

      /* --------------------------------------- Session row alert decoration */

      /**
       * The row's leading 16px cell carries the row's own state dot; this puts an
       * error glyph there instead while the session has unread failures, so the
       * reminder is visible in the sidebar without opening anything.
       */
      const makeRowAlert = () =>
        function RowAlert(props) {
          const locale = normalizeLocale(useActiveLocale(ctx));
          const t = useMemo(() => translator(locale), [locale]);
          const sessionId = typeof props.sessionId === 'string' && props.sessionId !== '' ? props.sessionId : undefined;
          // The row seeds the watermark on first sight too, so only failures that
          // arrive after the user actually saw the session count as unread.
          const unread = useRowUnread(ctx, sessionId);
          if (unread <= 0) return null;
          return h(
            'span',
            {
              // Inline, because the plugin's stylesheet is rendered by the View body
              // and the sidebar row lives in another tree: a class here would arrive
              // unstyled and the glyph would inherit the row's grey.
              style: {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px',
                height: '16px',
                color: 'var(--dsw-alias-state-error-primary, #e5484d)',
              },
              title: t('row.alert'),
              role: 'img',
              'aria-label': t('row.alert'),
            },
            h(
              'svg',
              { viewBox: '0 0 16 16', width: 14, height: 14, 'aria-hidden': true },
              h('path', {
                d: 'M8 1.8 15 14.2H1L8 1.8Zm0 3.4a.85.85 0 0 0-.85.9l.28 3.2a.57.57 0 0 0 1.14 0l.28-3.2A.85.85 0 0 0 8 5.2Zm0 5.6a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z',
                fill: 'currentColor',
              }),
            ),
          );
        };

      const registerRowAlert = () => {
        try {
          const RowAlert = makeRowAlert();
          ctx.effect(
            () =>
              slots.inject('sidebar.session.row.leading', () =>
                slots.register(
                  {
                    name: 'sidebar.session.row.leading',
                    id: PACKAGE + ':alert',
                    order: 10,
                    label: () => titleText('row.alert'),
                  },
                  RowAlert,
                ),
              ),
            'error-monitor: session row alert',
          );
        } catch (error) {
          console.error('[error-monitor] row alert registration failed: ' + String(error && error.message));
        }
      };

      registerView();
      registerRowAlert();

    }

    return {
      inject: ['slots'],
      apply(ctx) {
        mount(ctx);
      },
    };
  },
});
