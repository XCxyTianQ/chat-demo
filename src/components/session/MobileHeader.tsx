import { IconMenuOutline20, IconNewChatOutline20 } from '../base/icons.js'
import { IconButton } from '../base/IconButton.js'
import { useCharacters } from '../../services/characters/store.js'
import { newChat, startCharacterChat } from '../../services/chat/store.js'
import { closeSider, openSider } from '../shell/uiState.js'
import { shellStrings } from '../shell/strings.js'
import styles from './MobileHeader.module.css'

/** 移动端 48px 顶栏：左菜单开抽屉，中间当前角色名（没有则「夜话」），右侧写新的一段 */
export const MobileHeader = ({ title }: { title?: string }) => {
  const activeCharacterId = useCharacters((state) => state.activeCharacterId)

  const startNew = () => {
    if (activeCharacterId) {
      startCharacterChat(activeCharacterId)
    } else {
      newChat()
    }
    closeSider()
  }

  return (
    <header className={styles.header}>
      <IconButton
        size="m"
        icon={<IconMenuOutline20 />}
        aria-label={shellStrings.openMenu}
        onClick={openSider}
      />
      <div className={styles.title}>{title || shellStrings.appName}</div>
      <button
        type="button"
        className={styles.newScene}
        aria-label={shellStrings.newScene}
        onClick={startNew}
      >
        <IconNewChatOutline20 />
        <span className={styles.newSceneLabel}>{shellStrings.newScene}</span>
      </button>
    </header>
  )
}
