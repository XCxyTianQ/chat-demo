import { create } from 'zustand'

/** 角色扮演层的界面开关：角色编辑器、人格、设置、移动端抽屉。 */
type RpUiState = {
  /** null 表示关闭；空字符串表示新建角色；其余为编辑中的角色 id */
  editorId: string | null
  personaOpen: boolean
  siderOpen: boolean
  /** 侧栏的检索词 */
  query: string
}

export const useRpUi = create<RpUiState>(() => ({
  editorId: null,
  personaOpen: false,
  siderOpen: false,
  query: '',
}))

export const openCharacterEditor = (id: string | null = null) =>
  useRpUi.setState({ editorId: id })
export const closeCharacterEditor = () => useRpUi.setState({ editorId: null })
export const openPersona = () => useRpUi.setState({ personaOpen: true })
export const closePersona = () => useRpUi.setState({ personaOpen: false })
export const openSider = () => useRpUi.setState({ siderOpen: true })
export const closeSider = () => useRpUi.setState({ siderOpen: false })
export const setQuery = (query: string) => useRpUi.setState({ query })
