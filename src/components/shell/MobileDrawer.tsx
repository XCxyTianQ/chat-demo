import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { IconSettingsOutline16 } from '../base/icons.js'
import { IconButton } from '../base/IconButton.js'
import { IconMasksOutline20 } from '../base/rpIcons.js'
import { personaAvatar } from '../../services/characters/avatar.js'
import { useCharacters } from '../../services/characters/store.js'
import { openSettings } from '../settings/settingsDialogState.js'
import { Sidebar } from './Sidebar.js'
import { closeSider, openPersona, useRpUi } from './uiState.js'
import { shellStrings } from './strings.js'
import styles from './MobileDrawer.module.css'

/** 移动端：竖栏与侧栏合并成的左侧抽屉，滑入 240ms，点遮罩或 Esc 关闭 */
export const MobileDrawer = () => {
  const open = useRpUi((state) => state.siderOpen)
  const persona = useCharacters((state) => state.persona)
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(open)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const frame = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(frame)
    }
    setVisible(false)
    const timer = window.setTimeout(() => setMounted(false), 240)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSider()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  if (!mounted) {
    return null
  }

  return (
    <div className={clsx(styles.root, visible && styles.show)}>
      <div className={styles.mask} onClick={closeSider} aria-hidden="true" />
      <div
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={shellStrings.drawerLabel}
      >
        <div className={styles.head}>
          <span className={styles.logo} aria-hidden="true">
            <IconMasksOutline20 />
          </span>
          <span className={styles.brand}>{shellStrings.appName}</span>
          <button
            type="button"
            className={styles.persona}
            aria-label={shellStrings.navPersona}
            onClick={() => {
              closeSider()
              openPersona()
            }}
          >
            <img src={personaAvatar(persona.name, persona.avatar)} alt="" draggable={false} />
          </button>
          <IconButton
            icon={<IconSettingsOutline16 />}
            aria-label={shellStrings.navSettings}
            onClick={() => {
              closeSider()
              openSettings('general')
            }}
          />
        </div>
        <Sidebar full />
      </div>
    </div>
  )
}
