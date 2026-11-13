#!/usr/bin/env node
// 零依赖静态服务器：托管 dist/，与 DSH WebUI 的预览方式（http-server dist）等价。
// 用法：node scripts/serve-static.mjs [port] [--dir dist]
import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'

const args = process.argv.slice(2)
const port = Number(args.find((a) => /^\d+$/.test(a)) ?? process.env.PORT ?? 4173)
const dirIndex = args.indexOf('--dir')
const root = resolve(dirIndex >= 0 && args[dirIndex + 1] ? args[dirIndex + 1] : 'dist')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.map': 'application/json; charset=utf-8',
}

const send = (res, status, body, type = 'text/plain; charset=utf-8') => {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-cache' })
  res.end(body)
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  let pathname = decodeURIComponent(url.pathname)
  if (pathname.endsWith('/')) pathname += 'index.html'

  // 防目录穿越：解析后必须仍在 root 之内
  const filePath = normalize(join(root, pathname))
  if (!filePath.startsWith(root)) return send(res, 403, 'Forbidden')

  try {
    let info = await stat(filePath)
    if (info.isDirectory()) {
      const indexPath = join(filePath, 'index.html')
      info = await stat(indexPath)
      return pipe(res, indexPath, info.size)
    }
    return pipe(res, filePath, info.size)
  } catch {
    // 单页应用回退
    try {
      const indexPath = join(root, 'index.html')
      const info = await stat(indexPath)
      return pipe(res, indexPath, info.size)
    } catch {
      return send(res, 404, 'Not Found')
    }
  }
})

const pipe = (res, filePath, size) => {
  res.writeHead(200, {
    'content-type': MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
    'content-length': size,
    'cache-control': 'no-cache',
  })
  createReadStream(filePath).pipe(res)
}

server.listen(port, '127.0.0.1', () => {
  console.log(`静态服务已启动： http://127.0.0.1:${port}/  （根目录 ${root}）`)
})
