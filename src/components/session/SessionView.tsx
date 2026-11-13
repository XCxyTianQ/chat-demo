import clsx from 'clsx'
import type { CSSProperties } from 'react'
import { useTheme } from '../../app/theme.js'
import { useCharacters } from '../../services/characters/store.js'
import { accentStyle } from '../../services/characters/types.js'
import { getVisibleMessages } from '../../services/chat/branches.js'
import type { Session } from '../../services/chat/types.js'
import { ChatInput } from '../chatInput/ChatInput.js'
import { MessageList } from '../messages/MessageList.js'
import { Astrolabe, StarField } from '../stage/Astra.js'
import { SceneHeader } from './SceneHeader.js'
import { sceneStrings } from './strings.js'
import styles from './SessionView.module.css'

/**
 * 观测舱：星野在最底层，星盘刻度环在消息列背后，内容层是「页头 → 记录流 → 控制台」。
 * 只做编排；消息与输入的逻辑都在各自组件里。
 */
export const SessionView = ({
  session,
  streaming,
  siderCollapsed,
}: {
  session: Session
  streaming: boolean
  siderCollapsed: boolean
}) => {
  const theme = useTheme()
  const characters = useCharacters((state) => state.characters)
  const character = session.characterId
    ? characters.find((item) => item.id === session.characterId)
    : undefined
  const title = session.title.trim() || sceneStrings.untitled
  // 记录号取用户消息轮次；还没有提问时是第 1 条
  const recordNumber = Math.max(
    1,
    getVisibleMessages(session).filter((message) => message.role === 'user').length
  )
  const style = (character ? accentStyle(character.accent) : {}) as CSSProperties

  return (
    <div className={styles.view} style={style}>
      {/* 深色是星野；浅色是日光观测台的蓝图网格（星野组件本身是暗底的） */}
      {theme === 'dark' ? (
        <StarField character={character} />
      ) : (
        <div className={styles.daylight} aria-hidden />
      )}
      <div className={styles.astrolabe} aria-hidden>
        <Astrolabe size={860} />
      </div>
      <div className={styles.veil} aria-hidden />
      <div className={clsx(styles.stage, siderCollapsed && styles.stageCollapsed)}>
        <SceneHeader character={character} title={title} recordNumber={recordNumber} />
        <MessageList
          session={session}
          streaming={streaming}
          character={character}
          footer={
            <div className={styles.console}>
              <div className={styles.consoleInner}>
                <ChatInput sessionId={session.id} />
              </div>
              <div className={styles.caveat}>{sceneStrings.caveat}</div>
            </div>
          }
        />
      </div>
    </div>
  )
}
