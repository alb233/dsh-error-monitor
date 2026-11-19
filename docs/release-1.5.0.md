## 1.5.0

面板现在不只说明「为什么失败」，还会指出**这类失败重做一次也不会成功**。

### 新增签名（原因 + 处理建议，中英双语）

| 签名 | 处理建议 |
|---|---|
| `BLOCKED by CC Safety Net` | 按它点名的规则改，原样重试不会有变化 |
| `unknown tool ""` / `unknown tool "skill({...})"` | 换模型或换路由——provider 生不出可用的工具调用 |
| `file has not been read` | 先 read 再改 |
| `invalid arguments` / `missing required property` | 按 schema 补上缺的那一项 |
| `cannot be anchored` | 先 `acp_status` 拿最新 refs |
| `does not support image` | 换有视觉能力的模型 |
| `*.asar` 路径 | 在解包后的目录或单个文件里搜 |
| `非法闭环迁移` / `status 必须是` | 看合法状态列表再一步步推进 |
| `cross-origin redirect` | 直接请求它指向的 URL |
| `web fetch failed` / `TypeError: fetch failed` | 网络或代理问题（以前被误判成 JavaScript 类型错误） |
| `api key provided is invalid` | 凭据失效（以前没有归因） |

### 重试循环

同一次失败从第 3 次起，卡片加 `重试循环 ×N` 标记，处理建议改为「先别重发这次调用——…」。不到 3 次只显示 `×N`，重复本身还只是一次偶发。

### 工程

- 新增 `_tools/check-locale-keys.mjs`：中英键名一致、`{占位符}` 不丢、每条 cause 必有 next、无死文案。
- `_tools/check-error-hints.mjs` 用例 28 → 42，覆盖真实会话里反复出现的签名（含 `signal: killed`、`os error 2` 这类易误归因的对照项）。
