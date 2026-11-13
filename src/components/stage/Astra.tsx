import { useId, type CSSProperties } from 'react'
import type { CharacterCard } from '../../services/characters/types.js'
import styles from './Astra.module.css'

/**
 * 「群星」视觉引擎。
 * - StarField：三层视差星空 + 星云 + 流星，作为整页背景
 * - Constellation：按角色名字确定性生成的星座（星点 + 连线 + 星等），卡片与页头共用
 * - Astrolabe：缓慢转动的星盘刻度环，给会话页一层「观测仪器」的结构
 * 全部是 SVG + CSS 动画，无图片资源；同一角色永远得到同一片星空。
 */

const hash = (value: string): number => {
  let h = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const createRandom = (seed: number) => {
  let state = seed || 1
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

/** 恒星编号：由名字派生的固定「星表号」与赤经赤纬，纯装饰，但每个角色稳定不变 */
export const starDesignation = (name: string) => {
  const seed = hash(name)
  const raH = 1 + (seed % 23)
  const raM = seed % 60
  const decSign = seed % 2 === 0 ? '+' : '-'
  const decD = seed % 60
  const decM = (seed >> 5) % 60
  const catalog = ['HD', 'HIP', 'TYC', 'GJ'][seed % 4]
  return {
    catalog: `${catalog} ${10000 + (seed % 89999)}`,
    coordinate: `${raH}h${String(raM).padStart(2, '0')}m ${decSign}${decD}°${String(decM).padStart(2, '0')}′`,
  }
}

export const StarField = ({
  character,
  variant = 'stage',
}: {
  character?: Pick<CharacterCard, 'name' | 'accent'>
  variant?: 'stage' | 'card'
}) => {
  const id = useId().replace(/:/g, '')
  const seed = hash(character?.name ?? 'Astra')
  const hue = character?.accent ?? 210
  const layers = variant === 'card' ? [16, 10, 6] : [58, 34, 18]
  const random = createRandom(seed)
  const stars = layers.map((count, layer) =>
    Array.from({ length: count }, () => ({
      x: random() * 1200,
      y: random() * 860,
      r: [0.5, 0.9, 1.5][layer] * (0.6 + random() * 0.9),
      o: [0.28, 0.45, 0.75][layer] * (0.5 + random() * 0.6),
      delay: -random() * 8,
      duration: 4 + random() * 6,
    }))
  )
  const meteors = Array.from({ length: variant === 'card' ? 1 : 3 }, () => ({
    x: 120 + random() * 900,
    y: 40 + random() * 240,
    delay: random() * 16,
    duration: 5 + random() * 4,
  }))

  return (
    <div className={variant === 'card' ? styles.card : styles.stage} style={{ '--char-hue': String(hue) } as CSSProperties} aria-hidden="true">
      <svg className={styles.svg} viewBox="0 0 1200 860" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id={`nebula-a-${id}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor={`hsl(${hue} 72% 58%)`} stopOpacity="0.5" />
            <stop offset="55%" stopColor={`hsl(${hue} 68% 42%)`} stopOpacity="0.14" />
            <stop offset="100%" stopColor={`hsl(${hue} 60% 30%)`} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`nebula-b-${id}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor={`hsl(${(hue + 58) % 360} 66% 62%)`} stopOpacity="0.32" />
            <stop offset="100%" stopColor={`hsl(${(hue + 58) % 360} 66% 52%)`} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`margin-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`hsl(${(hue + 200) % 360} 40% 40%)`} stopOpacity="0.16" />
            <stop offset="100%" stopColor={`hsl(${(hue + 200) % 360} 40% 30%)`} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="1200" height="860" fill="#05060c" />
        <g className={styles.nebula}>
          <ellipse cx={720} cy={250} rx="520" ry="330" fill={`url(#nebula-a-${id})`} />
          <ellipse cx={330} cy={620} rx="430" ry="290" fill={`url(#nebula-b-${id})`} />
        </g>
        <rect y="520" width="1200" height="340" fill={`url(#margin-${id})`} />
        {stars.map((layer, index) => (
          <g key={index} className={styles['layer' as 'layer']}>
            {layer.map((star, i) => (
              <circle
                key={i}
                cx={star.x}
                cy={star.y}
                r={star.r}
                fill="#f6f3ec"
                opacity={star.o}
                style={{ animationDelay: `${star.delay}s`, animationDuration: `${star.duration}s` }}
              />
            ))}
          </g>
        ))}
        {meteors.map((meteor, index) => (
          <g key={index} className={styles.meteor} style={{ animationDelay: `${meteor.delay}s`, animationDuration: `${meteor.duration}s` }}>
            <line x1={meteor.x} y1={meteor.y} x2={meteor.x - 96} y2={meteor.y + 54} stroke="url(#meteor-line)" strokeWidth="1.4" />
            <line x1={meteor.x} y1={meteor.y} x2={meteor.x - 160} y2={meteor.y + 90} stroke="#f6f3ec" strokeWidth="1" strokeOpacity="0.5" />
          </g>
        ))}
      </svg>
      <div className={styles.scrim} />
    </div>
  )
}

export const Constellation = ({
  name,
  accent,
  size = 120,
  showStars = true,
  className,
}: {
  name: string
  accent: number
  size?: number
  showStars?: boolean
  className?: string
}) => {
  const seed = hash(name)
  const random = createRandom(seed)
  const count = 5 + (seed % 3)
  const nodes = Array.from({ length: count }, () => ({
    x: 12 + random() * 76,
    y: 12 + random() * 76,
    r: 1.1 + random() * 1.4,
  })).sort((a, b) => a.x - b.x)
  const edges: [number, number][] = []
  for (let i = 0; i < nodes.length - 1; i += 1) {
    edges.push([i, i + 1])
    if (i + 2 < nodes.length && random() > 0.55) {
      edges.push([i, i + 2])
    }
  }
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      style={{ '--char-hue': String(accent) } as CSSProperties}
    >
      {edges.map(([a, b], index) => (
        <line
          key={index}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke={`hsl(${accent} 70% 78%)`}
          strokeOpacity="0.5"
          strokeWidth="0.6"
          strokeDasharray={index % 3 === 0 ? '0' : '2 2'}
        />
      ))}
      {showStars
        ? nodes.map((node, index) => (
            <g key={index}>
              <circle cx={node.x} cy={node.y} r={node.r * 3.2} fill={`hsl(${accent} 80% 70%)`} opacity="0.12" />
              <circle
                cx={node.x}
                cy={node.y}
                r={node.r}
                fill="#fbf8f1"
                className={styles.node}
                style={{ animationDelay: `${index * 0.7}s` }}
              />
            </g>
          ))
        : null}
    </svg>
  )
}

/** 星盘刻度环：两层反向转动的细环，给会话页一层「仪器」的结构感 */
export const Astrolabe = ({ size = 760 }: { size?: number }) => (
  <svg className={styles.astrolabe} width={size} height={size} viewBox="0 0 400 400" fill="none" aria-hidden="true">
    <g className={styles.ringSlow}>
      <circle cx="200" cy="200" r="188" stroke="currentColor" strokeOpacity="0.16" strokeWidth="0.6" strokeDasharray="1 5" />
      <circle cx="200" cy="200" r="168" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.6" />
      {Array.from({ length: 72 }, (_, i) => (
        <line
          key={i}
          x1="200"
          y1="12"
          x2="200"
          y2={i % 6 === 0 ? 26 : 20}
          stroke="currentColor"
          strokeOpacity={i % 6 === 0 ? 0.28 : 0.14}
          strokeWidth="0.6"
          transform={`rotate(${i * 5} 200 200)`}
        />
      ))}
    </g>
    <g className={styles.ringFast}>
      <circle cx="200" cy="200" r="146" stroke="currentColor" strokeOpacity="0.12" strokeWidth="0.6" strokeDasharray="14 10" />
      <circle cx="200" cy="200" r="120" stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.6" />
    </g>
    <circle cx="200" cy="200" r="96" stroke="currentColor" strokeOpacity="0.06" strokeWidth="0.6" />
  </svg>
)
