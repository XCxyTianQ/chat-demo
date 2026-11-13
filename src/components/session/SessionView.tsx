import clsx from 'clsx'
import { useCharacters } from '../../services/characters/store.js'
import { accentStyle } from '../../services/characters/types.js'
import type { Session } from '../../services/chat/types.js'
import { ChatInput } from '../chatInput/ChatInput.js'
import { MessageList } from '../messages/MessageList.js'
import { SceneHeader } from './SceneHeader.js'
import { sceneStrings } from './strings.js'
import styles from './SessionView.module.css'

/**
 * 会话页：场景头 + 剧本式消息流 + 浮起的输入区。
 * 只负责编排，消息与输入的逻辑都在各自组件里。
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
  const characters = useCharacters((state) => state.characters)
  const character = session.characterId
    ? characters.find((item) => item.id === session.characterId)
    : undefined
  const title = session.title.trim() || sceneStrings.untitled
  return (
    <div
      className={clsx(styles.view, siderCollapsed && styles.withCollapsedSider)}
      // 会话自己的角色决定整页的强调色，不依赖外壳当前选中的角色
      style={character ? accentStyle(character.accent) : undefined}
    >
      <SceneHeader character={character} title={title} />
      <MessageList
        session={session}
        streaming={streaming}
        character={character}
        footer={
          <div className={styles.dock}>
            <div className={styles.dockInner}>
              <ChatInput sessionId={session.id} />
            </div>
            <div className={styles.caveat}>{sceneStrings.caveat}</div>
          </div>
        }
      />
    </div>
  )
}
