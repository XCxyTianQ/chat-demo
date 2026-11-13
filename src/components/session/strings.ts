/**
 * 观测舱的文案：中文在这里，编号类英文（ASTRA / RECEIVED / UPLINK …）是视觉装置，不是给用户读的句子。
 * 组件里不散落字面量。
 */
export const sceneStrings = {
  /** 没有标题的会话 */
  untitled: '未命名的一段',
  /** 页头仪表按钮：打开角色档案 */
  characterSheet: '档案',
  /** 页头仪表按钮：用同一个角色开一段新观测 */
  newScene: '新的一段',
  /** 控制台下方提示 */
  caveat: '内容由 AI 生成，请把它当作故事',

  /** 页头左侧竖排标识 */
  brand: 'ASTRA',
  /** 页头第一行：观测记录编号 */
  observationLog: 'OBSERVATION LOG',
  record: '记录',

  /** AI 记录的元信息标签 */
  received: 'RECEIVED',
  /** 用户上行卡的标签 */
  uplink: 'UPLINK',
  /** 编辑自己的输入 */
  edit: '编辑',
  /** 幕次分隔 */
  divider: '观测记录',
  /** 分隔与坐标之间的分隔符 */
  separator: '·',

  /** 控制台左侧竖排标识 */
  transmit: 'TRANSMIT',
  /** 控制台状态行 */
  linkStable: 'LINK STABLE',
  model: 'deepseek-flash',
  charUnit: '字',
  /** 工具行开关 */
  attach: '附件',
  thinking: '深度思考',
  network: '联网',
}
