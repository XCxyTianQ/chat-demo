/** 「群星 · Astra」应用外壳的全部界面文案：简体中文集中在此，编号类英文是视觉装置。 */
export const shellStrings = {
  appName: '夜话',
  brandName: 'ASTRA',
  appEyebrow: 'ASTRA · OBSERVATORY',
  navLabel: '主导航',
  navCharacters: '星图',
  navChats: '记录',
  navPersona: '观测者',
  navSettings: '设置',
  charactersTitle: '星图',
  charactersLabel: 'CONSTELLATIONS',
  charactersEmpty: '星图上还没有星，先写一颗吧',
  newCharacter: '新建星',
  editCharacterLabel: (name: string) => `编辑${name}`,
  openCharacterLabel: (name: string) => `观测${name}`,
  recentTitle: '观测记录',
  recentLabel: 'LOGS',
  recentEmpty: '还没有观测记录，选一颗星开始',
  untitledChat: '未命名记录',
  sessionMenu: '记录菜单',
  renameSession: '重命名',
  deleteSession: '删除',
  deleteFailed: '删除记录失败',
  welcomeEyebrow: 'ASTRA OBSERVATORY · 选择一颗星',
  welcomeTitle: '今晚，想和谁说话？',
  openLabel: 'OPEN',
  openMenu: '打开星图与记录',
  newScene: '写新的一段',
  drawerLabel: '星图与观测记录',
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const startOfDay = (time: number) => new Date(time).setHours(0, 0, 0, 0)

/** 观测记录里的相对时间：刚刚 / n 分钟前 / n 小时前 / 昨天 / n 天前 / M 月 D 日 */
export const relativeTime = (time: number, now: number): string => {
  const diff = now - time
  if (diff < MINUTE) {
    return '刚刚'
  }
  if (diff < HOUR) {
    return `${Math.floor(diff / MINUTE)} 分钟前`
  }
  const days = Math.round((startOfDay(now) - startOfDay(time)) / DAY)
  if (days <= 0) {
    return `${Math.floor(diff / HOUR)} 小时前`
  }
  if (days === 1) {
    return '昨天'
  }
  if (days < 7) {
    return `${days} 天前`
  }
  const date = new Date(time)
  const sameYear = date.getFullYear() === new Date(now).getFullYear()
  return sameYear
    ? `${date.getMonth() + 1} 月 ${date.getDate()} 日`
    : `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`
}
