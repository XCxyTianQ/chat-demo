import { sceneStrings } from '../session/strings.js'
import styles from './RecordDivider.module.css'

const pad2 = (value: number) => String(value).padStart(2, '0')

/** 幕次分隔：两侧发丝线，中间一枚星点与「观测记录 01 · 23:11」 */
export const RecordDivider = ({ index, time }: { index: number; time: number }) => {
  const date = new Date(time)
  const clock = Number.isNaN(date.getTime())
    ? ''
    : `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
  return (
    <div className={styles.divider}>
      <span className={styles.line} aria-hidden />
      <span className={styles.node} aria-hidden />
      <span className={styles.text}>
        {sceneStrings.divider} {String(index).padStart(2, '0')}
        {clock ? ` · ${clock}` : null}
      </span>
      <span className={styles.line} aria-hidden />
    </div>
  )
}
