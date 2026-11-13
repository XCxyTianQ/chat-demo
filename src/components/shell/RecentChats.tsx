import clsx from 'clsx'
import { memo, useEffect, useState } from 'react'
import { IconEditOutline16, IconEllipsisOutline16, IconTrashOutline16 } from '../base/icons.js'
import { IconQuillOutline20 } from '../base/rpIcons.js'
import { IconButton } from '../base/IconButton.js'
import { Menu } from '../base/Menu.js'
import { showToast } from '../base/toastState.js'
import { characterAvatar } from '../../services/characters/avatar.js'
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

/**
 * 会话列表只带元数据（SessionSummary 没有 characterId），角色头像只能从已加载的会话里取。
 * 这里记住打开过的会话属于谁，避免缓存淘汰（只保留最近 5 个）后头像闪回占位记号。
 */
const sessionCharacters = new Map<string, string>()

/** startCharacterChat 默认用角色名做标题，重名时追加「 · 2」这样的序号 */
const baseTitle = (title: string) => title.replace(/ · \d+$/, '')

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

const SessionRow = memo(function SessionRow({
  session,
  active,
  now,
}: {
  session: SessionSummary
  active: boolean
  now: number
}) {
  const cachedCharacterId =
    useChatStore((state) => state.sessionCache[session.id]?.characterId ?? null) ??
    session.characterId ??
    null
  useEffect(() => {
    if (cachedCharacterId) {
      sessionCharacters.set(session.id, cachedCharacterId)
    }
  }, [session.id, cachedCharacterId])
  // 还没打开过的会话按标题猜（默认标题就是角色名），猜不到就用中性「羽毛」记号
  const guessedName = cachedCharacterId ? '' : baseTitle(session.title)
  const character = useCharacters((state) =>
    cachedCharacterId
      ? state.characters.find((item) => item.id === cachedCharacterId)
      : state.characters.find(
          (item) => item.id === sessionCharacters.get(session.id) || item.name === guessedName
        )
  )
  const [editing, setEditing] = useState(false)
  const displayTitle = session.title || shellStrings.untitledChat

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
        {character ? (
          <img
            className={styles.avatar}
            src={characterAvatar(character)}
            alt=""
            draggable={false}
          />
        ) : (
          <span className={styles.avatarFallback} aria-hidden="true">
            <IconQuillOutline20 />
          </span>
        )}
        <span className={styles.title}>{displayTitle}</span>
        <span className={styles.time}>{relativeTime(session.updatedAt, now)}</span>
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

/** 侧栏下半：按最近更新排列的会话 */
export const RecentChats = () => {
  const sessions = useChatStore((state) => state.sessions)
  const activeId = useChatStore((state) => state.activeId)
  const now = useNow(60_000)

  return (
    <section className={styles.section} aria-labelledby="rp-recent-title">
      <div className={styles.header}>
        <h2 id="rp-recent-title" className={styles.sectionTitle}>
          {shellStrings.recentTitle}
        </h2>
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
