import { useTranslate } from '../../i18n/index.js'
import clsx from 'clsx'
import { memo, useEffect, useRef } from 'react'
import {
  IconChevronDownOutline14,
  IconChevronRightOutline14,
  IconRefreshOutline16,
  IconThinkOutline16,
  IconWarningOutline16,
} from '../base/icons.js'
import type { CharacterCard } from '../../services/characters/types.js'
import { describeReply } from '../../services/chat/describe.js'
import { canContinueReply } from '../../services/chat/reply.js'
import { continueReply, regenerateReply } from '../../services/chat/store.js'
import { stopReadAloud } from '../../services/speech/readAloud.js'
import type { AssistantMessage as AssistantMessageType } from '../../services/chat/types.js'
import { openSettings } from '../settings/settingsDialogState.js'
import { sceneStrings } from '../session/strings.js'
import { Button } from '../base/Button.js'
import { Markdown } from '../markdown/Markdown.js'
import { SiteThumbnails } from '../search/SiteLogo.js'
import { toggleSearchPanel, useSearchPanel } from '../search/searchPanelState.js'
import { ActionButton } from './ActionButton.js'
import { ReadAloudButton } from './ReadAloudButton.js'
import { CopyButton } from './CopyButton.js'
import { ReplyArea, useThinkingArea } from './ReplyArea.js'
import { useReplyView } from './useReplyView.js'
import {
  BranchSwitcher,
  type MessageVersions,
  type SelectMessageVersion,
} from './BranchSwitcher.js'
import styles from './AssistantMessage.module.css'

const TOP_UP_URL = 'https://platform.deepseek.com/top_up'

const pad2 = (value: number) => String(value).padStart(2, '0')

/** 记录时间只显示时分；无效时间返回空串，由调用处不渲染 */
const clockTime = (value: number) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

/**
 * 舞台提示段落用楷体弱色：正文里以（或 ( 开头的段落在渲染后被标上 rp-stage。
 * Markdown 的更新是异步节流的，所以用 MutationObserver 跟随每次重绘。
 */
const useStageDirectionMarks = (active: boolean) => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = ref.current
    if (!root) {
      return
    }
    const apply = () => {
      for (const paragraph of root.querySelectorAll('p')) {
        paragraph.classList.toggle(
          'rp-stage',
          /^[(（]/.test((paragraph.textContent ?? '').trimStart())
        )
      }
    }
    apply()
    const observer = new MutationObserver(apply)
    observer.observe(root, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
    // 正文容器在第一条正文到达时才挂载，active 变化时重新接管
  }, [active])
  return ref
}

export const AssistantMessage = memo(function AssistantMessage({
  sessionId,
  message,
  character,
  isLast,
  streaming,
  busy,
  versions,
  onSelectVersion,
}: {
  sessionId: string
  message: AssistantMessageType
  /** 会话绑定的角色，用于元信息行的观测者署名 */
  character?: CharacterCard
  isLast: boolean
  streaming: boolean
  busy: boolean
  versions: MessageVersions
  onSelectVersion: SelectMessageVersion
}) {
  const t = useTranslate()
  const view = useReplyView(message, streaming)
  const panelEntry = useSearchPanel((state) => state.entry)
  const notice = streaming ? null : describeReply(message)
  // 安全拒绝：已下发的思考与正文按协议丢弃，只显示模板答复。
  const refused = message.stopReason === 'refusal'
  const answer = refused ? null : view.answer
  const answerRef = useStageDirectionMarks(!!answer)
  const responseText = [answer?.text, notice?.presentation === 'response' ? notice.text : null]
    .filter(Boolean)
    .join('\n\n')
  const copyText = responseText || notice?.text
  const area = useThinkingArea(message, view, streaming, !!responseText)
  const waiting = streaming && view.steps.length === 0 && !view.answer && !message.thinking
  const summaryEntry = `${message.id}-summary`
  const time = clockTime(message.createdAt)
  return (
    <article className={styles.record}>
      <span className={styles.node} aria-hidden />
      <div className={styles.meta}>
        <span className={styles.received}>
          {sceneStrings.received}
          {time ? ` · ${time}` : null}
        </span>
        {character ? <span className={styles.operator}>{character.name}</span> : null}
        {area.title ? (
          <button
            type="button"
            className={styles.thinking}
            aria-expanded={area.open}
            aria-label={area.title}
            onClick={area.toggle}
          >
            <span className={clsx(styles.thinkingIcon, area.stopped && styles.thinkingStopped)}>
              <IconThinkOutline16 />
            </span>
            <span className={clsx(styles.thinkingText, area.titleActive && styles.shimmer)}>
              {area.title}
            </span>
            <span className={styles.chevron}>
              {area.open ? <IconChevronDownOutline14 /> : <IconChevronRightOutline14 />}
            </span>
          </button>
        ) : null}
      </div>
      <div className={styles.body}>
        {refused ? null : (
          <ReplyArea
            message={message}
            view={view}
            streaming={streaming}
            hasResponse={!!responseText}
            open={area.open}
            collapsible={!!area.title}
          />
        )}
        {answer ? (
          <div
            ref={answerRef}
            className={clsx(styles.answer, streaming && styles.streaming)}
          >
            <Markdown
              className="ds-assistant-message-main-content rp-script"
              content={answer.markdown}
              loading={streaming}
              cacheKey={message.id}
              disableLink={false}
              sources={view.sources}
            />
          </div>
        ) : null}
        {waiting ? (
          <div className={styles.waiting}>
            {[0, 1, 2].map((index) => (
              <span key={index} className={styles.waitingDot} />
            ))}
          </div>
        ) : null}
        {notice?.presentation === 'response' ? (
          <Markdown
            className="ds-assistant-message-main-content rp-script"
            content={notice.text}
            loading={false}
            cacheKey={`${message.id}-template`}
            disableLink={false}
          />
        ) : notice ? (
          <div className={styles.notice}>
            <IconWarningOutline16 />
            <span>
              {notice.text}
              {notice.action === 'apiKey' ? (
                <>
                  {' '}
                  <button
                    type="button"
                    className={styles.noticeAction}
                    onClick={() => openSettings('data')}
                  >
                    {t('changeApiKey')}
                  </button>
                </>
              ) : null}
              {notice.action === 'topUp' ? (
                <>
                  {' '}
                  <a
                    className={styles.noticeAction}
                    href={TOP_UP_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t('topUp')}
                  </a>
                </>
              ) : null}
            </span>
          </div>
        ) : null}
        {!streaming && !refused && view.searchResults.length > 0 ? (
          <div
            className={clsx(styles.summary, panelEntry === summaryEntry && styles.summaryActive)}
            onClick={() => toggleSearchPanel(summaryEntry, view.searchResults)}
          >
            <SiteThumbnails sources={view.searchResults} />
            <span>
              {t(
                view.searchResults.length === 1 ? 'messageSearchSummary' : 'messageSearchSummaries',
                { count: view.searchResults.length }
              )}
            </span>
          </div>
        ) : null}
        {streaming ? null : (
          <div className={styles.bottom}>
            <div
              className={clsx(
                styles.actions,
                (isLast || message.status === 'error') && styles.alwaysShow
              )}
            >
              {copyText ? <CopyButton text={copyText} /> : null}
              {responseText && !refused ? (
                <ReadAloudButton messageId={message.id} text={responseText} />
              ) : null}
              <ActionButton
                icon={<IconRefreshOutline16 />}
                label={t('regenerate')}
                disabled={busy || refused}
                onClick={() => {
                  stopReadAloud()
                  regenerateReply(sessionId, message.id)
                }}
              />
            </div>
            <BranchSwitcher versions={versions} disabled={busy} onSelect={onSelectVersion} />
            {isLast && canContinueReply(message) ? (
              <Button
                variant="outlined"
                size="s"
                className={styles.continueButton}
                disabled={busy}
                onClick={() => {
                  stopReadAloud()
                  continueReply(sessionId, message.id)
                }}
              >
                {t('continueGenerating')}
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </article>
  )
})
