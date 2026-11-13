import clsx from 'clsx'
import { IconSettingsOutline16 } from '../base/icons.js'
import { IconButton } from '../base/IconButton.js'
import { Constellation } from '../stage/Astra.js'
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
 * 桌面端 72px 竖栏：星座记号 + 竖排 ASTRA，两个竖排入口（星图 / 记录），底部观测者与设置。
 * 高亮跟随当前状态：没有选中记录时在星图（画廊），否则在记录。
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
        <span className={styles.mark}>
          <Constellation name="Astra" accent={44} size={26} />
        </span>
        <span className={styles.brandName}>{shellStrings.brandName}</span>
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
            <span className={styles.icon} aria-hidden="true">
              <IconCardsOutline20 />
            </span>
            <span className={styles.vertical}>{shellStrings.navCharacters}</span>
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
            <span className={styles.icon} aria-hidden="true">
              <IconQuillOutline20 />
            </span>
            <span className={styles.vertical}>{shellStrings.navChats}</span>
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
