# 在 HarmonyOS PC 上构建

本机实测环境：HarmonyOS（HongMeng Kernel 1.13.0）、aarch64、Node v26.13.0、pnpm 11.7.0。
`pnpm install` 正常，但要跑构建必须先补一个签名过的 rspack 原生绑定。

## 一、rspack 绑定（必做）

```sh
pnpm install
sh scripts/setup-ohos-binding.sh
pnpm build   # 实测 Rspack compiled successfully in 1.65 s
```

原因有两层：

1. **缺平台包**。`@rspack/binding/binding.js` 有 `process.platform === 'openharmony'` 分支，
   只认本地文件 `rspack.linux-arm64-ohos.node` 或 npm 包 `@rspack/binding-linux-arm64-ohos`，
   而后者并未发布，因此未打补丁时报
   `Cannot find module '@rspack/binding-linux-arm64-ohos'`。
2. **未签名原生库加载不了**。直接拿 linux-arm64-musl 的 `.node` 去 require 会被系统拒绝，
   报 `Error loading shared library ...: Permission denied`；`binary-sign-tool display-sign`
   对原文件显示 `code signature is not found`。签名后（`-selfSign 1`）即可正常加载，
   且不需要可执行位（hmdfs 上文件权限被量化成 0660）。

脚本做的就是：按已安装版本下载 `@rspack/binding-linux-arm64-musl`，自签名后以
`rspack.linux-arm64-ohos.node` 的名字放进 `node_modules`。副作用是 `pnpm install`
之后需要重跑一次。

## 二、开发服务器

```sh
pnpm dev   # http://localhost:8090 → 实测 200
```

## 三、类型检查（当前不可用）

`pnpm type` 在鸿蒙上失败，原因是 TypeScript 7 的 tsc 已是原生可执行文件，
按平台名去找 `@typescript/typescript-openharmony-arm64` 这个包，而它不存在：

```
Error: Unable to resolve @typescript/typescript-openharmony-arm64.
```

这不影响 `pnpm build`（rspack 用 swc 做转译，不做类型检查）。需要类型检查时可在
Linux / macOS 或 CI 上跑。

## 四、产物

`dist/` 共 153 个文件、5.1 MB，`index.html` 用 defer 脚本和相对路径，可 `file://` 直接打开。
