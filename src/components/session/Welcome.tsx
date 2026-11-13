import { useCharacters } from '../../services/characters/store.js'
import { startCharacterChat } from '../../services/chat/store.js'
import { CharacterCard } from '../characters/CharacterCard.js'
import { openCharacterEditor } from '../shell/uiState.js'
import { shellStrings } from '../shell/strings.js'
import styles from './Welcome.module.css'

/** 新记录（没有选中会话）：星图长廊，选一颗星开始今晚的观测 */
export const Welcome = () => {
  const characters = useCharacters((state) => state.characters)

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>{shellStrings.welcomeEyebrow}</p>
          <h1 className={styles.title}>{shellStrings.welcomeTitle}</h1>
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
            <span className={styles.newPlus} aria-hidden="true">
              ＋
            </span>
            <span className={styles.newLabel}>{shellStrings.newCharacter}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
