import { Fragment } from 'react'
import type { CharacterCard } from '../../services/characters/types.js'
import { startCharacterChat } from '../../services/chat/store.js'
import { IconBookmarkOutline16, IconSparkOutline16 } from '../base/rpIcons.js'
import { Constellation, starDesignation } from '../stage/Astra.js'
import { openCharacterEditor } from '../shell/uiState.js'
import { sceneStrings } from './strings.js'
import styles from './SceneHeader.module.css'

/**
 * 观测页头：竖排 ASTRA、记录号、巨大角色名、星表坐标与标签，
 * 名字右后方一枚低透明星座，右侧两枚仪表按钮，底部一条发丝线与中央星点。
 * 没有绑定角色时退化成「记录号 + 会话标题」。
 * 移动端由应用外壳的顶栏承担（本组件在 <768px 不渲染）。
 */
export const SceneHeader = ({
  character,
  title,
  recordNumber,
}: {
  character?: CharacterCard
  title: string
  /** 会话的消息轮次，用于「记录 03」 */
  recordNumber: number
}) => {
  const designation = character ? starDesignation(character.name) : null
  const tags = character?.tags.slice(0, 3) ?? []
  const record = String(recordNumber).padStart(2, '0')
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <span className={styles.brand} aria-hidden>
          {sceneStrings.brand}
        </span>
        <div className={styles.playbill}>
          <div className={styles.logLine}>
            <span>{sceneStrings.observationLog}</span>
            <span className={styles.dot} aria-hidden />
            <span>
              {sceneStrings.record} {record}
            </span>
          </div>
          <div className={styles.nameWrap}>
            <h1 className={styles.name}>{character?.name ?? title}</h1>
          </div>
          {character ? (
            <Constellation
              className={styles.constellation}
              name={character.name}
              accent={character.accent}
              size={160}
            />
          ) : null}
          {designation ? (
            <div className={styles.tags}>
              <span>{designation.catalog}</span>
              <span className={styles.separator}>{sceneStrings.separator}</span>
              <span>{designation.coordinate}</span>
              {tags.map((tag) => (
                <Fragment key={tag}>
                  <span className={styles.separator}>{sceneStrings.separator}</span>
                  <span>{tag}</span>
                </Fragment>
              ))}
            </div>
          ) : null}
        </div>
        {character ? (
          <div className={styles.instruments}>
            <button
              type="button"
              className={styles.gauge}
              onClick={() => openCharacterEditor(character.id)}
            >
              <IconBookmarkOutline16 />
              <span>{sceneStrings.characterSheet}</span>
            </button>
            <button
              type="button"
              className={styles.gauge}
              onClick={() => startCharacterChat(character.id)}
            >
              <IconSparkOutline16 />
              <span>{sceneStrings.newScene}</span>
            </button>
          </div>
        ) : null}
      </div>
      <div className={styles.hairline} aria-hidden>
        <span className={styles.hairlineStar} />
      </div>
    </header>
  )
}
