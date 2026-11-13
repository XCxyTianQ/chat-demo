import clsx from 'clsx'
import { memo, useEffect, useState } from 'react'
import { IconEditOutline16, IconEllipsisOutline16, IconTrashOutline16 } from '../base/icons.js'
import { IconButton } from '../base/IconButton.js'
import { Menu } from '../base/Menu.js'
import { showToast } from '../base/toastState.js'
import { Constellation, starDesignation } from '../stage/Astra.js'
import { useCharacters } from '../../services/characters/store.js'
import {
  removeSession,
  renameSession,
  selectSession,
  useChatStore,
} from '../../services/chat/store.js'
import type { SessionSummary } from '../../services/chat/types.js'
import { closeSider } from './uiState.js'
import { relativeTime, shellStrings } from './strings.js'
import styles from './RecentChats.module.css'

/** 每分钟刷新一次「n 分钟前」，回到前台时立刻校准 */
const useNow = (interval: number) => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const tick = () => setNow(Date.now())
    const timer = window.setInterval(tick, interval)
    window.addEventListener('focus', tick)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', tick)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [interval])
  return now
}

const catalogTail = (catalog: string) => catalog.replace(/\D/g, '')

const SessionRow = memo(function SessionRow({
  session,
  active,
  now,
}: {
  session: SessionSummary
  active: boolean
  now: number
}) {
  // 记录列表已经带 characterId；没有绑定角色的普通对话用一枚中性星点
  const character = useCharacters((state) =>
    session.characterId
      ? state.characters.find((item) => item.id === session.characterId)
      : undefined
  )
  const [editing, setEditing] = useState(false)
  const displayTitle = session.title || shellStrings.untitledChat
  const catalog = character ? starDesignation(character.name).catalog : null

  if (editing) {
    const finish = (title: string) => {
      setEditing(false)
      if (title.trim() && title.trim() !== displayTitle) {
        renameSession(session.id, title.trim())
      }
    }
    return (
      <input
        className={styles.renameInput}
        defaultValue={displayTitle}
        aria-label={shellStrings.renameSession}
        autoFocus
        onFocus={(event) => event.target.select()}
        onBlur={(event) => finish(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
            finish(event.currentTarget.value)
          } else if (event.key === 'Escape') {
            setEditing(false)
          }
        }}
      />
    )
  }

  return (
    <div className={clsx(styles.row, active && styles.rowActive)}>
      <button
        type="button"
        className={styles.rowMain}
        onClick={() => {
          selectSession(session.id)
          closeSider()
        }}
      >
        <span className={styles.dot} aria-hidden="true">
          {character ? (
            <Constellation name={character.name} accent={character.accent} size={24} />
          ) : (
            <span className={styles.dotEmpty}>✦</span>
          )}
        </span>
        <span className={styles.title}>{displayTitle}</span>
        <span className={styles.meta}>
          <span className={styles.time}>{relativeTime(session.updatedAt, now)}</span>
          {catalog ? <span className={styles.catalog}>{catalogTail(catalog)}</span> : null}
        </span>
      </button>
      <div className={styles.more}>
        <Menu
          options={[
            {
              key: 'rename',
              label: shellStrings.renameSession,
              icon: <IconEditOutline16 />,
              onSelect: () => setEditing(true),
            },
            {
              key: 'delete',
              label: shellStrings.deleteSession,
              icon: <IconTrashOutline16 />,
              danger: true,
              onSelect: () => {
                void removeSession(session.id).then((deleted) => {
                  if (!deleted) {
                    showToast(shellStrings.deleteFailed)
                  }
                })
              },
            },
          ]}
        >
          {({ toggle }) => (
            <IconButton
              icon={<IconEllipsisOutline16 />}
              aria-label={shellStrings.sessionMenu}
              onClick={toggle}
            />
          )}
        </Menu>
      </div>
    </div>
  )
})

/** 侧栏下半 · 观测记录：按最近更新排列的会话 */
export const RecentChats = () => {
  const sessions = useChatStore((state) => state.sessions)
  const activeId = useChatStore((state) => state.activeId)
  const now = useNow(60_000)

  return (
    <section className={styles.section} aria-labelledby="astra-recent-title">
      <div className={styles.header}>
        <div className={styles.heading}>
          <h2 id="astra-recent-title" className={styles.sectionTitle}>
            {shellStrings.recentTitle}
          </h2>
          <span className={styles.label}>{shellStrings.recentLabel}</span>
        </div>
        <span className={styles.spacer} />
        {sessions.length > 0 ? <span className={styles.count}>{sessions.length}</span> : null}
      </div>
      <div className={styles.list}>
        {sessions.map((session) => (
          <SessionRow
            key={session.id}
            session={session}
            active={session.id === activeId}
            now={now}
          />
        ))}
        {sessions.length === 0 ? <p className={styles.empty}>{shellStrings.recentEmpty}</p> : null}
      </div>
    </section>
  )
}
