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
        'banner.new': '{n} new since you last looked',
        'banner.markRead': 'Mark as read',
        'banner.latest': 'Latest error',
        'filter.all': 'All',
        'filter.unread': 'Unread only',
        'filter.empty': 'No failures match this filter',
        'item.source.turn': 'Turn error',
        'item.source.tool': 'Tool failure',
        'item.source.command': 'Command failed',
        'item.source.subagent': 'Subagent failed',
        'item.source.runtime': 'Runtime notice',
        'item.turn': 'Turn {n}',
        'item.turnUnknown': 'No turn position',
        'item.code': 'Code {code}',
        'item.scale': 'Last request ≈ {tokens} tokens ({input} in · {cache} cached)',
        'item.scaleNoCache': 'Last request ≈ {tokens} tokens ({input} in)',
        'item.since': 'first {time}',
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
          'I hit an error in this session. Please analyse the cause and propose a fix.\n\nSource: {source}\nTurn: {turn}\nTime: {time}\nCode: {code}\nSummary: {summary}\n\nThe summary above is trimmed; the complete raw error is on this record’s “Copy details” action (session event seq={seq}).',
        'send.promptFull':
          'I hit an error in this session. Please analyse the cause and propose a fix.\n\nSource: {source}\nTurn: {turn}\nTime: {time}\nCode: {code}\nRaw error:\n```\n{raw}\n```',
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
        'banner.new': '新报错 {n} 条',
        'banner.markRead': '标记已读',
        'banner.latest': '最新报错',
        'filter.all': '全部',
        'filter.unread': '只看未读',
        'filter.empty': '没有符合筛选的报错',
        'item.source.turn': '回合错误',
        'item.source.tool': '工具失败',
        'item.source.command': '命令失败',
        'item.source.subagent': '子智能体异常',
        'item.source.runtime': '运行时通知',
        'item.turn': '第 {n} 轮',
        'item.turnUnknown': '无轮次位置',
        'item.code': '错误码 {code}',
        'item.scale': '最近一次请求 ≈ {tokens} tokens（输入 {input} · 缓存 {cache}）',
        'item.scaleNoCache': '最近一次请求 ≈ {tokens} tokens（输入 {input}）',
        'item.since': '最早 {time}',
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
          '我在本会话遇到一次报错，请帮我分析原因并给出处理方案。\n\n来源：{source}\n轮次：{turn}\n时间：{time}\n错误码：{code}\n摘要：{summary}\n\n摘要是精简过的；完整原文在该条记录的「复制详情」里（会话事件 seq={seq}）。',
        'send.promptFull':
          '我在本会话遇到一次报错，请帮我分析原因并给出处理方案。\n\n来源：{source}\n轮次：{turn}\n时间：{time}\n错误码：{code}\n原始错误：\n```\n{raw}\n```',
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
     * The seen watermark is read here and in the header badge, so a write must wake
     * both. localStorage alone gives no cross-component notification.
     */
    const seenListeners = new Set();

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
      } catch {
        /* storage unavailable: the panel keeps working, only the watermark resets */
      }
      for (const listener of seenListeners) listener();
    }

    function useSeenValue(key) {
      const subscribe = useCallback((listener) => {
        seenListeners.add(listener);
        return () => seenListeners.delete(listener);
      }, []);
      const getSnapshot = useCallback(() => readNumber(key), [key]);
      return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
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
        if (!noticeTimes.has(key)) noticeTimes.set(key, Date.now());
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
      const records = useMemo(() => collectRecords(entriesSnapshot, sessionSnapshot), [entriesSnapshot, sessionSnapshot]);
      const topSeq = records.length === 0 ? 0 : records[0].seq;
      const seenKey = SEEN_PREFIX + String(sessionId);
      const seen = useSeenValue(seenKey);

      // Only the panel that actually shows the list may seed the watermark; a badge
      // that wrote it on mount would erase the unread state it exists to report.
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

    function truncate(text, limit) {
      if (typeof text !== 'string') return '';
      return text.length <= limit ? text : text.slice(0, limit) + '…';
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
          const record = {
            id: 'tool:' + String(event.seq),
            seq,
            source: 'tool',
            turn,
            step: typeof data.step === 'number' ? data.step : null,
            at,
            tool,
            path,
            code: codeOf(error),
            detail: stripToolHints(explicit !== '' ? explicit : resultText(data)),
            raw: truncate(safeJson({ tool, path, callId, error }), 8000),
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
.emx-head { display: flex; align-items: baseline; gap: 8px; padding: 12px 14px 8px; flex: none; }
.emx-headTitle { font-weight: 600; font-size: 13px; }
.emx-headMeta { color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.emx-banner { position: sticky; top: 0; z-index: 1; margin: 0 14px 10px; padding: 8px 10px; border-radius: var(--dsw-radius-md); border: 1px solid var(--dsw-alias-state-error-primary); background-color: var(--dsw-alias-bg-base); background-image: linear-gradient(color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent), color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent)); display: flex; align-items: center; gap: 8px; flex: none; }
.emx-bannerText { flex: 1; min-width: 0; color: var(--dsw-alias-label-primary); font-weight: 500; }
.emx-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--dsw-alias-state-error-primary); flex: none; }
.emx-list { flex: 1; min-height: 0; overflow: auto; padding: 0 14px 14px; display: flex; flex-direction: column; gap: 8px; }
.emx-card { border: 1px solid var(--dsw-alias-border-l2); border-radius: var(--dsw-radius-md); background: var(--dsw-alias-bg-module-platform); padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; }
.emx-cardNew { border-color: var(--dsw-alias-state-error-primary); box-shadow: 0 0 0 1px color-mix(in srgb, var(--dsw-alias-state-error-primary) 40%, transparent); }
.emx-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.emx-badge { font-size: 11px; line-height: 16px; padding: 1px 6px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l3); color: var(--dsw-alias-label-secondary); }
.emx-badgeError { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); }
.emx-newTag { font-size: 10px; line-height: 14px; padding: 0 5px; border-radius: 999px; background: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-bg-base); font-weight: 600; }
.emx-meta { color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.emx-filters { display: flex; align-items: center; gap: 6px; padding: 0 14px 8px; flex-wrap: wrap; flex: none; }
.emx-chip { font: inherit; font-size: 11px; line-height: 16px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l2); background: transparent; color: var(--dsw-alias-label-tertiary); cursor: pointer; }
.emx-chip:hover { border-color: var(--dsw-alias-border-l3); color: var(--dsw-alias-label-primary); }
.emx-chipActive { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); }
.emx-badgeCount { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); }
.emx-metaSpacer { flex: 1; }
.emx-message { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-primary); white-space: pre-wrap; word-break: break-word; background: var(--dsw-alias-bg-base); border: 1px solid var(--dsw-alias-border-l1); border-radius: var(--dsw-radius-sm); padding: 6px 8px; max-height: 132px; overflow: auto; }
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
        const { record, t, isNew, session, onHandled } = props;
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

        const detail = useMemo(() => {
          const lines = ['[' + label + ']'];
          lines.push(turnText);
          if (timeText !== '') lines.push(timeText);
          if (record.code !== null) lines.push(t('item.code', { code: record.code }));
          if (scaleText !== '') lines.push(scaleText);
          if (repeats) lines.push(t('item.seqs', { seqs: record.seqs.join(', ') }));
          else lines.push('seq=' + String(record.seq));
          lines.push('');
          // Copying is free, so the clipboard always carries the complete raw error.
          lines.push(record.raw);
          return lines.join('\n');
        }, [label, turnText, timeText, record.code, scaleText, record.raw, record.seq, repeats, record.seqs, t]);

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
              summary,
              seq: String(record.seq),
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
          [session, label, record.turn, record.code, record.seq, timeText, summary, t],
        );

        const onSend = useCallback(
          () => sendPrompt('send.prompt', {}),
          [sendPrompt],
        );
        const onSendFull = useCallback(
          () => sendPrompt('send.promptFull', { raw: truncate(record.raw, 4000) }),
          [sendPrompt, record.raw],
        );

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
          { className: 'emx-card' + (isNew ? ' emx-cardNew' : '') },
          h(
            'div',
            { className: 'emx-row' },
            h('span', { className: 'emx-badge emx-badgeError' }, label),
            repeats ? h('span', { className: 'emx-badge emx-badgeCount' }, '×' + String(record.count)) : null,
            record.tool === null ? null : h('span', { className: 'emx-badge' }, record.tool),
            h('span', { className: 'emx-badge' }, turnText),
            isNew ? h('span', { className: 'emx-newTag' }, t('new.tag')) : null,
            h('span', { className: 'emx-metaSpacer' }),
            record.code !== null ? h('span', { className: 'emx-meta' }, t('item.code', { code: record.code })) : null,
            firstText !== '' ? h('span', { className: 'emx-meta' }, t('item.since', { time: firstText })) : null,
            timeText !== '' ? h('time', { className: 'emx-meta' }, timeText) : null,
          ),
          h('div', { className: 'emx-message' }, record.message === '' ? record.raw : record.message),
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
              { type: 'button', className: 'emx-btn emx-btnQuiet emx-btnEnd', onClick: onSendFull, disabled: session === undefined || sendState === 'sending' },
              t('item.sendFull'),
            ),
            statusText === ''
              ? null
              : h('span', { className: 'emx-state' + (sendState === 'failed' ? ' emx-stateError' : '') }, statusText),
          ),
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
        const counts = useMemo(() => {
          const map = new Map();
          for (const group of grouped) map.set(group.source, (map.get(group.source) ?? 0) + 1);
          return map;
        }, [grouped]);
        const visible = useMemo(
          () =>
            grouped.filter((group) => {
              if (sourceFilter !== 'all' && group.source !== sourceFilter) return false;
              if (unreadOnly && !(seen !== null && group.seq > seen)) return false;
              return true;
            }),
          [grouped, sourceFilter, unreadOnly, seen],
        );

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
          ),
          h(
            'div',
            { className: 'emx-filters' },
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
            h(
              'button',
              {
                type: 'button',
                className: 'emx-chip' + (unreadOnly ? ' emx-chipActive' : ''),
                onClick: () => setUnreadOnly((value) => !value),
              },
              t('filter.unread'),
            ),
          ),
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
                  visible.map((record) =>
                    h(ErrorItem, {
                      key: record.id,
                      record,
                      t,
                      session,
                      isNew: seen !== null && record.seq > seen,
                      onHandled: markReadThrough,
                    }),
                  ),
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
          const { records, unread } = useErrorFeed(ctx, sessionId);
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
