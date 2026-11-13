import { create } from 'zustand'
import { createId } from '../../utils/id.js'
import type { CharacterCard, CharacterDraft, Persona } from './types.js'
import * as db from './db.js'
import { seedCharacters } from './seed.js'

export const DEFAULT_PERSONA: Persona = { name: '旅人', description: '' }

type CharacterState = {
  ready: boolean
  characters: CharacterCard[]
  persona: Persona
  /** 当前选中的角色：决定新会话绑定谁、界面强调色 */
  activeCharacterId: string | null
}

export const useCharacters = create<CharacterState>(() => ({
  ready: false,
  characters: [],
  persona: DEFAULT_PERSONA,
  activeCharacterId: null,
}))

let initTask: Promise<void> | undefined

export const initCharacters = (): Promise<void> => {
  if (useCharacters.getState().ready) {
    return Promise.resolve()
  }
  initTask ??= (async () => {
    try {
      const [stored, persona] = await Promise.all([db.loadCharacters(), db.loadPersona()])
      if (stored.length === 0) {
        await Promise.all(seedCharacters.map((character) => db.saveCharacter(character)))
        useCharacters.setState({
          ready: true,
          characters: seedCharacters,
          persona: persona ?? DEFAULT_PERSONA,
          activeCharacterId: seedCharacters[0]?.id ?? null,
        })
        return
      }
      useCharacters.setState({
        ready: true,
        characters: stored,
        persona: persona ?? DEFAULT_PERSONA,
        activeCharacterId: stored[0]?.id ?? null,
      })
    } catch (error) {
      db.reportRpStorageError('load characters')(error)
      useCharacters.setState({ ready: true, characters: seedCharacters })
    }
  })()
  return initTask
}

export const getCharacter = (id: string | null | undefined): CharacterCard | undefined => {
  if (!id) {
    return undefined
  }
  return useCharacters.getState().characters.find((character) => character.id === id)
}

export const setActiveCharacter = (id: string | null) => {
  useCharacters.setState({ activeCharacterId: id })
}

const sortCharacters = (characters: CharacterCard[]) =>
  [...characters].sort((a, b) => a.createdAt - b.createdAt)

export const createCharacter = async (draft: CharacterDraft): Promise<CharacterCard> => {
  const now = Date.now()
  const character: CharacterCard = { ...draft, id: createId(), createdAt: now, updatedAt: now }
  useCharacters.setState((state) => ({
    characters: sortCharacters([...state.characters, character]),
    activeCharacterId: character.id,
  }))
  await db.saveCharacter(character).catch(db.reportRpStorageError('create character'))
  return character
}

export const updateCharacter = async (
  id: string,
  patch: Partial<CharacterDraft>
): Promise<void> => {
  const current = getCharacter(id)
  if (!current) {
    return
  }
  const next: CharacterCard = { ...current, ...patch, id, updatedAt: Date.now() }
  useCharacters.setState((state) => ({
    characters: state.characters.map((character) => (character.id === id ? next : character)),
  }))
  await db.saveCharacter(next).catch(db.reportRpStorageError('update character'))
}

export const removeCharacter = async (id: string): Promise<void> => {
  useCharacters.setState((state) => ({
    characters: state.characters.filter((character) => character.id !== id),
    activeCharacterId: state.activeCharacterId === id ? null : state.activeCharacterId,
  }))
  await db.deleteCharacter(id).catch(db.reportRpStorageError('delete character'))
}

export const setPersona = async (persona: Persona): Promise<void> => {
  useCharacters.setState({ persona })
  await db.savePersona(persona).catch(db.reportRpStorageError('save persona'))
}

/** 由名字派生一个稳定色相，导入的角色卡没有配色时使用 */
export const accentFor = (name: string): number => {
  let h = 0
  for (let i = 0; i < name.length; i += 1) {
    h = (h * 31 + name.charCodeAt(i)) % 360
  }
  return h
}

export const emptyDraft = (): CharacterDraft => ({
  name: '',
  accent: 32,
  tagline: '',
  tags: [],
  description: '',
  personality: '',
  scenario: '',
  firstMessage: '',
  exampleDialogues: '',
  systemPrompt: '',
  creatorNotes: '',
})

/** 导出为 SillyTavern V2 角色卡结构，便于在其他前端复用 */
export const toCharacterJson = (character: CharacterCard): string =>
  JSON.stringify(
    {
      spec: 'chara_card_v2',
      spec_version: '2.0',
      data: {
        name: character.name,
        description: character.description,
        personality: character.personality,
        scenario: character.scenario,
        first_mes: character.firstMessage,
        mes_example: character.exampleDialogues,
        creator_notes: character.creatorNotes ?? '',
        system_prompt: character.systemPrompt ?? '',
        tags: character.tags,
        creator: 'chat-demo-rp',
        character_version: '1.0',
        extensions: { accent: character.accent, tagline: character.tagline },
      },
    },
    null,
    2
  )

type RawCard = {
  name?: unknown
  description?: unknown
  personality?: unknown
  scenario?: unknown
  first_mes?: unknown
  mes_example?: unknown
  creator_notes?: unknown
  creatorcomment?: unknown
  system_prompt?: unknown
  tags?: unknown
  data?: Record<string, unknown>
  extensions?: Record<string, unknown>
}

const text = (value: unknown): string => (typeof value === 'string' ? value : '')

/** 解析 SillyTavern V2 / V1 角色卡 JSON 或裸对象，失败时抛错由界面提示 */
export const fromCharacterJson = (raw: string): CharacterDraft => {
  const parsed = JSON.parse(raw) as RawCard
  const data = (parsed.data ?? parsed) as RawCard
  const extensions = (data.extensions ?? parsed.extensions ?? {}) as Record<string, unknown>
  const name = text(data.name ?? parsed.name).trim()
  if (!name) {
    throw new Error('角色卡缺少 name 字段')
  }
  const accentRaw = extensions.accent
  return {
    ...emptyDraft(),
    name,
    accent: typeof accentRaw === 'number' ? Math.round(accentRaw) % 360 : accentFor(name),
    tagline: text(extensions.tagline) || text(data.creator_notes).split('\n')[0]?.slice(0, 24) || '',
    tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    description: text(data.description),
    personality: text(data.personality),
    scenario: text(data.scenario),
    firstMessage: text(data.first_mes ?? (parsed as RawCard).first_mes),
    exampleDialogues: text(data.mes_example ?? (parsed as RawCard).mes_example),
    systemPrompt: text(data.system_prompt),
    creatorNotes: text(data.creator_notes ?? (parsed as RawCard).creatorcomment),
  }
}
