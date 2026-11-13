import clsx from 'clsx'
import { CharacterStrip } from './CharacterStrip.js'
import { RecentChats } from './RecentChats.js'
import styles from './Sidebar.module.css'

/** 桌面端 300px 侧栏：上半星图、下半观测记录；移动端以 full 形态放进抽屉 */
export const Sidebar = ({ full = false }: { full?: boolean }) => (
  <aside className={clsx(styles.sidebar, 'rp-grain', full && styles.full)}>
    <CharacterStrip />
    <RecentChats />
  </aside>
)
