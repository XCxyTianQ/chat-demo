import { useCharacters } from '../../services/characters/store.js'
import { startCharacterChat } from '../../services/chat/store.js'
import { IconPlusOutline16 } from '../base/rpIcons.js'
import { IconButton } from '../base/IconButton.js'
import { CharacterCard } from '../characters/CharacterCard.js'
import { closeSider, openCharacterEditor } from './uiState.js'
import { shellStrings } from './strings.js'
import styles from './CharacterStrip.module.css'

/** 侧栏上半 · 星图：一颗星即一个角色，点星即以该角色开新记录 */
export const CharacterStrip = () => {
  const ready = useCharacters((state) => state.ready)
  const characters = useCharacters((state) => state.characters)
  const activeCharacterId = useCharacters((state) => state.activeCharacterId)

  return (
    <section className={styles.section} aria-labelledby="astra-characters-title">
      <div className={styles.header}>
        <div className={styles.heading}>
          <h2 id="astra-characters-title" className={styles.title}>
            {shellStrings.charactersTitle}
          </h2>
          <span className={styles.label}>{shellStrings.charactersLabel}</span>
        </div>
        <span className={styles.spacer} />
        {characters.length > 0 ? <span className={styles.count}>{characters.length}</span> : null}
        <IconButton
          icon={<IconPlusOutline16 />}
          tooltip={shellStrings.newCharacter}
          onClick={() => openCharacterEditor(null)}
        />
      </div>
      <div className={styles.list}>
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            variant="row"
            character={character}
            active={character.id === activeCharacterId}
            onOpen={() => {
              startCharacterChat(character.id)
              closeSider()
            }}
            onEdit={() => openCharacterEditor(character.id)}
          />
        ))}
        {ready && characters.length === 0 ? (
          <p className={styles.empty}>{shellStrings.charactersEmpty}</p>
        ) : null}
      </div>
    </section>
  )
}
