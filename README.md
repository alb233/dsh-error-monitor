# 会话报错监控 / Session error monitor

A DSH Web plugin that lists this session's failures as a Conversation View beside
对话 / 上下文 / 编队 / 统计, so a failure is read where the conversation is.

## Install

Requires a DSH build that ships the Web client. Install from the plugin market, or
point at this repository:

```sh
dsh plugin add github:alb233/dsh-error-monitor
```

The repo declares `dsh.bundle` and ships `cordis.patch.yml`, so the CLI can install
from source. Pure ES modules, no build step, and no runtime dependency beyond the
host packages listed in `dsh.client.inject`.

## Requirements

DSH `>=0.2.2-rc.1 <0.3.0-0`, as declared in `engines.dsh`. The Web client and its
`conversation.view` / `sidebar.session.row.leading` slots must be present — they ship
with `@deepseek-ai/dsh-client-ui-conversation` and
`@deepseek-ai/dsh-client-ui-sidebar-right`. The plugin runs inside the Host, so it
needs no separate Node runtime and no network access.

## What it shows

One card per distinct failure the session recorded, newest first. Repeats of the
same failure collapse into one card with `×N`. Five sources feed the same list:

| Source | Event | Fields the card carries |
|---|---|---|
| `回合错误` / Turn error | durable `turn/end` whose `reason.kind` is `error` (an LLM/provider failure) | error code, turn, time, the provider's message (parsed out of a `400: {...}` envelope when there is one) |
| `工具失败` / Tool failure | durable `tool/result` carrying an `error` | tool name and target path (from the matching `tool/call`), step, error code, the tool's own sentence with model-facing hints trimmed |
| `命令失败` / Command failure | durable `command/done` whose `kind` is `error` | command name, output text |
| `子智能体异常` / Subagent failure | durable `user/message` whose `source.kind` is `subagent-settled` and whose wording is not a clean finish | the child session id, the Host's settlement text |
| `运行时通知` / Runtime notice | the session-level `lastAgentError` when it is not already covered | the notice text and when it was first observed |

`describeError()` in `client.js` is the single place that turns a record into the
one-line description. The card and the outgoing prompt read that same string, so
the two can never drift apart. Its order is: tool name, target path, subagent id,
then the most human detail available, falling back to the bare code so an unknown
failure stays identifiable. Markup is stripped first — an HTML error page ("504 …
网站请求超时") loses its conditional comments and inline CSS while keeping the
sentence that matters.

The provider envelope is the one place the raw text is ugly:
`400: {"message":"Invalid request parameter","type":"invalid_request_error","param":"","code":null}`
is parsed to `Invalid request parameter (400)`, and a `param` is appended when the
gateway names one. A tool failure ends its sentence where escalation guidance for
the model begins (`retry this exact operation once with sandbox_permissions…`); the
full text survives in the raw error. Both rules live in `turnDetail()` and
`stripToolHints()`.

A subagent notice carries no status field, so its wording is the status: the Host
writes "finished and will do no further work" for a clean finish (ignored — a
notice is sent on every settle, success included) and "failed before it finished"
or similar otherwise (carded as `子智能体异常`). The child's own closing words,
which follow `Its closing message:`, are kept in the raw error but never used to
judge the outcome, and never reach the card.

For a `turn/end` error the card also carries the scale of the last completed
request: the newest `assistant/message` before the failure contributes its
`inputTokens + cacheReadTokens`, shown as e.g. `最近一次请求 ≈ 180.3K tokens（输入
177,658 · 缓存 2,688）`. The failing request itself records no usage (its attempt
ends with all-zero counters), so this is the closest size clue the window holds —
and it is what tells a provider-side rejection apart from a code failure at a
glance. The same line is included by 复制详情. A failure with no completed request
before it shows no scale line.

## Reading it

- The tab keeps one fixed wording, `会话报错`; only the sidebar row shows unread state.
- A session row in the left sidebar swaps its state dot for a red warning triangle
  while that session has unread failures.
- Inside the view, a red banner sits at the top of the panel (`sticky`), counts
  what arrived since you last looked, and offers **标记已读**. While unread remains,
  the header's total is red too.
- Older failures are not in the live window: **加载更早记录** pulls one Turn-aligned
  page per click (`session.loadOlder()`), so a long session never loads at once.
- A failure that repeats verbatim (same source, code, tool, path and text) is one
  problem: the card shows `×N` and the first occurrence's time, keeps the newest
  raw error, and 复制详情 lists every `seq`. One noisy tool cannot bury the rest.
- Chips above the list filter by source; the rightmost chip toggles 只看未读. The
  banner's count stays the true unread total, and a filter that hides everything
  says so instead of looking like an empty session.
- Each card can **复制详情** (clipboard, never truncated, includes `seq=`), **发回对话**
  (a queued prompt carrying a trimmed summary plus the event `seq`), or
  **发送完整原文** (the same prompt with the full raw error, right-aligned because it
  costs far more tokens).

## Auditing what a failure will look like

Summaries can only be judged by reading them, and waiting for the user to hit a new
kind of failure is not acceptable. This script replays a session log through the
same folding rules and prints what each card and prompt would say — no tokens, no
clicks:

```powershell
# newest session
node tools/audit-error-summaries.mjs

# every session on this machine
node tools/audit-error-summaries.mjs --all

# one specific log
node tools/audit-error-summaries.mjs --file <session.v4.jsonl.zstd>

# failures recorded by this session's subagents
node tools/audit-error-summaries.mjs --children

# subagents of one specific parent
node tools/audit-error-summaries.mjs --children --file <parent session.v4.jsonl.zstd>

# replay the built-in fixtures, no session log needed
node tools/audit-error-summaries.mjs --self-test
```

`--children` uses the newest session as the parent unless `--file` names one, and
`--all` is ignored in that mode. A parent that never delegated prints
`(no subagent session recorded for this session)`.

It reports the count per source and per `source:code`, then the rendered text of
each record. Records that the panel would collapse are printed as one line with
`×N` and every `seq`, so the audit shows the same list the reader sees. The script
mirrors `describeError` / `foldErrors` / `groupRecords`; when the extraction
changes in `client.js`, update the script in the same change.

`--self-test` replays `tools/audit-error-summaries.fixtures.mjs` through the same
folding rules and asserts the rendered text, so a rule change shows up as a fixture
diff instead of silently drifting. The four cases cover the provider-envelope parse,
its plain-message fallback, the tool-hint trim, and the subagent wording filter
(including the closing-message exclusion).

### Subagent failures

A subagent runs as **its own Session**, not as part of the parent's event window: its
log header carries `parentSession`, `origin: 'subagent'` and `delegationDepth`, and the
Host's session list carries those rows even though the UI hides them. This client-only
build reads only the session on screen, and a child's own `turn/end` and `tool/result`
records never enter that window. The `subagent` tool result carries nothing but
`started subagent <id>`.

What does reach the parent is a settlement notice: a durable `user/message` whose
`source.kind` is `subagent-settled`, with `form: 'notice'`, a `summary` and
`senderSessionId` naming the child. Every settle sends one — success included — and the
wording is the only status it carries, so the panel cards the non-clean ones as
`子智能体异常` and drops the rest (verified against this session's own log,
2026-11-05). Limits: no structured code, no child tool errors, and workflow runs send
no notice at all.

`--children` stays the way to see the full picture: it reads the parent header, scans
every session log for `origin === 'subagent' && parentSession === <parent id>`, folds
each child with the same rules, and prints per-child counts plus the rendered text. A
session that never delegated prints `(no subagent session recorded for this session)`.

What it established on this machine (2026-11-05): subagent failures are recorded
normally — across 134 subagent sessions, 13 had `turn/end` errors and 18 had tool
errors (one child carried 20). The settlement notice covers a child that dies mid-run;
tool errors a child recovers from live only in its own log.

### Not covered online

Two heavier paths remain unimplemented, in cost order:

1. **Retain the child session** — `ctx.sessions.subagentAddress(id)` turns a child id
   into a `SubagentAddress`, and `retain(target)` opens that generation; its
   `binding.eventSource` folds exactly like the parent's. This yields the child's real
   `turn/end` and `tool/result` records, but costs one RPC per child, reads a tail window
   (≤500 messages), can fail with `subagent/unauthorized`, parent-unavailable, or an
   archived child, and needs a composite key (`childId:seq`) plus a per-child unread
   watermark because child sequence numbers restart at 1.
2. **Aggregate in the Host half** — a Host plugin's `ctx.sessions.list()` returns every
   live Session with no origin filter, and `session/event` reaches every session
   including children. Most complete and independent of the loaded window, but exposing
   that to the panel needs a Remote namespace/route, which is not an ordinary plugin API.

Location: `<workspace>/tools/audit-error-summaries.mjs`.

## Data scope

The panel reads only this session's own event window through the Session log mirror
the Web client already holds (`session.eventSource`), plus the session-level runtime
notice. It requests no additional data source, network access, or Host endpoint, and
it writes nothing back into the session log. The only thing it persists is the local
read watermark, in `localStorage` under this package's key.

## Where it lives

Registered as `conversation.view`, so it appears in the Conversation's View tab row
next to 对话 / 上下文 / 编队 / 统计. The unread triangle registers into
`sidebar.session.row.leading`. Nothing is model-facing: the Host half is an empty
`apply()` that exists only so the Loader has a row.

The stylesheet is rendered by the view body, so anything drawn outside it (the
sidebar triangle) carries inline styles instead of a class.

## Uninstall behaviour

Unloading the plugin withdraws the View registration and the row decoration; the
tab disappears and the sidebar rows return to their own state dot. Nothing else in
the layout is touched.

---

# 中文版

## 安装

需要带 Web 客户端的 DSH 版本。可以从插件市场安装，或直接指向本仓库：

```sh
dsh plugin add github:alb233/dsh-error-monitor
```

仓库声明了 `dsh.bundle` 并附带 `cordis.patch.yml`，因此 CLI 可以直接从源码安装。
纯 ES module，无构建步骤，除 `dsh.client.inject` 里列出的宿主包之外没有运行时依赖。

## 环境要求

DSH `>=0.2.2-rc.1 <0.3.0-0`（见 `package.json` 的 `engines.dsh`）。需要 Web 客户端
及其 `conversation.view` / `sidebar.session.row.leading` 插槽，这两者随
`@deepseek-ai/dsh-client-ui-conversation` 与 `@deepseek-ai/dsh-client-ui-sidebar-right`
提供。插件在宿主内运行，不需要单独的 Node 运行时，也不访问网络。

## 它显示什么

每类不同的失败一张卡，最新在前。完全相同的失败（来源、错误码、工具、路径、文案
都一致）合并成一张，标 `×N`。五类来源：

| 来源 | 事件 | 卡片携带 |
|---|---|---|
| 回合错误 | `reason.kind` 为 `error` 的 durable `turn/end`（模型/供应商失败） | 错误码、轮次、时间、供应商原文（有 `400: {...}` 信封时解析出来） |
| 工具失败 | 带 `error` 的 durable `tool/result` | 工具名与目标路径（取自匹配的 `tool/call`）、step、错误码、工具自己的话（裁掉面向模型的提示） |
| 命令失败 | `kind` 为 `error` 的 durable `command/done` | 命令名、输出文本 |
| 子智能体异常 | `source.kind` 为 `subagent-settled`、且文案不是正常结束的 durable `user/message` | 子会话 id、宿主的结算文案 |
| 运行时通知 | 尚未被覆盖的会话级 `lastAgentError` | 通知文本与首次观察到的时间 |

`client.js` 里的 `describeError()` 是唯一把记录转成一行描述的地方：卡片和发回对话
读的是同一个字符串，所以两者不会漂移。顺序是工具名、目标路径、子智能体 id、最像
人话的细节，最后退回裸错误码，让不认识的失败仍然可辨识。先剥掉 markup——一页 HTML
错误（比如 "504 … 网站请求超时"）会丢掉条件注释和内联 CSS，只留下有用的那句话。

供应商信封是原文里最丑的一处：`400: {"message":"Invalid request parameter",...}`
会被解析成 `Invalid request parameter (400)`，网关给了 `param` 就附在后面。工具失败的
句子止于面向模型的升级提示（`retry this exact operation once with sandbox_permissions…`），
完整原文仍保留在 raw 里。这两条规则分别在 `turnDetail()` 和 `stripToolHints()`。

子智能体通知没有状态字段，**文案就是状态**：宿主用 "finished and will do no further
work" 表示正常结束（丢弃——每次结算都会发，成功也发），否则是 "failed before it
finished" 之类（记为「子智能体异常」）。子会话自己的遗言（`Its closing message:` 之后）
只保留在 raw 里，既不参与判断，也不进卡片。

`turn/end` 错误还会带上最近一次完成请求的规模：失败前最新的 `assistant/message`
贡献它的 `inputTokens + cacheReadTokens`，显示成 `最近一次请求 ≈ 180.3K tokens
（输入 177,658 · 缓存 2,688）`。失败的那次请求自身不记 usage（attempt 计数器全 0），
所以这是窗口里最接近的规模线索——它能让人一眼分清"网关拒收请求"和"代码报错"。
复制详情里也有这一行；失败前没有已完成请求时不显示。

## 怎么读

- 标签页固定叫「会话报错」；只有左侧会话行显示未读状态。
- 某个会话有未读失败时，左侧那一行的状态点会换成红色警告三角。
- 视图内，面板顶部的红色横幅（`sticky`）统计你上次查看之后新增的数量，并提供
  「标记已读」；还有未读时，表头总数也是红的。
- 更早的失败不在实时窗口里：「加载更早记录」每次拉一页 Turn 对齐的记录
  （`session.loadOlder()`），长会话不会一次全载入。
- 完全相同的重复失败是同一个问题：卡片显示 `×N` 和首次出现的时间，保留最新一次的
  raw，复制详情列出每个 `seq`——一个吵人的工具不会把其他问题埋掉。
- 列表上方的 chip 按来源筛选，最右的 chip 切换「只看未读」；横幅计数始终是真实未读
  总数，而筛选把内容全隐藏时会明说，不会看起来像空会话。
- 每张卡可以「复制详情」（剪贴板，不截断，含 `seq=`）、「发回对话」（排队一条 prompt，
  带精简摘要和事件 `seq`）、「发送完整原文」（同样的 prompt 带完整 raw，右对齐，因为
  它贵得多）。

## 审计：失败会显示成什么样

摘要只能靠读来判断，而等用户撞上一种新失败是不可接受的。这个脚本用同一套折叠规则
重放会话日志，打印每张卡和每条 prompt 会说什么——不花 token、不用点击：

```powershell
# 最新会话
node tools/audit-error-summaries.mjs

# 本机所有会话
node tools/audit-error-summaries.mjs --all

# 指定某个日志
node tools/audit-error-summaries.mjs --file <session.v4.jsonl.zstd>

# 本会话子智能体记录到的失败
node tools/audit-error-summaries.mjs --children

# 指定父会话的子智能体
node tools/audit-error-summaries.mjs --children --file <parent session.v4.jsonl.zstd>

# 重放内置夹具，不需要会话日志
node tools/audit-error-summaries.mjs --self-test
```

`--children` 默认以最新会话为父会话（`--file` 可另指），这种模式下 `--all` 会被忽略。
从未委派过子智能体的父会话会打印 `(no subagent session recorded for this session)`。

输出按来源和 `source:code` 计数，再打印每条记录的渲染文本。面板会合并的记录打印成
一行，带 `×N` 和所有 `seq`，所以审计看到的列表与读者看到的一致。脚本镜像
`describeError` / `foldErrors` / `groupRecords`；`client.js` 的提取规则一变，同一次改动
里就要更新脚本。

`--self-test` 用同一套规则重放 `tools/audit-error-summaries.fixtures.mjs` 并断言渲染
文本，规则变化会以夹具差异暴露，而不是悄悄漂移。5 个用例覆盖：供应商信封解析、
它的纯文本回退、工具提示裁剪、子智能体文案过滤（含遗言排除）、重复失败合并。

### 子智能体失败

子智能体以**独立 Session** 运行，不在父会话的事件窗口里：它的日志头带
`parentSession`、`origin: 'subagent'` 和 `delegationDepth`，宿主的会话列表里也有这些行，
只是 UI 把它们藏了起来。本插件是纯客户端实现，只读屏幕上那个会话，子会话自己的
`turn/end` 与 `tool/result` 永远进不了这个窗口；`subagent` 工具的结果里只有
`started subagent <id>`。

能到父会话的是一条结算通知：`source.kind` 为 `subagent-settled`、`form: 'notice'`、
带 `summary` 和 `senderSessionId`（指向子会话）的 durable `user/message`。每次结算都
发一条——成功也发——而文案是它唯一的状态，所以面板把非正常结束的记为「子智能体异常」，
其余丢弃（已用本会话自己的日志验证，2026-11-05）。局限：没有结构化错误码、没有子会话的
工具错误、workflow 子会话完全不发通知。

要看全貌仍用 `--children`：读父会话头，扫描所有会话日志找
`origin === 'subagent' && parentSession === <父 id>`，用同一套规则折叠每个子会话，
打印每子会话计数与渲染文本。

本机实测（2026-11-05）：子智能体的失败会被正常记录——134 个子会话中，13 个有
`turn/end` 错误、18 个有工具错误（其中一个子会话 20 条）。结算通知覆盖的是"中途死掉"
的子会话；子会话自己恢复过来的工具错误只存在于它自己的日志里。

### 在线未覆盖的两条路径

两条更重的路径尚未实现，按成本排序：

1. **保留（retain）子会话**——`ctx.sessions.subagentAddress(id)` 把子会话 id 变成
   `SubagentAddress`，`retain(target)` 打开那一代；它的 `binding.eventSource` 与父会话
   一样折叠。这能拿到子会话真实的 `turn/end` 与 `tool/result`，代价是每个子会话一次 RPC、
   只读尾窗（≤500 条消息），可能遇到 `subagent/unauthorized`、父会话不可用或子会话已
   归档，并且需要复合键（`childId:seq`）和逐子会话的未读水位，因为子会话序号从 1 重开。
2. **宿主侧聚合**——Host 插件的 `ctx.sessions.list()` 返回全部 live Session（不过滤
   origin），`session/event` 覆盖包括子会话在内的所有会话。最完整、也不依赖已加载窗口，
   但把它暴露给面板需要 Remote 命名空间/路由，那不是普通插件 API。

位置：`<workspace>/tools/audit-error-summaries.mjs`。

## 数据范围

面板只通过 Web 客户端已经持有的 Session 日志镜像（`session.eventSource`）读当前会话
自己的事件窗口，加上会话级运行时通知。它不请求额外数据源、网络或宿主端点，也不往
会话日志里写任何东西。唯一持久化的是本地已读水位，存在 `localStorage` 里本包的键下。

## 它住在哪

注册为 `conversation.view`，所以出现在会话的 View 标签行，与 对话 / 上下文 / 编队 /
统计 并列。未读三角注册到 `sidebar.session.row.leading`。没有任何面向模型的东西：
宿主半边是一个空的 `apply()`，只为让 Loader 有一行。

样式表由视图主体渲染，所以画在它之外的（侧栏三角）用内联样式而不是 class。

## 卸载行为

卸载插件会撤回 View 注册和行装饰；标签页消失，侧栏行回到它们自己的状态点。
布局的其他部分不受影响。
