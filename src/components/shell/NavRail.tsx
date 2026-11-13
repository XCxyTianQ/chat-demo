import clsx from 'clsx'
import { IconSettingsOutline16 } from '../base/icons.js'
import { IconButton } from '../base/IconButton.js'
import { IconCardsOutline20, IconQuillOutline20 } from '../base/rpIcons.js'
import { Tooltip } from '../base/Tooltip.js'
import { personaAvatar } from '../../services/characters/avatar.js'
import { useCharacters } from '../../services/characters/store.js'
import { newChat, selectSession, useChatStore } from '../../services/chat/store.js'
import { openSettings } from '../settings/settingsDialogState.js'
import { openPersona } from './uiState.js'
import { shellStrings } from './strings.js'
import styles from './NavRail.module.css'

/**
 * 桌面端 64px 竖栏：品牌记号、「角色库 / 对话」两个入口、底部人格与设置。
 * 入口高亮跟随当前状态：没有选中会话时在角色库（画廊），否则在对话。
 */
export const NavRail = () => {
  const activeId = useChatStore((state) => state.activeId)
  const persona = useCharacters((state) => state.persona)
  const atGallery = activeId === null

  const goCharacters = () => newChat()
  const goChats = () => {
    if (activeId !== null) {
      return
    }
    const latest = useChatStore.getState().sessions[0]
    if (latest) {
      selectSession(latest.id)
    }
  }

  return (
    <nav className={styles.rail} aria-label={shellStrings.navLabel}>
      <div className={styles.brand} aria-hidden="true">
        <span>夜</span>
      </div>
      <div className={styles.nav}>
        <Tooltip content={shellStrings.navCharacters} placement="bottom">
          <button
            type="button"
            className={clsx(styles.item, atGallery && styles.itemActive)}
            aria-label={shellStrings.navCharacters}
            aria-current={atGallery ? 'page' : undefined}
            onClick={goCharacters}
          >
            <IconCardsOutline20 />
          </button>
        </Tooltip>
        <Tooltip content={shellStrings.navChats} placement="bottom">
          <button
            type="button"
            className={clsx(styles.item, !atGallery && styles.itemActive)}
            aria-label={shellStrings.navChats}
            aria-current={!atGallery ? 'page' : undefined}
            onClick={goChats}
          >
            <IconQuillOutline20 />
          </button>
        </Tooltip>
      </div>
      <div className={styles.bottom}>
        <Tooltip content={shellStrings.navPersona} placement="bottom">
          <button
            type="button"
            className={styles.persona}
            aria-label={shellStrings.navPersona}
            onClick={openPersona}
          >
            <img src={personaAvatar(persona.name, persona.avatar)} alt="" draggable={false} />
          </button>
        </Tooltip>
        <IconButton
          size="m"
          icon={<IconSettingsOutline16 />}
          tooltip={shellStrings.navSettings}
          tooltipPlacement="bottom"
          onClick={() => openSettings('general')}
        />
      </div>
    </nav>
  )
}
