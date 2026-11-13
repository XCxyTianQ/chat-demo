import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { CharacterCard, Persona } from './types.js'

/** 角色库独立一个库，与 chat-demo 的会话数据分开，互不影响升级。 */
const DB_NAME = 'chat-demo-rp'
const DB_VERSION = 1

interface RpDB extends DBSchema {
  characters: { key: string; value: CharacterCard }
  meta: { key: string; value: unknown }
}

let dbPromise: Promise<IDBPDatabase<RpDB>> | null = null

const getDB = () =>
  (dbPromise ??= openDB<RpDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('characters')) {
        db.createObjectStore('characters', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta')
      }
    },
  }).catch((error: unknown) => {
    dbPromise = null
    throw error
  }))

export const loadCharacters = async (): Promise<CharacterCard[]> => {
  const all = await (await getDB()).getAll('characters')
  return all.sort((a, b) => a.createdAt - b.createdAt)
}

export const saveCharacter = async (character: CharacterCard): Promise<void> => {
  await (await getDB()).put('characters', character)
}

export const deleteCharacter = async (id: string): Promise<void> => {
  await (await getDB()).delete('characters', id)
}

export const loadPersona = async (): Promise<Persona | undefined> =>
  (await (await getDB()).get('meta', 'persona')) as Persona | undefined

export const savePersona = async (persona: Persona): Promise<void> => {
  await (await getDB()).put('meta', persona, 'persona')
}

export const loadMeta = async <T>(key: string): Promise<T | undefined> =>
  (await (await getDB()).get('meta', key)) as T | undefined

export const saveMeta = async (key: string, value: unknown): Promise<void> => {
  await (await getDB()).put('meta', value, key)
}

export const reportRpStorageError = (action: string) => (error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(`[rp-storage] ${action} failed`, error)
}
