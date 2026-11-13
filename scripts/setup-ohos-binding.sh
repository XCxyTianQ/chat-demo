#!/bin/sh
# 在 HarmonyOS / OpenHarmony (aarch64) 上补齐 rspack 的原生绑定。
#
# 背景：rspack 的 napi 绑定按 process.platform 分支加载，
# openharmony 分支只认本地文件 rspack.linux-arm64-ohos.node 或 npm 包
# @rspack/binding-linux-arm64-ohos（该包未发布）。因此 npm 上装机后
# 直接跑构建会报 "Cannot find module '@rspack/binding-linux-arm64-ohos'"。
#
# 做法：取同版本的 linux-arm64-musl 绑定（OpenHarmony 的 libc 基于 musl），
# 用 binary-sign-tool 自签名（未签名的 .so/.node 会被系统拒绝 dlopen，
# 报 "Permission denied"），再以 openharmony 分支期望的文件名落到绑定目录。
set -e

cd "$(dirname "$0")/.."

BIND=$(ls -d node_modules/.pnpm/@rspack+binding@*/node_modules/@rspack/binding 2>/dev/null | head -1)
if [ -z "$BIND" ]; then
  echo "找不到 @rspack/binding，请先执行 pnpm install" >&2
  exit 1
fi

TARGET="$BIND/rspack.linux-arm64-ohos.node"
if [ -f "$TARGET" ]; then
  echo "已存在：$TARGET"
  exit 0
fi

VERSION=$(node -p "require('./$BIND/package.json').version")
echo "rspack binding 版本：$VERSION"

SIGNER=$(command -v binary-sign-tool || true)
if [ -z "$SIGNER" ]; then
  echo "缺少 binary-sign-tool，无法签名（鸿蒙上未签名的原生模块会加载失败）" >&2
  exit 1
fi

TMP=.ohos-binding-tmp
rm -rf "$TMP"
mkdir -p "$TMP"
URL="https://registry.npmjs.org/@rspack/binding-linux-arm64-musl/-/binding-linux-arm64-musl-$VERSION.tgz"
echo "下载 $URL"
curl -fsSL -o "$TMP/binding.tgz" "$URL"
tar xzf "$TMP/binding.tgz" -C "$TMP" --strip-components=1

"$SIGNER" sign -inFile "$TMP/rspack.linux-arm64-musl.node" -outFile "$TARGET" -selfSign 1
"$SIGNER" display-sign -inFile "$TARGET"
rm -rf "$TMP"
echo "完成：$TARGET"
