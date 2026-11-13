import type { ReactNode } from 'react'
import clsx from 'clsx'
import styles from './ActionButton.module.css'

/** 记录操作区的小按钮：图标 + 等宽小字，hover 才从记录里浮出来 */
export const ActionButton = ({
  icon,
  label,
  onClick,
  disabled,
  active,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  /** 正在朗读等持续状态 */
  active?: boolean
}) => (
  <button
    type="button"
    className={clsx(styles.button, active && styles.active)}
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
  >
    <span className={styles.icon}>{icon}</span>
    <span className={styles.label}>{label}</span>
  </button>
)
