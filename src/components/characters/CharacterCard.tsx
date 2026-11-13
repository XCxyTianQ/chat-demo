import clsx from 'clsx'
import type { CSSProperties } from 'react'
import { characterAvatar } from '../../services/characters/avatar.js'
import type { CharacterCard as CharacterCardModel } from '../../services/characters/types.js'
import { IconEditOutline16 } from '../base/icons.js'
import { shellStrings } from '../shell/strings.js'
import styles from './CharacterCard.module.css'

export type CharacterCardVariant = 'row' | 'card'

/**
 * 角色卡：侧栏里的紧凑行（variant="row"）与画廊里的大卡片（variant="card"）共用。
 * 主区域是一个按钮，编辑按钮是它的兄弟节点，避免按钮嵌套；Enter / Space 原生触发。
 * 卡片上的 --char-hue 由角色 accent 驱动，卡片内部重新声明派生色，与全局强调色保持一致。
 */
export const CharacterCard = ({
  character,
  variant = 'card',
  active = false,
  onOpen,
  onEdit,
}: {
  character: CharacterCardModel
  variant?: CharacterCardVariant
  /** 侧栏当前角色：左侧余烬竖条 + 背景微亮 */
  active?: boolean
  onOpen: () => void
  onEdit?: () => void
}) => {
  const style = { '--char-hue': String(character.accent) } as CSSProperties
  const avatar = characterAvatar(character)
  const editButton = onEdit ? (
    <button
      type="button"
      className={styles.edit}
      aria-label={shellStrings.editCharacterLabel(character.name)}
      onClick={(event) => {
        event.stopPropagation()
        onEdit()
      }}
    >
      <IconEditOutline16 />
    </button>
  ) : null

  if (variant === 'row') {
    return (
      <div className={clsx(styles.row, active && styles.rowActive)} style={style}>
        <button
          type="button"
          className={styles.rowMain}
          aria-label={shellStrings.openCharacterLabel(character.name)}
          onClick={onOpen}
        >
          <img className={styles.rowAvatar} src={avatar} alt="" draggable={false} />
          <span className={styles.rowText}>
            <span className={styles.rowName}>{character.name}</span>
            {character.tagline ? (
              <span className={styles.rowTagline}>{character.tagline}</span>
            ) : null}
          </span>
        </button>
        {editButton}
      </div>
    )
  }

  return (
    <div className={clsx(styles.card, 'rp-grain', active && styles.cardActive)} style={style}>
      <button
        type="button"
        className={styles.cardMain}
        aria-label={shellStrings.openCharacterLabel(character.name)}
        onClick={onOpen}
      >
        <img className={styles.cardAvatar} src={avatar} alt="" draggable={false} />
        <span className={styles.cardName}>{character.name}</span>
        {character.tagline ? <span className={styles.cardTagline}>{character.tagline}</span> : null}
        {character.tags.length > 0 ? (
          <span className={styles.cardTags}>
            {character.tags.slice(0, 4).map((tag) => (
              <span key={tag} className={styles.cardTag}>
                {tag}
              </span>
            ))}
          </span>
        ) : null}
      </button>
      {editButton}
    </div>
  )
}
