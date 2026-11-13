import clsx from 'clsx'
import { CharacterStrip } from './CharacterStrip.js'
import { RecentChats } from './RecentChats.js'
import styles from './Sidebar.module.css'

/** 桌面端 296px 侧栏：上半角色、下半最近对话；移动端以 full 形态放进抽屉 */
export const Sidebar = ({ full = false }: { full?: boolean }) => (
  <aside className={clsx(styles.sidebar, full && styles.full)}>
    <CharacterStrip />
    <RecentChats />
  </aside>
)
