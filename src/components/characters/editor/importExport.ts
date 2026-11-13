import { fromCharacterJson, toCharacterJson } from '../../../services/characters/store.js'
import type { CharacterCard, CharacterDraft } from '../../../services/characters/types.js'
import { STRINGS } from './strings.js'

/** 去掉文件名里不能用的字符，避免下载时变成乱码名 */
const safeFileName = (name: string): string => {
  const cleaned = name.trim().replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_')
  return cleaned || 'character'
}

/** 触发一次文本下载；与设置里的导出同一套做法 */
const downloadText = (fileName: string, text: string) => {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.style.display = 'none'
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/**
 * 未保存的新角色也要能导出：补上 id 与时间戳，
 * 只为满足 toCharacterJson 的入参类型，id 不会写进角色卡。
 */
export const draftToCard = (draft: CharacterDraft, id?: string): CharacterCard => ({
  ...draft,
  id: id ?? 'draft',
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

/** 导出为 SillyTavern V2 角色卡，文件名用角色名 */
export const exportCharacter = (card: CharacterCard): void => {
  downloadText(`${safeFileName(card.name)}.json`, toCharacterJson(card))
}

/** 解析粘贴或上传的角色卡 JSON；失败时抛出可直接展示的中文原因 */
export const parseCharacterText = (text: string): CharacterDraft => {
  const trimmed = text.trim()
  if (!trimmed) {
    throw new Error(STRINGS.importEmpty)
  }
  try {
    JSON.parse(trimmed)
  } catch {
    throw new Error(STRINGS.importInvalidJson)
  }
  return fromCharacterJson(trimmed)
}

/** 读取 .json 文件并解析 */
export const readCharacterFile = async (file: File): Promise<CharacterDraft> =>
  parseCharacterText(await file.text())
