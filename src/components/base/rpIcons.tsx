/** 角色扮演层补充的线性图标：统一 1.4 描边、currentColor，风格比上游图标更柔和。 */
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const IconMasksOutline20 = () => (
  <svg width={20} height={20} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" {...base}>
    <path d="M3.2 5.4c1.9-.9 4.1-.9 6 0v4.9c0 2.5-1.3 4-3 4s-3-1.5-3-4V5.4Z" />
    <path d="M10.8 6.6c1.7-.7 3.6-.7 5.2 0v3.9c0 2.1-1.1 3.4-2.6 3.4-1.5 0-2.6-1.3-2.6-3.4V6.6Z" />
    <path d="M5.3 8.1h1.6M12.7 8.9h1.5" />
  </svg>
)

export const IconCardsOutline20 = () => (
  <svg width={20} height={20} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" {...base}>
    <rect x="3.2" y="6.2" width="10.4" height="10.6" rx="2.2" />
    <path d="M6.6 4.1h7.2a3 3 0 0 1 3 3v7.2" />
    <path d="M6.2 9.6h4.4M6.2 12.6h3" />
  </svg>
)

export const IconQuillOutline20 = () => (
  <svg width={20} height={20} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" {...base}>
    <path d="M16.4 3.6c-3 .3-5.6 1.5-7.5 3.4-1.6 1.6-2.4 3.6-2.6 6 2.4-.2 4.4-1 6-2.6 1.9-1.9 3.1-4.5 3.4-7.5Z" />
    <path d="M3.6 16.4c1.3-3.2 3.2-5.6 5.6-7.4" />
  </svg>
)

export const IconPersonaOutline20 = () => (
  <svg width={20} height={20} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" {...base}>
    <circle cx="10" cy="6.8" r="2.9" />
    <path d="M4.4 16.2c.6-2.9 2.8-4.6 5.6-4.6s5 1.7 5.6 4.6" />
  </svg>
)

export const IconPlusOutline16 = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...base}>
    <path d="M8 3.2v9.6M3.2 8h9.6" />
  </svg>
)

export const IconSparkOutline16 = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...base}>
    <path d="M8 2.2c.6 2.9 1.7 4 4.6 4.6-2.9.6-4 1.7-4.6 4.6-.6-2.9-1.7-4-4.6-4.6 2.9-.6 4-1.7 4.6-4.6Z" />
    <path d="M12.4 11.2c.2 1 .6 1.4 1.6 1.6-1 .2-1.4.6-1.6 1.6-.2-1-.6-1.4-1.6-1.6 1-.2 1.4-.6 1.6-1.6Z" />
  </svg>
)

export const IconSceneOutline16 = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...base}>
    <path d="M2.6 13.4V6.6a5.4 5.4 0 0 1 10.8 0v6.8" />
    <path d="M2.6 13.4h10.8" />
    <path d="M6.1 13.4V7.5M9.9 13.4V7.5" />
  </svg>
)

export const IconBookmarkOutline16 = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...base}>
    <path d="M4.4 2.8h7.2v10.4L8 10.4l-3.6 2.8V2.8Z" />
  </svg>
)
