/** 角色卡与用户人格的数据模型。字段对齐 SillyTavern V2 角色卡，便于导入导出。 */
export type CharacterCard = {
  id: string
  name: string
  /** 头像：data URL、http(s) 链接，或空（用生成式头像） */
  avatar?: string
  /** 色相 0-359，驱动整个界面的强调色与光晕 */
  accent: number
  /** 一句话人设，出现在卡片与侧栏 */
  tagline: string
  tags: string[]
  /** 角色设定（外貌、身份、关系、背景） */
  description: string
  /** 性格要点 */
  personality: string
  /** 初次见面的场景 */
  scenario: string
  /** 开场白，进入对话时由角色说出 */
  firstMessage: string
  /** 示例对话，帮助模型抓住语气 */
  exampleDialogues: string
  /** 角色私有的额外指令，拼在系统提示末尾 */
  systemPrompt?: string
  /** 作者备注，只在本机展示，不进入提示 */
  creatorNotes?: string
  createdAt: number
  updatedAt: number
}

export type Persona = {
  name: string
  /** 在故事里的身份、外貌、与角色的关系 */
  description: string
  avatar?: string
}

export type CharacterDraft = Omit<CharacterCard, 'id' | 'createdAt' | 'updatedAt'>

/** 没有头像时按名字与色相生成一个稳定的渐变色 */
export const accentStyle = (accent: number) => ({ '--char-hue': String(accent) }) as React.CSSProperties
