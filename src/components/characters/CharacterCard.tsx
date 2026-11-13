import clsx from 'clsx'
import type { CSSProperties } from 'react'
import type { CharacterCard as CharacterCardModel } from '../../services/characters/types.js'
import { Constellation, StarField, starDesignation } from '../stage/Astra.js'
import { IconEditOutline16 } from '../base/icons.js'
import { shellStrings } from '../shell/strings.js'
import styles from './CharacterCard.module.css'

export type CharacterCardVariant = 'row' | 'card'

/** 星表号的数字尾巴：HD 48213 → 48213 */
const catalogTail = (catalog: string) => catalog.replace(/\D/g, '')

/**
 * 星图卡与星图行共用。
 * - row：侧栏里的星图行（40px 星座缩略 + 名字 + 一句话 + 星表号尾号）
 * - card：画廊里的星图卡（上半星野 + 大星座，下半玻璃铭牌）
 * 主体是原生 <button>，编辑按钮是兄弟节点，避免按钮嵌套；Enter / Space 原生触发。
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
  /** 侧栏当前角色：左 2px 光条 + 极淡玻璃高亮 */
  active?: boolean
  onOpen: () => void
  onEdit?: () => void
}) => {
  const style = { '--char-hue': String(character.accent) } as CSSProperties
  const designation = starDesignation(character.name)
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
          <span className={styles.rowThumb} aria-hidden="true">
            {character.avatar ? (
              <img className={styles.rowAvatar} src={character.avatar} alt="" draggable={false} />
            ) : (
              <Constellation name={character.name} accent={character.accent} size={40} />
            )}
          </span>
          <span className={styles.rowText}>
            <span className={styles.rowName}>{character.name}</span>
            {character.tagline ? (
              <span className={styles.rowTagline}>{character.tagline}</span>
            ) : null}
          </span>
          <span className={styles.rowCatalog}>{catalogTail(designation.catalog)}</span>
        </button>
        {editButton}
      </div>
    )
  }

  return (
    <div className={clsx(styles.card, active && styles.cardActive)} style={style}>
      {/* 观测窗：星野 + 大星座 + 星表号，纯装饰；整卡由一个透明的按钮接管点击与聚焦 */}
      <div className={styles.sky} aria-hidden="true">
        <div className={styles.skyField}>
          <StarField character={character} variant="card" />
        </div>
        {character.avatar ? (
          <img className={styles.portrait} src={character.avatar} alt="" draggable={false} />
        ) : (
          <div className={styles.constellation}>
            <Constellation name={character.name} accent={character.accent} size={120} />
          </div>
        )}
        <span className={styles.cardCatalog}>{designation.catalog}</span>
        <span className={styles.cardOpen}>{shellStrings.openLabel}</span>
      </div>
      <div className={styles.plate} aria-hidden="true">
        <span className={styles.cardName}>{character.name}</span>
        {character.tagline ? <span className={styles.cardTagline}>{character.tagline}</span> : null}
        {character.tags.length > 0 ? (
          <span className={styles.cardTags}>
            {character.tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.cardTag}>
                {tag}
              </span>
            ))}
          </span>
        ) : null}
      </div>
      <button
        type="button"
        className={styles.cardMain}
        aria-label={shellStrings.openCharacterLabel(character.name)}
        onClick={onOpen}
      />
      {editButton}
    </div>
  )
}
