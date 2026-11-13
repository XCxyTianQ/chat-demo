import { useCharacters } from '../../services/characters/store.js'
import { startCharacterChat } from '../../services/chat/store.js'
import { IconPlusOutline16 } from '../base/rpIcons.js'
import { CharacterCard } from '../characters/CharacterCard.js'
import { openCharacterEditor } from '../shell/uiState.js'
import { shellStrings } from '../shell/strings.js'
import styles from './Welcome.module.css'

/** 新对话（没有选中会话）：角色画廊，选一个人开始今晚 */
export const Welcome = () => {
  const characters = useCharacters((state) => state.characters)

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <h1 className={styles.title}>{shellStrings.welcomeTitle}</h1>
          <p className={styles.subtitle}>{shellStrings.welcomeSubtitle}</p>
        </header>
        <div className={styles.grid}>
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onOpen={() => startCharacterChat(character.id)}
              onEdit={() => openCharacterEditor(character.id)}
            />
          ))}
          <button
            type="button"
            className={styles.newCard}
            onClick={() => openCharacterEditor(null)}
          >
            <span className={styles.newIcon}>
              <IconPlusOutline16 />
            </span>
            <span className={styles.newLabel}>{shellStrings.newCharacter}</span>
            <span className={styles.newHint}>{shellStrings.newCharacterHint}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
