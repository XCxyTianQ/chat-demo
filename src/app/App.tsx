import { useEffect, type CSSProperties } from 'react'
import { useTranslate } from '../i18n/index.js'
import { useSettings } from '../services/settings.js'
import { useIsMobile, useMobileViewport, usePreventPageScroll } from './viewport.js'
import {
  bindChatPersistence,
  initChat,
  retrySaveSessions,
  selectSession,
  useChatStore,
} from '../services/chat/store.js'
import { initCharacters, setActiveCharacter, useCharacters } from '../services/characters/store.js'
import { SearchPanel } from '../components/search/SearchPanel.js'
import { closeSearchPanel } from '../components/search/searchPanelState.js'
import { SessionView } from '../components/session/SessionView.js'
import { MobileHeader } from '../components/session/MobileHeader.js'
import { Welcome } from '../components/session/Welcome.js'
import { ensureApiKey } from '../components/settings/settingsDialogState.js'
import { SettingsDialog } from '../components/settings/SettingsDialog.js'
import { Toast } from '../components/base/Toast.js'
import { showToast } from '../components/base/toastState.js'
import { onUploadNotice } from '../services/attachments.js'
import { Button } from '../components/base/Button.js'
import { stopReadAloud } from '../services/speech/readAloud.js'
import { NavRail } from '../components/shell/NavRail.js'
import { Sidebar } from '../components/shell/Sidebar.js'
import { MobileDrawer } from '../components/shell/MobileDrawer.js'
import { ScriptPanel } from '../components/shell/ScriptPanel.js'
import { CharacterEditor } from '../components/characters/editor/CharacterEditor.js'
import { PersonaDialog } from '../components/characters/editor/PersonaDialog.js'
import { closeSider } from '../components/shell/uiState.js'
import { StarField } from '../components/stage/Astra.js'
import styles from './App.module.css'

export const App = () => {
  const t = useTranslate()
  const isMobile = useIsMobile()
  const locale = useSettings((state) => state.locale)
  const ready = useChatStore((state) => state.ready)
  const initError = useChatStore((state) => state.initError)
  const saveError = useChatStore((state) => Object.values(state.sessionSaveErrors).some(Boolean))
  const importingHistory = useChatStore((state) => state.importingHistory)
  const activeId = useChatStore((state) => state.activeId)
  const session = useChatStore((state) =>
    state.activeId !== null && Object.hasOwn(state.sessionCache, state.activeId)
      ? state.sessionCache[state.activeId]
      : undefined
  )
  const sessionLoadError = useChatStore((state) =>
    state.activeId === null ? false : state.sessionLoadErrors[state.activeId] === true
  )
  const streaming = useChatStore((state) =>
    state.activeId === null ? false : Object.hasOwn(state.streaming, state.activeId)
  )
  const activeCharacter = useCharacters((state) =>
    state.activeCharacterId === null
      ? undefined
      : state.characters.find((character) => character.id === state.activeCharacterId)
  )
  // 移动端顶栏显示当前会话绑定的角色名；普通助手会话退回会话标题
  const sessionCharacter = useCharacters((state) =>
    session?.characterId
      ? state.characters.find((character) => character.id === session.characterId)
      : undefined
  )
  // 打开某个角色的旧会话时，让外壳（星野色相、侧栏高亮）跟上这个角色
  const sessionCharacterId = session?.characterId ?? null
  useEffect(() => {
    if (sessionCharacterId) {
      setActiveCharacter(sessionCharacterId)
    }
  }, [sessionCharacterId])

  const hueCharacter = sessionCharacter ?? activeCharacter
  const frameRef = useMobileViewport(isMobile)

  usePreventPageScroll(isMobile)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  // 文件数、存储空间达到上限时，附件上只显示「上传失败」，原因用 toast 说明
  useEffect(() => onUploadNotice(showToast), [])
  useEffect(bindChatPersistence, [])

  // 搜索结果面板只属于当前会话
  useEffect(closeSearchPanel, [activeId])
  // 切换会话时停止朗读
  useEffect(stopReadAloud, [activeId])
  // 移动端选中会话、切换布局后收起抽屉
  useEffect(closeSider, [activeId, isMobile])

  useEffect(() => {
    void initChat()
    void initCharacters()
    // 首次打开先在设置里输入 API Key
    ensureApiKey()
  }, [])

  const sessionTitle = session ? (sessionCharacter?.name ?? session.title ?? '') : ''

  return (
    <>
      <div
        ref={frameRef}
        className={styles.frame}
        style={{ '--char-hue': String(hueCharacter?.accent ?? 210) } as CSSProperties}
      >
        {/* 整页星野：深色是深空，浅色主题下由 .frame 的月亮滤镜翻成蓝图白底 */}
        <div className={styles.starLayer} aria-hidden="true">
          <StarField character={hueCharacter} />
        </div>
        {isMobile ? null : <NavRail />}
        {isMobile ? null : <Sidebar />}
        <main className={styles.main}>
          {saveError ? (
            <div className={styles.saveError} role="alert">
              <span>{t('sessionSaveFailed')}</span>
              <Button
                variant="outlined"
                size="s"
                disabled={importingHistory}
                onClick={retrySaveSessions}
              >
                {t('retry')}
              </Button>
            </div>
          ) : null}
          {isMobile ? <MobileHeader title={sessionTitle} /> : null}
          <div className={styles.content}>
            {!ready || (activeId !== null && !session) ? (
              <div className={styles.loadingView}>
                <div className={styles.loadingState} role="status" aria-live="polite">
                  <span className={styles.loadingMark} aria-hidden="true">
                    ✦
                  </span>
                  <span>
                    {(!ready ? initError : sessionLoadError)
                      ? t(!ready ? 'sessionListLoadFailed' : 'sessionLoadFailed')
                      : t('sessionLoading')}
                  </span>
                  {(!ready ? initError : sessionLoadError) ? (
                    <Button
                      variant="outlined"
                      size="m"
                      onClick={() => {
                        if (!ready) {
                          void initChat()
                        } else if (activeId !== null) {
                          selectSession(activeId)
                        }
                      }}
                    >
                      {t('retry')}
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : session ? (
              <SessionView session={session} streaming={streaming} siderCollapsed={false} />
            ) : (
              <Welcome />
            )}
          </div>
        </main>
        {session && !isMobile ? (
          <ScriptPanel session={session} character={sessionCharacter} />
        ) : null}
        {isMobile ? <MobileDrawer /> : null}
      </div>
      <SettingsDialog />
      <CharacterEditor />
      <PersonaDialog />
      <SearchPanel />
      <Toast />
    </>
  )
}
