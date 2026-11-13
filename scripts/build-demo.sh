#!/bin/sh
# 用本机 .demo-key 里的 demo 专用 Key 构建产物。
# Key 不进入仓库（.demo-key 已 gitignore），但会被写进 dist/，因此产物不可公开部署。
set -e
cd "$(dirname "$0")/.."

[ -f .demo-key ] || { echo "缺少 .demo-key（一行一个 Key）" >&2; exit 1; }

CHAT_DEMO_API_KEY=$(tr -d ' \t\r\n' < .demo-key)
[ -n "$CHAT_DEMO_API_KEY" ] || { echo ".demo-key 为空" >&2; exit 1; }
export CHAT_DEMO_API_KEY

echo "构建中：API Key 来自 .demo-key（产物含密钥，仅限本机/内网使用）"
exec pnpm build
