/**
 * Regression cases for the folding rules the 会话报错 panel and the audit script
 * share. `node tools/audit-error-summaries.mjs --self-test` replays them and
 * compares the rendered card text, so a rule change is caught without hand-
 * building a session log.
 *
 * Keep these in sync with `client.js`: the script mirrors it, and a deliberate
 * behaviour change should show up as a fixture diff in the same commit.
 */

export const CASES = [
  {
    name: 'turn error parses the provider envelope',
    events: [
      {
        type: 'assistant/message',
        seq: 1,
        time: 1,
        data: { turn: 1, step: 1, usage: { inputTokens: 177658, cacheReadTokens: 2688, outputTokens: 425 } },
      },
      {
        type: 'turn/end',
        seq: 2,
        time: 2,
        data: {
          turn: 1,
          step: 2,
          reason: {
            kind: 'error',
            error: {
              message: '400: {"message":"Invalid request parameter","type":"invalid_request_error","param":"","code":null}',
              code: 'INVALID_REQUEST',
            },
          },
        },
      },
    ],
    expect: [
      {
        source: 'turn',
        code: 'INVALID_REQUEST',
        message: 'Invalid request parameter (400)',
        usage: { input: 177658, cache: 2688 },
      },
    ],
  },
  {
    name: 'turn error without an envelope keeps the plain message',
    events: [
      {
        type: 'turn/end',
        seq: 1,
        time: 1,
        data: { turn: 2, step: 3, reason: { kind: 'error', error: { message: 'socket hang up', code: 'ECONNRESET' } } },
      },
    ],
    expect: [{ source: 'turn', code: 'ECONNRESET', message: 'socket hang up [ECONNRESET]' }],
  },
  {
    name: 'tool failure drops model-facing escalation hints',
    events: [
      {
        type: 'tool/call',
        seq: 1,
        time: 1,
        data: { callId: 'call_1', name: 'edit', arguments: '{"file_path":"C:\\\\x\\\\README.md"}' },
      },
      {
        type: 'tool/result',
        seq: 2,
        time: 2,
        data: {
          callId: 'call_1',
          error: {},
          message: {
            toolCallId: 'call_1',
            content: [
              {
                type: 'text',
                text: '[sandbox: file access denied under workspace-write mode] [sandbox: escalation available — retry this exact operation once with sandbox_permissions (the narrative)]',
              },
            ],
          },
        },
      },
    ],
    expect: [
      {
        source: 'tool',
        code: null,
        message: 'edit · C:\\x\\README.md — [sandbox: file access denied under workspace-write mode]',
      },
    ],
  },
  {
    name: 'subagent notices: only abnormal ends are carded, closing words stay out',
    events: [
      {
        type: 'user/message',
        seq: 1,
        time: 1,
        data: {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Background subagent aaaa1111-0000-0000-0000-000000000001 finished and will do no further work unless you send it more.',
            },
          ],
          source: { kind: 'subagent-settled', form: 'notice', senderSessionId: 'aaaa1111-0000-0000-0000-000000000001' },
          id: 'm1',
        },
      },
      {
        type: 'user/message',
        seq: 2,
        time: 2,
        data: {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Background subagent bbbb2222-0000-0000-0000-000000000002 failed before it finished. Its closing message: I stopped at the second file.',
            },
          ],
          source: { kind: 'subagent-settled', form: 'notice', senderSessionId: 'bbbb2222-0000-0000-0000-000000000002' },
          id: 'm2',
        },
      },
      {
        type: 'user/message',
        seq: 3,
        time: 3,
        data: { role: 'user', content: [{ type: 'text', text: 'ordinary user message' }], id: 'm3' },
      },
    ],
    expect: [
      {
        source: 'subagent',
        code: null,
        message: 'subagent bbbb2222 — Background subagent bbbb2222-0000-0000-0000-000000000002 failed before it finished.',
      },
    ],
  },
  {
    name: 'repeated failures collapse into one group',
    events: [
      {
        type: 'tool/call',
        seq: 1,
        time: 1,
        data: { callId: 'call_1', name: 'edit', arguments: '{"file_path":"C:\\\\x\\\\README.md"}' },
      },
      ...[2, 3, 4].map((seq) => ({
        type: 'tool/result',
        seq,
        time: seq,
        data: {
          callId: 'call_1',
          error: {},
          message: {
            toolCallId: 'call_1',
            content: [{ type: 'text', text: '[sandbox: file access denied under workspace-write mode]' }],
          },
        },
      })),
    ],
    expect: [
      {
        source: 'tool',
        code: null,
        message: 'edit · C:\\x\\README.md — [sandbox: file access denied under workspace-write mode]',
      },
      {
        source: 'tool',
        code: null,
        message: 'edit · C:\\x\\README.md — [sandbox: file access denied under workspace-write mode]',
      },
      {
        source: 'tool',
        code: null,
        message: 'edit · C:\\x\\README.md — [sandbox: file access denied under workspace-write mode]',
      },
    ],
    expectGroups: [{ count: 3, seqs: [4, 3, 2] }],
  },
];
