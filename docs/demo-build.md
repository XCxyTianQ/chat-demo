# 用预置 Key 构建 demo

官方产物要求使用者自己在设置里填 API Key。本项目加了一个构建期开关，方便把
「chat 专用 demo Key」直接预置进产物，打开页面即可对话。

```sh
echo 'sk-...' > .demo-key     # 已 gitignore，不进仓库
sh scripts/build-demo.sh      # 读 .demo-key → CHAT_DEMO_API_KEY → pnpm build
pnpm serve                    # http://127.0.0.1:4173/
```

实现方式：`rspack.config.ts` 的 `createConfig({ apiKey })` 把 key 经 `DefinePlugin` 注入
`__DEFAULT_API_KEY__`，`src/services/settings.ts` 在 localStorage 里没有用户填过的 key 时
回落到它。用户自己填的 key 优先级更高，界面和其他行为与上游一致。

## 安全边界

- **产物即密钥**：`dist/` 里的 JS 明文包含 key，只适合本机或内网 demo。
- 不要把 `dist/` 传到公开站点、Pages、对象存储或任何可分发的压缩包。
- `dist/` 与 `.demo-key` 都在 `.gitignore` 里；仓库中只有这套机制，不含密钥本身。
- 需要公开演示时，应改成后端代理：浏览器不持有 key，由服务端追加鉴权头。

## 已验证（2026-11-13，本机）

| 检查项 | 结果 |
|---|---|
| `sh scripts/build-demo.sh` | 2.94 s 构建成功，产物 153 个文件 5.1 MB，bundle 内含预置 key |
| CORS 预检（`Origin: http://127.0.0.1:4173`） | 200，`access-control-allow-headers` 允许 `x-api-key, content-type, anthropic-version, anthropic-beta` |
| 流式 POST `/anthropic/v1/messages` | 200，响应带 `access-control-allow-origin`，SSE 正常逐帧返回 |
| `GET /models` 校验 key | 200，可用模型 `deepseek-flash` |
