import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'text'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  loading?: boolean
  loadingLabel?: string
}

type SurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: 'article' | 'div' | 'section'
  variant?: 'default' | 'interactive' | 'selected' | 'locked' | 'completed'
}

type ProgressProps = {
  value: number
  max: number
  label?: ReactNode
  className?: string
}

type StatusBadgeProps = {
  status: 'complete' | 'current' | 'upcoming' | 'locked' | 'new'
  label?: string
  className?: string
}

type SectionHeaderProps = {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function Button({ variant = 'primary', loading = false, loadingLabel = 'LOADING…', className, children, disabled, ...props }: ButtonProps) {
  return <button className={joinClasses('ui-button', `ui-button-${variant}`, className)} disabled={disabled || loading} {...props}>
    {loading ? loadingLabel : children}
  </button>
}

export function Surface({ as = 'div', variant = 'default', className, ...props }: SurfaceProps) {
  const Element = as
  return <Element className={joinClasses('ui-surface', `ui-surface-${variant}`, className)} {...props} />
}

export function Progress({ value, max, label, className }: ProgressProps) {
  const safeMax = Math.max(1, max)
  const safeValue = Math.min(safeMax, Math.max(0, value))
  const percentage = (safeValue / safeMax) * 100

  return <div className={joinClasses('ui-progress', className)}>
    {label && <div className="ui-progress-label">{label}</div>}
    <div className="ui-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={safeMax} aria-valuenow={safeValue}>
      <span className="ui-progress-fill" style={{ width: `${percentage}%` }} />
    </div>
  </div>
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const defaultLabels = { complete: 'COMPLETE', current: 'CURRENT', upcoming: 'UPCOMING', locked: 'LOCKED', new: 'NEW' }
  return <span className={joinClasses('ui-status', `ui-status-${status}`, className)}>{label ?? defaultLabels[status]}</span>
}

export function Divider({ className }: { className?: string }) {
  return <div className={joinClasses('ui-divider', className)} role="separator" aria-hidden="true" />
}

export function SectionHeader({ eyebrow, title, description, action, className }: SectionHeaderProps) {
  return <div className={joinClasses('ui-section-header', className)}>
    <div>
      <p className="eyebrow"><span />{eyebrow}</p>
      <h2>{title}</h2>
    </div>
    {description && <p className="ui-section-description">{description}</p>}
    {action && <div className="ui-section-action">{action}</div>}
  </div>
}
