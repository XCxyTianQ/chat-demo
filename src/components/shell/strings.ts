/** 「余烬与墨」应用外壳的全部界面文案：简体中文集中在此，方便统一修改。 */
export const shellStrings = {
  appName: '夜话',
  navLabel: '主导航',
  navCharacters: '角色库',
  navChats: '对话',
  navPersona: '人格',
  navSettings: '设置',
  charactersTitle: '角色',
  charactersEmpty: '还没有角色，先写一个吧',
  newCharacter: '新建角色',
  editCharacterLabel: (name: string) => `编辑${name}`,
  openCharacterLabel: (name: string) => `和${name}说说话`,
  recentTitle: '最近对话',
  recentEmpty: '还没有对话，选一个角色开始吧',
  untitledChat: '未命名对话',
  sessionMenu: '会话菜单',
  renameSession: '重命名',
  deleteSession: '删除',
  deleteFailed: '删除会话失败',
  welcomeTitle: '今晚，想和谁说话？',
  welcomeSubtitle: '选一个人，把今夜交给故事。',
  newCharacterHint: '写下一个人',
  openMenu: '打开角色与对话',
  newScene: '写新的一段',
  drawerLabel: '角色与对话',
  backToGallery: '回到角色画廊',
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const startOfDay = (time: number) => new Date(time).setHours(0, 0, 0, 0)

/** 会话列表里的相对时间：刚刚 / n 分钟前 / n 小时前 / 昨天 / n 天前 / M 月 D 日 */
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
