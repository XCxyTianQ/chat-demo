import clsx from 'clsx'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../../base/Button.js'
import { IconButton } from '../../base/IconButton.js'
import { IconCloseOutline16 } from '../../base/icons.js'
import { showToast } from '../../base/toastState.js'
import { useSettingsDialog } from '../../settings/settingsDialogState.js'
import {
  closeCharacterEditor,
  openCharacterEditor,
  useRpUi,
} from '../../shell/uiState.js'
import { characterAvatar } from '../../../services/characters/avatar.js'
import {
  createCharacter,
  emptyDraft,
  getCharacter,
  removeCharacter,
  updateCharacter,
} from '../../../services/characters/store.js'
import type { CharacterCard, CharacterDraft } from '../../../services/characters/types.js'
import { Constellation, starDesignation } from '../../stage/Astra.js'
import {
  draftToCard,
  exportCharacter,
  parseCharacterText,
  readCharacterFile,
} from './importExport.js'
import { STRINGS } from './strings.js'
import styles from './CharacterEditor.module.css'

/** 滑入 / 滑出的时长，与 CSS 里的 220ms 保持一致 */
const TRANSITION_MS = 220
/** 一排预设色相：暖、黄、绿、青、蓝、紫、绯各取一段 */
const HUES = [32, 48, 95, 140, 168, 190, 205, 230, 265, 285, 320, 12]
/** 头像会整张存进 IndexedDB，限制在 1MB 以内 */
const MAX_AVATAR_BYTES = 1024 * 1024

type EditorMode = 'new' | 'edit'

type EditorInstance = {
  /** 每次打开或导入都换一个 key，用来重置表单里的临时状态 */
  key: number
  mode: EditorMode
  id: string | null
  draft: CharacterDraft
  /** 打开时的内容快照，用来判断有没有未保存的修改 */
  baseline: string
}

const snapshot = (draft: CharacterDraft): string => JSON.stringify(draft)

const draftFromCard = (card: CharacterCard): CharacterDraft => ({
  name: card.name,
  avatar: card.avatar,
  accent: card.accent,
  tagline: card.tagline,
  tags: [...card.tags],
  description: card.description,
  personality: card.personality,
  scenario: card.scenario,
  firstMessage: card.firstMessage,
  exampleDialogues: card.exampleDialogues,
  systemPrompt: card.systemPrompt ?? '',
  creatorNotes: card.creatorNotes ?? '',
})

/** 逗号、中文逗号、顿号都当作分隔符，顺便去重 */
const parseTags = (text: string): string[] => [
  ...new Set(
    text
      .split(/[,，、]/)
      .map((tag) => tag.trim())
      .filter(Boolean)
  ),
]

const errorText = (error: unknown): string =>
  STRINGS.importFailed +
  '：' +
  (error instanceof Error && error.message ? error.message : STRINGS.importUnknownError)

/**
 * 星图档案：角色编辑器。
 * 右侧玻璃抽屉（桌面 520px、移动端全屏），顶部是星表信息与星座，
 * 设定按 IDENTITY / SETTING / VOICE 三节归档。
 * editorId 来自 useRpUi：null 关闭、空串新建、其余为角色 id。
 */
export const CharacterEditor = () => {
  const request = useRpUi((state) => state.editorId)
  const [instance, setInstance] = useState<EditorInstance | null>(null)
  const [visible, setVisible] = useState(false)
  const [tagsText, setTagsText] = useState('')
  const [pasteOpen, setPasteOpen] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const titleId = useId()
  const nameRef = useRef<HTMLInputElement>(null)
  const avatarInput = useRef<HTMLInputElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const seq = useRef(0)
  const exitTimer = useRef(0)
  const enterFrame = useRef(0)
  const instanceRef = useRef<EditorInstance | null>(instance)
  instanceRef.current = instance

  const makeInstance = (
    mode: EditorMode,
    id: string | null,
    draft: CharacterDraft
  ): EditorInstance => {
    seq.current += 1
    return { key: seq.current, mode, id, draft, baseline: snapshot(draft) }
  }

  // 打开 / 切换 / 关闭都只由 editorId 驱动；关闭时先播完滑出动画再卸载
  useEffect(() => {
    window.clearTimeout(exitTimer.current)
    cancelAnimationFrame(enterFrame.current)
    const current = instanceRef.current

    if (request === null) {
      if (!current) {
        return
      }
      setVisible(false)
      exitTimer.current = window.setTimeout(() => setInstance(null), TRANSITION_MS)
      return () => window.clearTimeout(exitTimer.current)
    }

    const keeping =
      (request === '' && current?.mode === 'new') ||
      (request !== '' && current?.mode === 'edit' && current.id === request)
    if (!keeping) {
      if (request === '') {
        setInstance(makeInstance('new', null, emptyDraft()))
      } else {
        const card = getCharacter(request)
        if (!card) {
          // 角色已经被删掉了，编辑器直接关掉
          closeCharacterEditor()
          return
        }
        setInstance(makeInstance('edit', card.id, draftFromCard(card)))
      }
    }

    enterFrame.current = requestAnimationFrame(() => setVisible(true))
    return () => {
      cancelAnimationFrame(enterFrame.current)
      window.clearTimeout(exitTimer.current)
    }
  }, [request])

  const instanceKey = instance?.key ?? 0

  // 换一个角色或重新打开时，清掉只属于上一次的临时状态
  useEffect(() => {
    setTagsText(instance ? instance.draft.tags.join('，') : '')
    setPasteOpen(false)
    setPasteText('')
    setConfirmDelete(false)
    setBusy(false)
  }, [instanceKey])

  const dirty = instance ? snapshot(instance.draft) !== instance.baseline : false
  const dirtyRef = useRef(dirty)
  dirtyRef.current = dirty
  const open = instance !== null

  const tryClose = () => {
    // 已经在关闭动画里（editorId 已置空）就不再重复确认
    if (useRpUi.getState().editorId === null) {
      return
    }
    if (dirtyRef.current && !window.confirm(STRINGS.discardConfirm)) {
      return
    }
    closeCharacterEditor()
  }
  const tryCloseRef = useRef(tryClose)
  tryCloseRef.current = tryClose

  // Esc 关闭；叠在上面的弹窗（设置、观测者）自己处理 Esc
  useEffect(() => {
    if (!open) {
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) {
        return
      }
      if (useRpUi.getState().personaOpen || useSettingsDialog.getState().open) {
        return
      }
      event.preventDefault()
      tryCloseRef.current()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  const patch = (value: Partial<CharacterDraft>) => {
    setInstance((current) =>
      current ? { ...current, draft: { ...current.draft, ...value } } : current
    )
  }

  /** 导入成功后固定落在「新建」，编辑器若在编辑既有角色也会切回新建 */
  const applyImported = (draft: CharacterDraft) => {
    setInstance(makeInstance('new', null, draft))
    openCharacterEditor('')
    showToast(STRINGS.importReady)
  }

  const onAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      showToast(STRINGS.avatarTooLarge)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        patch({ avatar: reader.result })
      } else {
        showToast(STRINGS.avatarReadFailed)
      }
    }
    reader.onerror = () => showToast(STRINGS.avatarReadFailed)
    reader.readAsDataURL(file)
  }

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }
    try {
      applyImported(await readCharacterFile(file))
    } catch (error) {
      showToast(errorText(error))
    }
  }

  const parsePasted = () => {
    try {
      applyImported(parseCharacterText(pasteText))
    } catch (error) {
      showToast(errorText(error))
    }
  }

  const exportDraft = () => {
    if (!instance) {
      return
    }
    const name = instance.draft.name.trim()
    if (!name) {
      showToast(STRINGS.exportEmptyName)
      nameRef.current?.focus()
      return
    }
    exportCharacter(draftToCard({ ...instance.draft, name }, instance.id ?? undefined))
    showToast(STRINGS.exported)
  }

  const save = async () => {
    if (!instance || busy) {
      return
    }
    const name = instance.draft.name.trim()
    if (!name) {
      showToast(STRINGS.nameRequired)
      nameRef.current?.focus()
      return
    }
    setBusy(true)
    try {
      const draft = { ...instance.draft, name }
      if (instance.mode === 'edit' && instance.id) {
        await updateCharacter(instance.id, draft)
      } else {
        await createCharacter(draft)
      }
      showToast(STRINGS.saved)
      closeCharacterEditor()
    } catch {
      showToast(STRINGS.saveFailed)
    } finally {
      setBusy(false)
    }
  }

  const confirmRemove = async () => {
    if (!instance?.id || busy) {
      return
    }
    setBusy(true)
    try {
      await removeCharacter(instance.id)
      showToast(STRINGS.deleted)
      closeCharacterEditor()
    } catch {
      showToast(STRINGS.deleteFailed)
    } finally {
      setBusy(false)
      setConfirmDelete(false)
    }
  }

  if (!instance) {
    return null
  }

  const draft = instance.draft
  const editing = instance.mode === 'edit'
  const designation = starDesignation(draft.name)

  return createPortal(
    <div
      className={clsx(styles.overlay, visible && styles.overlayVisible)}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          tryClose()
        }
      }}
    >
      <aside
        className={clsx(styles.drawer, 'rp-grain', visible && styles.drawerVisible)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{ '--char-hue': String(draft.accent) } as CSSProperties}
      >
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {editing ? STRINGS.editTitle : STRINGS.newTitle}
          </h2>
          <IconButton
            icon={<IconCloseOutline16 />}
            aria-label={STRINGS.close}
            onClick={tryClose}
          />
        </header>

        <div className={styles.body}>
          <div className={styles.archiveBar}>
            <span className={styles.archiveTitle}>{STRINGS.archiveTitle}</span>
            <span className={styles.archiveMeta}>
              <span>{designation.catalog}</span>
              <span className={styles.archiveDot} aria-hidden="true">
                ·
              </span>
              <span>{designation.coordinate}</span>
            </span>
          </div>

          <section className={styles.preview}>
            <div className={styles.avatarColumn}>
              <button
                type="button"
                className={styles.avatarButton}
                aria-label={draft.avatar ? STRINGS.avatarChange : STRINGS.avatarUpload}
                onClick={() => avatarInput.current?.click()}
              >
                <img className={styles.avatar} src={characterAvatar(draft)} alt="" />
              </button>
              {draft.avatar ? (
                <button
                  type="button"
                  className={styles.avatarRemove}
                  onClick={() => patch({ avatar: undefined })}
                >
                  {STRINGS.avatarRemove}
                </button>
              ) : (
                <span className={styles.avatarHint}>{STRINGS.avatarUpload}</span>
              )}
              <input
                ref={avatarInput}
                type="file"
                accept="image/*"
                hidden
                onChange={onAvatarChange}
              />
            </div>

            <div className={styles.previewFields}>
              <input
                ref={nameRef}
                className={styles.nameInput}
                value={draft.name}
                placeholder={STRINGS.namePlaceholder}
                aria-label={STRINGS.nameLabel}
                autoFocus={instance.mode === 'new'}
                onChange={(event) => patch({ name: event.target.value })}
              />
              <input
                className={styles.glassInput}
                value={draft.tagline}
                placeholder={STRINGS.taglinePlaceholder}
                aria-label={STRINGS.taglineLabel}
                onChange={(event) => patch({ tagline: event.target.value })}
              />
              <input
                className={styles.glassInput}
                value={tagsText}
                placeholder={STRINGS.tagsPlaceholder}
                aria-label={STRINGS.tagsLabel}
                onChange={(event) => {
                  setTagsText(event.target.value)
                  patch({ tags: parseTags(event.target.value) })
                }}
              />
            </div>

            <Constellation
              className={styles.constellation}
              name={draft.name}
              accent={draft.accent}
              size={120}
            />

            <HuePicker accent={draft.accent} onChange={(accent) => patch({ accent })} />
          </section>

          <Section code={STRINGS.identityCode} name={STRINGS.identityName}>
            <Field
              label={STRINGS.descriptionLabel}
              value={draft.description}
              rows={5}
              placeholder={STRINGS.descriptionPlaceholder}
              onChange={(description) => patch({ description })}
            />
            <Field
              label={STRINGS.personalityLabel}
              value={draft.personality}
              rows={3}
              placeholder={STRINGS.personalityPlaceholder}
              onChange={(personality) => patch({ personality })}
            />
          </Section>

          <Section code={STRINGS.settingCode} name={STRINGS.settingName}>
            <Field
              label={STRINGS.scenarioLabel}
              value={draft.scenario}
              rows={3}
              placeholder={STRINGS.scenarioPlaceholder}
              onChange={(scenario) => patch({ scenario })}
            />
            <Field
              label={STRINGS.systemPromptLabel}
              value={draft.systemPrompt ?? ''}
              rows={3}
              placeholder={STRINGS.systemPromptPlaceholder}
              optional
              onChange={(systemPrompt) => patch({ systemPrompt })}
            />
          </Section>

          <Section code={STRINGS.voiceCode} name={STRINGS.voiceName}>
            <Field
              label={STRINGS.firstMessageLabel}
              value={draft.firstMessage}
              rows={6}
              placeholder={STRINGS.firstMessagePlaceholder}
              hint={STRINGS.firstMessageHint}
              onChange={(firstMessage) => patch({ firstMessage })}
            />
            <Field
              label={STRINGS.exampleDialoguesLabel}
              value={draft.exampleDialogues}
              rows={6}
              placeholder={STRINGS.exampleDialoguesPlaceholder(draft.name)}
              hint={STRINGS.exampleDialoguesHint}
              onChange={(exampleDialogues) => patch({ exampleDialogues })}
            />
          </Section>
        </div>

        {pasteOpen ? (
          <div className={styles.pastePanel}>
            <span className={styles.pasteTitle}>{STRINGS.pasteTitle}</span>
            <textarea
              className={styles.pasteArea}
              rows={4}
              value={pasteText}
              placeholder={STRINGS.pastePlaceholder}
              onChange={(event) => setPasteText(event.target.value)}
              autoFocus
            />
            <div className={styles.pasteActions}>
              <Button
                variant="outlined"
                size="s"
                onClick={() => {
                  setPasteOpen(false)
                  setPasteText('')
                }}
              >
                {STRINGS.cancel}
              </Button>
              <Button variant="primary" size="s" onClick={parsePasted}>
                {STRINGS.parse}
              </Button>
            </div>
          </div>
        ) : null}

        <footer className={styles.footer}>
          {confirmDelete ? (
            <div className={styles.deleteBar}>
              <span className={styles.deleteText}>
                {STRINGS.deleteTitle}
                <em>{STRINGS.deleteHint}</em>
              </span>
              <div className={styles.deleteActions}>
                <Button variant="outlined" size="m" onClick={() => setConfirmDelete(false)}>
                  {STRINGS.back}
                </Button>
                <Button
                  variant="danger"
                  size="m"
                  disabled={busy}
                  onClick={() => void confirmRemove()}
                >
                  {busy ? STRINGS.deleting : STRINGS.confirmDelete}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.footerActions}>
                <button
                  type="button"
                  className={styles.textAction}
                  aria-label={STRINGS.importCardLabel}
                  onClick={() => fileInput.current?.click()}
                >
                  {STRINGS.actionImport}
                </button>
                <button
                  type="button"
                  className={styles.textAction}
                  aria-label={STRINGS.pasteLabel}
                  onClick={() => setPasteOpen(true)}
                >
                  {STRINGS.actionPaste}
                </button>
                <button
                  type="button"
                  className={styles.textAction}
                  aria-label={STRINGS.exportLabel}
                  onClick={exportDraft}
                >
                  {STRINGS.actionExport}
                </button>
              </div>
              <div className={styles.footerPrimary}>
                {editing ? (
                  <Button
                    variant="dangerOutlined"
                    size="m"
                    disabled={busy}
                    onClick={() => setConfirmDelete(true)}
                  >
                    {STRINGS.delete}
                  </Button>
                ) : null}
                <Button variant="outlined" size="m" disabled={busy} onClick={tryClose}>
                  {STRINGS.cancel}
                </Button>
                <Button
                  variant="primary"
                  size="m"
                  className={styles.save}
                  disabled={busy}
                  onClick={() => void save()}
                >
                  {busy ? STRINGS.saving : STRINGS.save}
                </Button>
              </div>
            </>
          )}
        </footer>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(event) => void onFileChange(event)}
        />
      </aside>
    </div>,
    document.body
  )
}

/** 分节：等宽编号 + 中文名，上方一条发丝线 */
const Section = ({
  code,
  name,
  children,
}: {
  code: string
  name: string
  children: ReactNode
}) => (
  <section className={styles.section}>
    <h3 className={styles.sectionTitle}>
      <span className={styles.sectionCode}>{code}</span>
      <span className={styles.sectionDot} aria-hidden="true">
        ·
      </span>
      <span className={styles.sectionName}>{name}</span>
    </h3>
    <div className={styles.sectionBody}>{children}</div>
  </section>
)

/** 12 个色点 + 一条滑杆；点色点直接换色相，滑杆做细调 */
const HuePicker = ({
  accent,
  onChange,
}: {
  accent: number
  onChange: (accent: number) => void
}) => (
  <div className={styles.hue}>
    <div className={styles.hueLabelRow}>
      <span className={styles.hueLabel}>{STRINGS.hueLabel}</span>
      <span className={styles.hueValue}>{STRINGS.hueValue(accent)}</span>
    </div>
    <div className={styles.hues} role="radiogroup" aria-label={STRINGS.hueLabel}>
      {HUES.map((hue) => (
        <button
          key={hue}
          type="button"
          role="radio"
          aria-checked={accent === hue}
          aria-label={STRINGS.hueSwatchLabel(hue)}
          className={clsx(styles.hueDot, accent === hue && styles.hueDotActive)}
          style={{ '--dot-hue': String(hue) } as CSSProperties}
          onClick={() => onChange(hue)}
        />
      ))}
    </div>
    <input
      className={styles.hueRange}
      type="range"
      min={0}
      max={359}
      value={accent}
      aria-label={STRINGS.hueAdjust}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  </div>
)

/** 带标题的多行输入；提示用等宽小字，像仪器的状态注记 */
const Field = ({
  label,
  value,
  onChange,
  rows,
  placeholder,
  hint,
  optional = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows: number
  placeholder?: string
  hint?: string
  optional?: boolean
}) => (
  <label className={styles.field}>
    <span className={styles.fieldLabel}>
      {label}
      {optional ? <span className={styles.optional}>{STRINGS.optional}</span> : null}
    </span>
    <textarea
      className={styles.textarea}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
    {hint ? <span className={styles.fieldHint}>{hint}</span> : null}
  </label>
)
