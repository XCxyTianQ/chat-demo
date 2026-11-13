import { useState } from 'react'
import { IconButton } from '../base/IconButton.js'
import { IconChevronRightOutline14 } from '../base/icons.js'
import { IconBookmarkOutline16, IconSparkOutline16 } from '../base/rpIcons.js'
import { Constellation, starDesignation } from '../stage/Astra.js'
import { characterAvatar } from '../../services/characters/avatar.js'
import { getVisibleMessages } from '../../services/chat/branches.js'
import { startCharacterChat } from '../../services/chat/store.js'
import type { Session } from '../../services/chat/types.js'
import type { CharacterCard } from '../../services/characters/types.js'
import { openCharacterEditor } from './uiState.js'
import styles from './ScriptPanel.module.css'

const formatTime = (value: number) => {
  const date = new Date(value)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/** 右栏「剧本」：角色的星图档案 + 本次观测记录的目录。桌面宽屏可见，可折叠。 */
export const ScriptPanel = ({
  session,
  character,
}: {
  session: Session
  character?: CharacterCard
}) => {
  const [collapsed, setCollapsed] = useState(false)
  const messages = getVisibleMessages(session)
  const beats = messages
    .filter((message) => message.role === 'user')
    .map((message, index) => ({ id: message.id, index: index + 1, time: formatTime(message.createdAt) }))
  const designation = character ? starDesignation(character.name) : null

  if (collapsed) {
    return (
      <button
        type="button"
        className={styles.collapsed}
        aria-label="展开剧本面板"
        onClick={() => setCollapsed(false)}
      >
        <span className={styles.collapsedText}>剧本</span>
      </button>
    )
  }

  return (
    <aside className={styles.panel} aria-label="剧本面板">
      <header className={styles.header}>
        <span className={styles.eyebrow}>STELLAR FILE</span>
        <IconButton
          size="s"
          icon={<IconChevronRightOutline14 />}
          aria-label="收起剧本面板"
          onClick={() => setCollapsed(true)}
        />
      </header>

      {character ? (
        <>
          <div className={styles.identity}>
            <div className={styles.orbit}>
              <Constellation name={character.name} accent={character.accent} size={132} />
              <img className={styles.portrait} src={characterAvatar(character)} alt="" draggable={false} />
            </div>
            <div className={styles.name}>{character.name}</div>
            {designation ? (
              <div className={styles.designation}>
                <span>{designation.catalog}</span>
                <span className={styles.sep}>·</span>
                <span>{designation.coordinate}</span>
              </div>
            ) : null}
            <div className={styles.tagline}>{character.tagline}</div>
            <div className={styles.tags}>
              {character.tags.map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>

          {character.scenario ? (
            <section className={styles.section}>
              <div className={styles.sectionTitle}>
                <span className={styles.rule} />
                <span>场景</span>
                <span className={styles.rule} />
              </div>
              <p className={styles.scenario}>{character.scenario}</p>
            </section>
          ) : null}
        </>
      ) : (
        <div className={styles.identity}>
          <div className={styles.name}>{session.title || '未命名'}</div>
          <div className={styles.tagline}>普通对话</div>
        </div>
      )}

      <section className={styles.section}>
        <div className={styles.sectionTitle}>
          <span className={styles.rule} />
          <span>观测记录</span>
          <span className={styles.rule} />
        </div>
        <ol className={styles.beats}>
          {beats.length === 0 ? (
            <li className={styles.empty}>还没有对话，先说第一句。</li>
          ) : (
            beats.map((beat) => (
              <li key={beat.id} className={styles.beat}>
                <span className={styles.beatDot} />
                <span className={styles.beatIndex}>{String(beat.index).padStart(2, '0')}</span>
                <span className={styles.beatTime}>{beat.time}</span>
              </li>
            ))
          )}
        </ol>
      </section>

      <footer className={styles.actions}>
        <button
          type="button"
          className={styles.action}
          onClick={() => character && openCharacterEditor(character.id)}
          disabled={!character}
        >
          <IconBookmarkOutline16 />
          档案
        </button>
        <button
          type="button"
          className={styles.action}
          onClick={() => character && startCharacterChat(character.id)}
          disabled={!character}
        >
          <IconSparkOutline16 />
          新的一段
        </button>
      </footer>
    </aside>
  )
}
