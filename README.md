# 会话报错监控 / Session error monitor

A DSH Web plugin that lists this session's failures as a Conversation View beside
对话 / 上下文 / 编队 / 统计, so a failure is read where the conversation is.

## Install

Requires a DSH build that ships the Web client. Install it from the plugin
market, or from this repository:

```sh
dsh plugin add github:alb233/dsh-error-monitor
```

The repository declares `dsh.bundle` and ships `cordis.patch.yml`, so the CLI
can install it from source. Plain ES modules, no build step, no runtime
dependencies beyond the Host packages listed under `dsh.client.inject`.

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
