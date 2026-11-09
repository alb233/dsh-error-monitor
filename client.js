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
    const RESOLVED_PREFIX = PACKAGE + '.resolved.';
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
        'panel.windowNote': 'Only the loaded part of this session record is read.',
        'panel.loadOlder': 'Load earlier records',
        'panel.loadingOlder': 'Loading…',
        'panel.hasMore': 'Earlier records are not loaded yet',
        'panel.showMore': 'Show {n} earlier entries',
        'banner.new': '{n} new since you last looked',
        'banner.markRead': 'Mark as read',
        'banner.latest': 'Latest error',
        'filter.all': 'All',
        'filter.unread': 'Unread only',
        'filter.unresolved': 'Unresolved only',
        'filter.unresolvedHint': 'Hide failures already marked as fixed',
        'filter.markAll': 'Mark all read',
        'docs.toggle': 'How to use this panel',
        'docs.toggleHint': 'what each button does',
        'docs.groupCard': 'On an error card',
        'docs.groupBar': 'Top bar and filters',
        'docs.copy.name': 'Copy',
        'docs.copy.desc': 'Copies this error as plain text, cause and arguments included, for pasting somewhere else.',
        'docs.send.name': 'Send to chat',
        'docs.send.desc': 'Diagnosis: sends the summary, cause, session id and seq into the conversation so the agent reads the raw event before judging.',
        'docs.retry.name': 'Retry step',
        'docs.retry.desc': 'Reproduction: resends the same tool with the same arguments, so the agent repeats that one step as it was.',
        'docs.resolve.name': 'Mark resolved',
        'docs.resolve.desc': 'Marks this cause as fixed; every repeat of it follows. Click again to reopen. The mark survives a restart.',
        'docs.full.name': 'Send full text',
        'docs.full.desc': 'Also sends the complete raw error, for cases a summary cannot explain.',
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
        'docs.markAll.name': 'Mark all read',
        'docs.markAll.desc': 'Clears the unread counter for everything currently listed.',
        'docs.loadOlder.name': 'Load earlier',
        'docs.loadOlder.desc': 'Reads older records back out of the session log when the list starts mid-history.',
        'filter.search': 'Filter…',
        'filter.searchHint': 'Matches any of: message, raw error, tool name, path, error code. Space-separated keywords must all match.',
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
        'item.turn': 'Turn {n}',
        'item.turnUnknown': 'No turn position',
        'item.code': 'Code {code}',
        'item.cause': 'Cause: {cause}',
        'item.next': 'Suggested fix: {next}',
        'item.fatal': 'Turn aborted',
        'item.recover': 'Step failed — you can continue',
        'next.quota': 'Top up the account or switch route, then rerun this step',
        'next.rate': 'Wait 30–60s and rerun; repeated hits mean throttling — different arguments will not help',
        'next.auth': 'Check the API key is valid and points at the profile you meant',
        'next.forbidden': 'This path or action is outside the current permission — move it into reachable scope, or raise permission for this step only',
        'next.editmatch': 'Read the file again, then copy the anchor from that fresh read instead of rewriting it from memory',
        'next.editambig': 'Lengthen the anchor until it appears once (include the surrounding line); do not widen it with replace_all',
        'next.sandbox': 'Put the file inside the workspace, or rerun this step with escalated permission',
        'next.denied': 'Confirm the path is inside the allowed scope, then decide whether to escalate',
        'next.timeout': 'Do less in one step (fewer commands, smaller reads) and rerun',
        'next.payload': 'The request shape was rejected — fix the arguments, not the model',
        'next.module': 'The module or import is missing — check the name and that it is installed',
        'next.coderun': 'Read the failing line in the raw text, fix the code, then rerun — resending the same code will not help',
        'next.review': 'Apply what the review asked, then resubmit; the same submission will fail again',
        'next.enoent': 'The path is wrong or the file is gone — list the directory first',
        'next.net': 'Check network, proxy and VPN, then rerun; stop after repeated failures',
        'next.default': 'Send this back to the conversation so the model reads the original event, instead of guessing at the arguments',
        'item.args': 'Call arguments: {args}',
        'item.resolved': 'Resolved',
        'item.resolve': 'Mark resolved',
        'item.unresolve': 'Reopen',
        'item.retry': 'Rerun this step',
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
        'item.scale': 'Last request ≈ {tokens} tokens ({input} in · {cache} cached)',
        'item.scaleNoCache': 'Last request ≈ {tokens} tokens ({input} in)',
        'item.since': 'first {time}',
        'item.latest': 'latest {time}',
        'item.seqs': 'seqs={seqs}',
        'item.raw': 'Raw error',
        'item.copy': 'Copy details',
        'item.copied': 'Copied',
        'item.copyFailed': 'Copy failed',
        'item.send': 'Send to chat',
        'item.sendFull': 'Send full raw',
        'item.sending': 'Sending…',
        'item.sent': 'Sent to chat',
        'item.sendFailed': 'Send failed',
        'item.expand': 'Show raw error',
        'item.collapse': 'Hide raw error',
        'send.prompt':
          'I hit an error in this session. Please analyse the cause and propose a fix.\n\nSource: {source}\nTurn: {turn}\nTime: {time}\nCode: {code}\nLikely cause: {cause}\nSummary: {summary}\nArguments: {args}\nSession id: {sessionId}\nSession event seq: {seq}\n\nThe summary above is trimmed. Read the original event before diagnosing: call session_event_read with seq={seq} (add session_id={sessionId}; if that id is rejected, call it with seq={seq} only to read the current session). Then work from the real error text instead of the digest.',
        'send.promptFull':
          'I hit an error in this session. Please analyse the cause and propose a fix.\n\nSource: {source}\nTurn: {turn}\nTime: {time}\nCode: {code}\nLikely cause: {cause}\nArguments: {args}\nSession id: {sessionId}\nSession event seq: {seq}\nRaw error:\n```\n{raw}\n```\n\nIf the raw text above is still cut off, read the original event with session_event_read(seq={seq}) (add session_id={sessionId} if needed) before concluding.',
        'send.retry':
          'Please re-run exactly this step of the session and report the result.\n\nSource: {source}\nTurn: {turn}\nTool: {tool}\nArguments: {args}\nCode: {code}\nLikely cause: {cause}\nError: {summary}\nSession id: {sessionId}\nSession event seq: {seq}\n\nUse the arguments above verbatim — changing them would test something else. If the step succeeds this time, say what changed; if it fails again, read the original event with session_event_read(seq={seq}) and compare the two errors before guessing.',
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
        'panel.windowNote': '仅读取本会话已加载的记录。',
        'panel.loadOlder': '加载更早记录',
        'panel.loadingOlder': '加载中…',
        'panel.hasMore': '更早的记录尚未加载',
        'panel.showMore': '显示更早的 {n} 条',
        'banner.new': '新报错 {n} 条',
        'banner.markRead': '标记已读',
        'banner.latest': '最新报错',
        'filter.all': '全部',
        'filter.unread': '只看未读',
        'filter.unresolved': '只看未解决',
        'filter.unresolvedHint': '隐藏已标记为解决的报错',
        'filter.markAll': '全部已读',
        'docs.toggle': '使用说明',
        'docs.toggleHint': '每个按钮干什么',
        'docs.groupCard': '单条报错卡片上',
        'docs.groupBar': '顶栏与筛选',
        'docs.copy.name': '复制',
        'docs.copy.desc': '把这条报错的详情文本复制走，含归因与调用参数，方便贴到别处。',
        'docs.send.name': '发回对话',
        'docs.send.desc': '诊断：把摘要、归因、会话 ID 与 seq 发进对话，让模型先读原始事件再下结论。',
        'docs.retry.name': '重跑此步',
        'docs.retry.desc': '复现：带原工具名和原调用参数，请模型把这一步原样再跑一次。',
        'docs.resolve.name': '标记已解决',
        'docs.resolve.desc': '给这个根因打上已解决，同根因的重复报错一起标记；再点一次撤销，重启不丢。',
        'docs.full.name': '发送完整原文',
        'docs.full.desc': '把完整的原始错误也一起发进对话，摘要讲不清时用。',
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
        'docs.markAll.name': '全部已读',
        'docs.markAll.desc': '把当前列出的报错全部标为已读，清掉未读计数。',
        'docs.loadOlder.name': '加载更早',
        'docs.loadOlder.desc': '列表从会话中段开始时，从日志里往前补更早的记录。',
        'filter.search': '过滤报错…',
        'filter.searchHint': '可匹配：错误文案、完整原文、工具名、路径、错误码；空格分隔多个关键词，需同时满足',
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
        'item.turn': '第 {n} 轮',
        'item.turnUnknown': '无轮次位置',
        'item.code': '错误码 {code}',
        'item.cause': '原因：{cause}',
        'item.next': '处理建议：{next}',
        'item.fatal': '会话中断',
        'item.recover': '单步失败，会话可继续',
        'next.quota': '充值或换一条可用路由，再重跑这一步',
        'next.rate': '等 30–60 秒再重跑；连续触发就是被限流，换参数没用',
        'next.auth': '检查 API key 是否有效、是否指向你以为的那个 profile',
        'next.forbidden': '这个路径或操作超出当前权限：挪到可操作范围内，或只给这一步提权',
        'next.editmatch': '先重新读文件再改；锚点从刚读到的原文复制，别凭记忆写',
        'next.editambig': '把锚点加长到只出现一次（带上前后行），别用 replace_all 硬覆盖',
        'next.sandbox': '把文件放进工作区内，或给这一步提权后重跑',
        'next.denied': '先确认路径在允许范围内，再决定要不要提权',
        'next.timeout': '把单步做小一点（少跑几条命令、少读几个文件）再重跑',
        'next.payload': '请求形状被拒：改参数，不是换模型',
        'next.module': '模块或引用不存在：核对名字，确认装过',
        'next.coderun': '看原文里报错的那一行，改代码再重跑；同一份代码重试没用',
        'next.review': '按审查意见改完再提交；同一份提交还会被拒',
        'next.enoent': '路径写错或文件没了：先列目录确认',
        'next.net': '检查网络、代理与 VPN 再重跑；连续失败就先停',
        'next.default': '点「发回对话」，让模型读原始事件后给定位；别在参数上瞎试',
        'item.args': '调用参数：{args}',
        'item.resolved': '已解决',
        'item.resolve': '标记已解决',
        'item.unresolve': '重新打开',
        'item.retry': '重跑此步',
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
        'item.scale': '最近一次请求 ≈ {tokens} tokens（输入 {input} · 缓存 {cache}）',
        'item.scaleNoCache': '最近一次请求 ≈ {tokens} tokens（输入 {input}）',
        'item.since': '最早 {time}',
        'item.latest': '最新 {time}',
        'item.seqs': 'seq={seqs}',
        'item.raw': '原始错误',
        'item.copy': '复制详情',
        'item.copied': '已复制',
        'item.copyFailed': '复制失败',
        'item.send': '发回对话',
        'item.sendFull': '发送完整原文',
        'item.sending': '发送中…',
        'item.sent': '已发回对话',
        'item.sendFailed': '发送失败',
        'item.expand': '展开原始错误',
        'item.collapse': '收起原始错误',
        'send.prompt':
          '我在本会话遇到一次报错，请帮我分析原因并给出处理方案。\n\n来源：{source}\n轮次：{turn}\n时间：{time}\n错误码：{code}\n初步归因：{cause}\n摘要：{summary}\n调用参数：{args}\n会话 ID：{sessionId}\n会话事件 seq：{seq}\n\n上面的摘要是精简过的。请先读原始事件再判断：调用 session_event_read，seq={seq}（需要指定会话时加 session_id={sessionId}；若该 ID 被拒绝，就只用 seq={seq} 读当前会话），然后基于真实报错文本分析，不要凭摘要猜。',
        'send.promptFull':
          '我在本会话遇到一次报错，请帮我分析原因并给出处理方案。\n\n来源：{source}\n轮次：{turn}\n时间：{time}\n错误码：{code}\n初步归因：{cause}\n调用参数：{args}\n会话 ID：{sessionId}\n会话事件 seq：{seq}\n原始错误：\n```\n{raw}\n```\n\n若上面的原文仍被截断，先用 session_event_read(seq={seq})（必要时加 session_id={sessionId}）读出原始事件再下结论。',
        'send.retry':
          '请原样重跑本会话的这一步骤，并说明结果。\n\n来源：{source}\n轮次：{turn}\n工具：{tool}\n调用参数：{args}\n错误码：{code}\n初步归因：{cause}\n错误：{summary}\n会话 ID：{sessionId}\n会话事件 seq：{seq}\n\n参数请照原文使用，改了就是在测另一件事。若这次成功，说明是什么变了；若仍失败，先用 session_event_read(seq={seq}) 读原始事件，对比两次报错的差异再判断。',
        'send.turn': '第 {n} 轮',
        'send.unknown': '未知',
        'new.tag': '新',
      },
    };

    function translator(locale) {
      const table = MESSAGES[locale] || MESSAGES.en;
      return (key, params) => {
        let text = table[key];
        if (text === undefined) text = MESSAGES.en[key];
        if (text === undefined) return key;
        if (params === undefined) return text;
        return text.replace(/\{(\w+)\}/g, (whole, name) =>
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

    /** Mark one group as fixed, recording when so the cap evicts the oldest. */
    function markResolved(sessionId, key, at) {
      if (typeof key !== 'string' || key === '') return;
      const map = readResolved(sessionId);
      map[key] = typeof at === 'number' && Number.isFinite(at) ? at : Date.now();
      writeResolved(sessionId, map);
    }

    function unmarkResolved(sessionId, key) {
      if (typeof key !== 'string' || key === '') return;
      const map = readResolved(sessionId);
      if (!Object.prototype.hasOwnProperty.call(map, key)) return;
      delete map[key];
      writeResolved(sessionId, map);
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

    /** Notice timestamps are shared so a re-render cannot rewrite an arrival time. */
    const noticeTimes = new Map();

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
        // Arrival times live for the page's lifetime; a cap keeps a very long
        // session from growing the map without bound.
        if (!noticeTimes.has(key)) {
          if (noticeTimes.size >= 100) noticeTimes.delete(noticeTimes.keys().next().value);
          noticeTimes.set(key, Date.now());
        }
        list = mergeRuntimeNotice(list, key, noticeTimes.get(key));
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
    function useErrorFeed(ctx, sessionId, options) {
      const baseline = options !== undefined && options.baseline === true;
      const sessions = safeService(ctx, 'sessions');
      // The Session object arrives once the runtime retains its generation.
      useStoreValue(sessions !== undefined ? sessions.list : undefined);
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
      const topSeq = records.length === 0 ? 0 : records[0].seq;
      const seenKey = SEEN_PREFIX + String(sessionId);
      const seen = useSeenValue(seenKey);

      // Seeding happens on first sight of a session with no watermark yet: without
      // it, installing the plugin (or a fresh storage) would light up every
      // historical failure of every session as unread. Once seeded, the watermark
      // is durable, so a restart never re-seeds over a real unread state.
      useEffect(() => {
        if (baseline && seen === null) writeNumber(seenKey, topSeq);
      }, [baseline, seen, seenKey, topSeq]);

      const unread = seen === null ? (baseline ? 0 : records.length) : records.filter((record) => record.seq > seen).length;

      // Reading one failure is not reading the newer ones, so the watermark only
      // moves up to that record.
      const markReadThrough = useCallback(
        (throughSeq) => {
          const next = Math.max(seen ?? 0, Number.isFinite(throughSeq) ? throughSeq : 0);
          writeNumber(seenKey, next);
        },
        [seen, seenKey],
      );
      const markRead = useCallback(() => markReadThrough(topSeq), [markReadThrough, topSeq]);

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
      { key: 'cause.quota', re: /ACCOUNT_QUOTA|insufficient balance|insufficient_quota|quota exceeded|billing_error|余额不足/i },
      { key: 'cause.rate', re: /(?<![0-9])(429|424)(?![0-9])|Too Many Requests|rate[ _-]?limit|bili_throttle|throttl|限流/i },
      { key: 'cause.auth', re: /(?<![0-9])401(?![0-9])|Unauthorized|authentication required|invalid api key/i },
      { key: 'cause.forbidden', re: /(?<![0-9])403(?![0-9])|Forbidden|OWNER_REQUIRED|权限被拒/i },
      { key: 'cause.payload', re: /(?<![0-9])413(?![0-9])|Payload Too Large|request entity too large/i },
      { key: 'cause.gateway', re: /(?<![0-9])50[234](?![0-9])|Bad Gateway|Service Unavailable|Gateway Timeout/i },
      { key: 'cause.jstype', re: /ReferenceError|TypeError|is not defined|Cannot read propert|Cannot access|undefined is not/i },
      { key: 'cause.syntax', re: /SyntaxError|IndentationError|TabError/i },
      { key: 'cause.module', re: /ModuleNotFoundError|No module named|ModuleNotFound|Cannot find module|ERR_MODULE_NOT_FOUND/i },
      { key: 'cause.coderun', re: /CODE_RUN_FAILED|CodeRunFailedError|code run failed/i },
      { key: 'cause.review', re: /AUTO_REVIEW_FAILED|AutoReviewFailedError|auto-review|auto review failed/i },
      { key: 'cause.enoent', re: /os error 2(?![0-9])|ENOENT|No such file or directory|系统找不到指定的文件|找不到指定的文件|The system cannot find the file|FileNotFoundError/i },
      { key: 'cause.notdir', re: /os error 3(?![0-9])|ENOTDIR|不是目录/i },
      { key: 'cause.inuse', re: /already in use by another|已有另一个|已被占用|being used by another process|另一个程序正在使用/i },
      { key: 'cause.busy', re: /os error 32(?![0-9])|EBUSY/i },
      { key: 'cause.pipe', re: /named pipe|命名管道|EPERM.*pipe|pipe.*EPERM/i },
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
      { key: 'cause.dns', re: /getaddrinfo|ENOTFOUND|could not resolve host|Name or service not known/i },
      { key: 'cause.tls', re: /CERT_HAS_EXPIRED|certificate verify failed|self.signed certificate|SSL handshake|TLS handshake/i },
      { key: 'cause.nospace', re: /ENOSPC|No space left on device|磁盘空间不足/i },
      { key: 'cause.readonly', re: /EROFS|read-only file system|只读文件系统/i },
      { key: 'cause.mfile', re: /EMFILE|too many open files/i },
      { key: 'cause.killed', re: /exit code 137|SIGKILL|signal: killed/i },
      { key: 'cause.nogit', re: /not a git repository/i },
      { key: 'cause.editmatch', re: /FS_EDIT_NOT_FOUND|old_string was not found|String to replace not found|replace_all.*not found/i },
      { key: 'cause.editambig', re: /FS_AMBIGUOUS_EDIT|old_string matched \d+ times|matched multiple times|is not unique/i },
      { key: 'cause.missing', re: /(?<![0-9])404(?![0-9])|Not Found/i },
      { key: 'cause.traceback', re: /Traceback .most recent call last./i },
      { key: 'cause.timeout', re: /ETIMEDOUT|timed out|timeout|超时/i },
      { key: 'cause.reset', re: /ECONNRESET|ECONNABORTED|EPIPE|socket hang up|connection reset|fetch failed|unexpected EOF|Empty reply from server|network error/i },
      { key: 'cause.abort', re: /aborted|request was aborted|AbortError|operation was canceled|operation cancelled/i },
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
      for (const cause of CAUSES) if (cause.re.test(clean)) return cause.key;
      return null;
    }

    /**
     * Host notices that ride along with tool output. They are not part of the
     * failure, so they must not decide what the failure is called.
     */
    const NEXT_ACTIONS = {
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
};

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
          const reason = data.reason;
          if (!isRecord(reason) || reason.kind !== 'error') continue;
          const raw = reason.error;
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
          record.message = describeError(record);
          records.push(record);
          continue;
        }

        if (event.type === 'tool/result') {
          const error = data.error;
          if (!isRecord(error)) continue;
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
          const explicit = typeof error.reason === 'string' && error.reason !== '' ? error.reason : '';
          // dsh-ops cordis mode reroutes built-in tools (e.g. read -> ops_inspect_local_file);
          // that is a routing notice, not a real failure, so keep it out of the monitor.
          if (
            /\bMODE_REPLACEMENT\b/.test(explicit) ||
            /cordis mode replaced the official tool/i.test(explicit !== '' ? explicit : resultText(data))
          ) {
            continue;
          }
          // The runtime reports a tool failure as a bare {name, code}; the human
          // sentence lives in the result message, so it has to travel with the
          // raw payload or "send the full raw" would hand over an empty error.
          const detailText = stripToolHints(explicit !== '' ? explicit : resultText(data));
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
          record.message = describeError(record);
          records.push(record);
          continue;
        }

        if (event.type === 'user/message') {
          const notice = subagentNotice(data);
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
            record.message = describeError(record);
            records.push(record);
          }
          continue;
        }

        if (event.type === 'command/done' && data.kind === 'error') {
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
            detail: typeof data.text === 'string' && data.text !== '' ? data.text : messageOf(data),
            raw: truncate(safeJson(data), 8000),
          };
          record.message = describeError(record);
          records.push(record);
        }
      }
      return records;
    }

    function mergeRuntimeNotice(records, notice, observedAt) {
      if (typeof notice !== 'string' || notice.trim() === '') return records;
      const text = notice.trim();
      for (const record of records) {
        if (record.message.indexOf(text) !== -1 || text.indexOf(record.message) !== -1) return records;
      }
      let top = 0;
      for (const record of records) if (Number.isFinite(record.seq) && record.seq > top) top = record.seq;
      const runtimeRecord = {
        id: 'runtime:' + text,
        seq: top + 0.5,
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
      runtimeRecord.message = describeError(runtimeRecord);
      return records.concat([runtimeRecord]);
    }

    function sortRecords(records) {
      return records.slice().sort((left, right) => right.seq - left.seq);
    }

    /**
     * Failures that repeat verbatim are one problem, not many. A tool failing on
     * every step would otherwise bury everything else, so the card keeps the
     * newest copy and counts the rest.
     */
    function groupKey(record) {
      const cause = causeKeyOf(record);
      if (cause !== null) {
        return [
          record.source,
          cause,
          record.tool === null ? '' : String(record.tool),
          record.path === null ? '' : String(record.path),
        ].join(String.fromCharCode(1));
      }
      return [
        record.source,
        record.code === null ? '' : String(record.code),
        record.tool === null ? '' : String(record.tool),
        record.path === null ? '' : String(record.path),
        record.message,
      ].join('\u0001');
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
        existing.count += 1;
        existing.seqs.push(record.seq);
        // Records arrive newest first, so the last merge carries the oldest time.
        if (typeof record.at === 'number') existing.firstAt = record.at;
      }
      return grouped;
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
.emx-search { flex: 1 1 140px; min-width: 120px; max-width: 220px; padding: 3px 8px; border: 1px solid var(--dsw-alias-border-l2); border-radius: var(--dsw-radius-md); background: var(--dsw-alias-bg-base); color: inherit; font: inherit; font-size: 12px; line-height: 18px; }
.emx-search:focus { outline: none; border-color: var(--dsw-alias-border-l3); }
.emx-docsTrigger { flex: none; }
.emx-docsPanel { flex: none; display: grid; gap: 1px; max-height: 268px; overflow: auto; padding: 2px 14px 10px; border-bottom: 1px solid var(--dsw-alias-border-l1); }
.emx-docsGroup { padding: 6px 0 2px; color: var(--dsw-alias-label-tertiary); font-size: 10px; line-height: 14px; letter-spacing: 0.06em; text-transform: uppercase; }
.emx-docRow { display: grid; grid-template-columns: 84px 1fr; gap: 10px; padding: 2px 0; font-size: 12px; line-height: 17px; }
.emx-docName { color: var(--dsw-alias-label-primary); }
.emx-docText { color: var(--dsw-alias-label-secondary); }
.emx-searchTip { padding: 0 14px 6px; color: var(--dsw-alias-label-tertiary); font-size: 11px; line-height: 16px; flex: none; }
.emx-chip { font: inherit; font-size: 11px; line-height: 16px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l2); background: transparent; color: var(--dsw-alias-label-tertiary); cursor: pointer; }
.emx-chip:hover { border-color: var(--dsw-alias-border-l3); color: var(--dsw-alias-label-primary); }
.emx-chipActive { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); }
.emx-badgeCount { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); }
.emx-badgeResolved { border-color: var(--dsw-alias-state-success-primary); color: var(--dsw-alias-state-success-primary); }
.emx-metaSpacer { flex: 1; }
.emx-message { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-primary); white-space: pre-wrap; word-break: break-word; background: var(--dsw-alias-bg-base); border: 1px solid var(--dsw-alias-border-l1); border-radius: var(--dsw-radius-sm); padding: 6px 8px; max-height: 132px; overflow: auto; }
.emx-cause { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); padding-left: 8px; border-left: 2px solid var(--dsw-alias-state-error-primary); }
.emx-next { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-primary); padding-left: 8px; border-left: 2px solid var(--dsw-alias-state-success-primary); }
.emx-badgeFatal { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); font-weight: 600; }
.emx-badgeRecover { color: var(--dsw-alias-label-tertiary); }
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
.emx-btnEnd { margin-left: auto; }
.emx-state { color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.emx-stateError { color: var(--dsw-alias-state-error-primary); }
.emx-empty { padding: 20px 14px; color: var(--dsw-alias-label-tertiary); display: flex; flex-direction: column; gap: 6px; }
.emx-emptyTitle { color: var(--dsw-alias-label-secondary); font-weight: 500; }
.emx-foot { padding: 0 14px 10px; color: var(--dsw-alias-label-caption); font-size: 11px; flex: none; }
.emx-loadOlder { display: flex; align-items: center; gap: 8px; padding: 0 14px 10px; flex: none; }
.emx-rowAlert { display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; color: var(--dsw-alias-state-error-primary); }
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
        const { record, t, isNew, session, onHandled, sessionId, resolved, onResolve, onUnresolve } = props;
        const sessionRef =
          typeof sessionId === 'string' && sessionId !== ''
            ? sessionId
            : session !== undefined && typeof session.id === 'string'
              ? session.id
              : '';
        const [open, setOpen] = useState(false);
        const [copyState, setCopyState] = useState('');
        const [sendState, setSendState] = useState('');
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
        const causeKey = useMemo(() => causeKeyOf(record), [record]);
        const causeText = causeKey === null ? '' : t(causeKey);

        // A turn error kills the turn; everything else leaves the session usable.
        const isFatal = record.source === 'turn';
        const nextText = t((causeKey !== null && NEXT_ACTIONS[causeKey]) || 'next.default');

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
        }, [label, turnText, timeText, record.code, causeText, argsText, scaleText, record.raw, record.seq, repeats, record.seqs, t]);

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
          (repeats ? ' (×' + record.count + ')' : '');
        const sendPrompt = useCallback(
          async (templateKey, extra) => {
            if (session === undefined) return;
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
              sessionId: sessionRef,
              ...extra,
            });
            try {
              const result = await session.prompt([{ type: 'text', text }], 'queue');
              const failed = result !== undefined && result.ok === false;
              setSendState(failed ? 'failed' : 'sent');
              // Handing the failure to the agent is the strongest sign it was read.
              if (!failed && typeof onHandled === 'function') onHandled(record.seq);
            } catch {
              setSendState('failed');
            }
            if (timer.current !== null) window.clearTimeout(timer.current);
            timer.current = window.setTimeout(() => setSendState(''), 3200);
          },
          [session, label, record.turn, record.code, record.tool, record.seq, timeText, summary, causeKey, causeText, argsText, record.args, sessionRef, t],
        );

        const onSend = useCallback(
          () => sendPrompt('send.prompt', {}),
          [sendPrompt],
        );
        const onSendFull = useCallback(
          () => sendPrompt('send.promptFull', { raw: truncate(record.raw, 4000) }),
          [sendPrompt, record.raw],
        );
        // A retry is the narrow loop: same tool, same arguments, one step — the
        // agent gets that scene, not the whole failure history again.
        const onRetry = useCallback(
          () => sendPrompt('send.retry', {}),
          [sendPrompt],
        );
        // The mark hangs off the group key, so every repeat of this cause follows.
        const onToggleResolved = useCallback(() => {
          const key = groupKey(record);
          if (resolved) {
            if (typeof onUnresolve === 'function') onUnresolve(key);
          } else {
            if (typeof onResolve === 'function') onResolve(key, record.seq);
          }
        }, [resolved, onResolve, onUnresolve, record]);

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
            h('span', { className: 'emx-badge emx-badgeError' }, label),
            resolved ? h('span', { className: 'emx-badge emx-badgeResolved' }, t('item.resolved')) : null,
            h(
              'span',
              { className: isFatal ? 'emx-badge emx-badgeFatal' : 'emx-badge emx-badgeRecover' },
              isFatal ? t('item.fatal') : t('item.recover'),
            ),
            repeats ? h('span', { className: 'emx-badge emx-badgeCount' }, '×' + String(record.count)) : null,
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
          causeText === ''
            ? null
            : h('div', { className: 'emx-cause' }, t('item.cause', { cause: causeText })),
          h('div', { className: 'emx-next' }, t('item.next', { next: nextText })),
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
          open
            ? h(
                'div',
                null,
                h('div', { className: 'emx-meta' }, t('item.raw')),
                h('pre', { className: 'emx-raw' }, record.raw),
              )
            : null,
          h(
            'div',
            { className: 'emx-actions' },
            h('button', { type: 'button', className: 'emx-btn', onClick: onCopy }, copyState === '' ? t('item.copy') : copyState),
            h(
              'button',
              { type: 'button', className: 'emx-btn', onClick: onSend, disabled: session === undefined || sendState === 'sending' },
              t('item.send'),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'emx-btn',
                onClick: onRetry,
                disabled: session === undefined || sendState === 'sending',
                title: t('item.retry'),
              },
              t('item.retry'),
            ),
            h(
              'button',
              { type: 'button', className: 'emx-btn emx-btnQuiet', onClick: onToggleResolved },
              resolved ? t('item.unresolve') : t('item.resolve'),
            ),
            h(
              'button',
              { type: 'button', className: 'emx-btn emx-btnQuiet emx-btnEnd', onClick: onSendFull, disabled: session === undefined || sendState === 'sending' },
              t('item.sendFull'),
            ),
            statusText === ''
              ? null
              : h('span', { className: 'emx-state' + (sendState === 'failed' ? ' emx-stateError' : '') }, statusText),
          ),
        );
      }

      function DocsBody(props) {
        const t = props.t;
        const cardKeys = ['copy', 'send', 'retry', 'resolve', 'full'];
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
        const { session, records, topSeq, seen, unread, markRead, markReadThrough, hasMore, loadingOlder, loadOlder } =
          useErrorFeed(ctx, sessionId, { baseline: true });
        const newCount = unread;
        const grouped = useMemo(() => groupRecords(records), [records]);
        const [sourceFilter, setSourceFilter] = useState('all');
        const [unreadOnly, setUnreadOnly] = useState(false);
        // The resolved marks ride the group key, so one click covers every repeat
        // of the same root cause and survives a restart.
        const resolvedMap = useResolvedMap(sessionId);
        const [hideResolved, setHideResolved] = useState(false);
        const [query, setQuery] = useState('');
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
        const needle = query.trim().toLowerCase();
        const resolvedCount = useMemo(
          () => grouped.reduce((sum, group) => (resolvedMap[groupKey(group)] === undefined ? sum : sum + 1), 0),
          [grouped, resolvedMap],
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
        // Space-separated keywords AND together, so "edit sandbox" requires both
        // to hit — a keyword may land on a different field than another.
        const needles = needle === '' ? [] : needle.split(/\s+/);
        const visible = useMemo(
          () =>
            grouped.filter((group) => {
              if (sourceFilter !== 'all' && group.source !== sourceFilter) return false;
              if (unreadOnly && !(seen !== null && group.seq > seen)) return false;
              if (hideResolved && resolvedMap[groupKey(group)] !== undefined) return false;
              if (needles.length > 0) {
                // The keywords match any of: human-readable message, complete raw
                // error text, tool name, file path, error code — every keyword must
                // hit at least one field, and different keywords may hit different
                // fields. Case-insensitive; combines with the source and unread
                // filters above.
                const haystack = [group.message, group.raw, group.tool, group.path, group.code, group.args]
                  .filter((part) => part !== null && part !== undefined && part !== '')
                  .join(' ')
                  .toLowerCase();
                if (!needles.every((keyword) => haystack.includes(keyword))) return false;
              }
              return true;
            }),
          [grouped, sourceFilter, unreadOnly, seen, needles, hideResolved, resolvedMap],
        );
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
                groups: visible.length,
                records: visible.reduce((sum, group) => sum + group.count, 0),
              }),
          );
          visible.forEach((group, index) => {
            const repeats = group.count > 1;
            const heading =
              String(index + 1) +
              '. ' +
              t('item.source.' + group.source) +
              (group.code !== null && group.code !== undefined ? ' · ' + group.code : '') +
              (repeats ? ' ×' + String(group.count) : '');
            parts.push('', '## ' + heading);
            if (group.message !== '') parts.push(group.message);
            const groupCause = causeKeyOf(group);
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
        }, [visible, t, resolvedMap]);

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
            h('span', { className: 'emx-headMeta' }, t('panel.total', { n: String(records.length) })),
            h(
              'button',
              {
                type: 'button',
                className: 'emx-btn emx-btnQuiet',
                onClick: onCopyReport,
                disabled: visible.length === 0,
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
            h('input', {
              className: 'emx-search',
              type: 'search',
              value: query,
              placeholder: t('filter.search'),
              title: t('filter.searchHint'),
              onChange: (event) => setQuery(event.target.value),
            }),
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
                    onClick: () => setHideResolved((value) => !value),
                    title: t('filter.unresolvedHint'),
                  },
                  t('filter.unresolved') + ' ' + String(resolvedCount),
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
              { type: 'button', className: 'emx-chip', onClick: markRead, disabled: unread === 0 },
              t('filter.markAll'),
            ),
          ),
          h('div', { className: 'emx-searchTip' }, t('filter.searchHint')),
          newCount > 0
            ? h(
                'div',
                { className: 'emx-banner', role: 'status' },
                h('span', { className: 'emx-dot', 'aria-hidden': true }),
                h('span', { className: 'emx-bannerText' }, t('banner.new', { n: String(newCount) })),
                h('button', { type: 'button', className: 'emx-btn', onClick: markRead }, t('banner.markRead')),
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
          records.length === 0
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
                  visible.slice(0, renderLimit).map((record) =>
                    h(ErrorItem, {
                      key: record.id,
                      record,
                      t,
                      session,
                      sessionId,
                      isNew: seen !== null && record.seq > seen,
                      onHandled: markReadThrough,
                      resolved: resolvedMap[groupKey(record)] !== undefined,
                      onResolve,
                      onUnresolve,
                    }),
                  ),
                  visible.length > renderLimit
                    ? h(
                        'button',
                        {
                          type: 'button',
                          className: 'emx-btn emx-btnQuiet',
                          onClick: () => setRenderLimit((value) => value + 50),
                        },
                        t('panel.showMore', { n: String(visible.length - renderLimit) }),
                      )
                    : null,
                ),
          h('div', { className: 'emx-foot' }, t('panel.windowNote')),
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
          const { records, unread } = useErrorFeed(ctx, sessionId, { baseline: true });
          if (unread <= 0 || records.length === 0) return null;
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
