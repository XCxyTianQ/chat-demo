import type { CharacterCard, Persona } from './types.js'

/** 官方默认系统提示；没有绑定角色时保持上游行为。 */
export const DEFAULT_SYSTEM_PROMPT = '该助手为DeepSeek，由深度求索公司创造。'

const section = (title: string, body: string) => `【${title}】\n${body.trim()}`

/**
 * 由角色卡与用户人格组装系统提示。
 * 目标是让模型稳定地「在戏里」：保持角色口吻、不跳出、不代用户行动、节奏适中。
 */
export const buildSystemPrompt = (
  character: CharacterCard | undefined,
  persona: Persona | undefined,
  opening?: string
): string => {
  if (!character) {
    return DEFAULT_SYSTEM_PROMPT
  }
  const parts: string[] = [
    `你现在扮演「${character.name}」，与用户进行沉浸式的文字角色扮演。`,
    '始终保持角色的身份、语气、认知与情感，不要出戏，不要提及自己是模型、AI 或助手，',
    '不要替用户说话或替用户做决定，也不要总结对话或给出建议清单。',
  ]
  if (character.description.trim()) {
    parts.push(section('角色设定', character.description))
  }
  if (character.personality.trim()) {
    parts.push(section('性格与说话方式', character.personality))
  }
  if (character.scenario.trim()) {
    parts.push(section('当前情境', character.scenario))
  }
  if (character.exampleDialogues.trim()) {
    parts.push(section('对话示例（仅用于把握语气，不要照抄）', character.exampleDialogues))
  }
  const me = persona?.name?.trim()
  const meDesc = persona?.description?.trim()
  if (me || meDesc) {
    parts.push(
      section(
        '对话者',
        [me ? `用户以「${me}」的身份在场。` : '', meDesc].filter(Boolean).join('\n')
      )
    )
  }
  parts.push(
    section(
      '写作要求',
      [
        '- 用简体中文回复，小说式叙述与对白混合，动作、神态可放在叙述中；',
        '- 每次回复控制在 2 至 5 个自然段，篇幅适中，留出让对方接话的余地；',
        '- 不要使用列表、标题、代码块等工程化格式，除非情境确实需要；',
        '- 让情节自然推进，可以引入细小的环境与感官细节。',
      ].join('\n')
    )
  )
  if (opening?.trim()) {
    parts.push(
      section(
        '已经发生的开场',
        ['你刚刚已经对用户说过下面这段话，故事从这里继续，不要复述它：', opening.trim()].join('\n')
      )
    )
  }
  if (character.systemPrompt?.trim()) {
    parts.push(section('额外设定', character.systemPrompt))
  }
  return parts.join('\n\n')
}
