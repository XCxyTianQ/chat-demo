import type { CharacterCard } from './types.js'

/** 没有上传头像时，用名字首字 + 色相生成一张稳定的「墨章」头像（纯 SVG，无外部资源）。 */
const escapeXml = (value: string) =>
  value.replace(/[<>&"']/g, (char) => `&#${char.charCodeAt(0)};`)

const hash = (value: string): number => {
  let h = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

export const generatedAvatar = (name: string, accent: number): string => {
  const seed = hash(name)
  const initial = escapeXml([...name.trim()][0] ?? '·')
  const angle = seed % 60
  const h2 = (accent + 28 + (seed % 24)) % 360
  const h3 = (accent + 320) % 360
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${angle} .5 .5)">
<stop offset="0%" stop-color="hsl(${h3} 38% 26%)"/>
<stop offset="55%" stop-color="hsl(${accent} 46% 20%)"/>
<stop offset="100%" stop-color="hsl(${h2} 42% 12%)"/>
</linearGradient>
<radialGradient id="b1" cx="22%" cy="18%" r="60%">
<stop offset="0%" stop-color="hsl(${accent} 72% 68%)" stop-opacity="0.5"/>
<stop offset="100%" stop-color="hsl(${accent} 72% 68%)" stop-opacity="0"/>
</radialGradient>
<radialGradient id="b2" cx="82%" cy="88%" r="55%">
<stop offset="0%" stop-color="hsl(${h2} 70% 60%)" stop-opacity="0.35"/>
<stop offset="100%" stop-color="hsl(${h2} 70% 60%)" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="160" height="160" fill="url(#g)"/>
<rect width="160" height="160" fill="url(#b1)"/>
<rect width="160" height="160" fill="url(#b2)"/>
<circle cx="128" cy="34" r="26" fill="none" stroke="hsl(${accent} 70% 78%)" stroke-opacity="0.18"/>
<text x="80" y="80" text-anchor="middle" dominant-baseline="central" font-family="'Noto Serif CJK SC','Songti SC',serif" font-size="66" fill="hsl(${accent} 60% 88%)" fill-opacity="0.92">${initial}</text>
</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const characterAvatar = (character: Pick<CharacterCard, 'name' | 'accent' | 'avatar'>) =>
  character.avatar || generatedAvatar(character.name, character.accent)

export const personaAvatar = (name: string, avatar?: string, accent = 200) =>
  avatar || generatedAvatar(name || '我', accent)
