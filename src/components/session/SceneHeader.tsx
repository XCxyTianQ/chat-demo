import { characterAvatar } from '../../services/characters/avatar.js'
import type { CharacterCard } from '../../services/characters/types.js'
import { startCharacterChat } from '../../services/chat/store.js'
import { IconBookmarkOutline16, IconSparkOutline16 } from '../base/rpIcons.js'
import { openCharacterEditor } from '../shell/uiState.js'
import { sceneStrings } from './strings.js'
import styles from './SceneHeader.module.css'

/**
 * 场景头：角色的印章头像、名字与一句话人设，右侧两个幽灵按钮。
 * 没有绑定角色的会话退化成单行标题。
 * 移动端由应用外壳的顶栏承担这一角色（本组件在 <768px 不渲染）。
 */
export const SceneHeader = ({
  character,
  title,
}: {
  character?: CharacterCard
  title: string
}) => {
  if (!character) {
    return (
      <header className={styles.header}>
        <div className={styles.plainRow}>
          <h1 className={styles.plainTitle}>{title}</h1>
        </div>
      </header>
    )
  }
  // 有 tagline 用 tagline，否则退回场景设定；两者都为空时不占位
  const subtitle = character.tagline.trim() || character.scenario.trim()
  return (
    <header className={styles.header}>
      <div className={styles.glow} aria-hidden />
      <div className={styles.row}>
        <img className={styles.avatar} src={characterAvatar(character)} alt="" aria-hidden />
        <div className={styles.identity}>
          <h1 className={styles.name}>{character.name}</h1>
          {subtitle ? (
            <div className={styles.sub} tabIndex={0}>
              <span className={styles.subText}>{subtitle}</span>
              <span className={styles.subFull}>{subtitle}</span>
            </div>
          ) : null}
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.ghost}
            onClick={() => openCharacterEditor(character.id)}
          >
            <IconBookmarkOutline16 />
            <span>{sceneStrings.characterSheet}</span>
          </button>
          <button
            type="button"
            className={styles.ghost}
            onClick={() => startCharacterChat(character.id)}
          >
            <IconSparkOutline16 />
            <span>{sceneStrings.newScene}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
