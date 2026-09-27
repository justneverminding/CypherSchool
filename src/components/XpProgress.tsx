import { getCurrentXp, getXpPercent } from '../course/progress'
import { Progress } from './ui'

type XpProgressProps = {
  currentXp: number
  totalAvailableXp: number
  supportingText: string
  className?: string
}

export function XpProgress({ currentXp, totalAvailableXp, supportingText, className = '' }: XpProgressProps) {
  const safeCurrentXp = getCurrentXp(currentXp)
  const percentage = getXpPercent(safeCurrentXp, totalAvailableXp)
  const isPathComplete = safeCurrentXp >= totalAvailableXp && totalAvailableXp > 0

  return <section className={`xp-progress ${className}`.trim()} aria-label="Learning XP">
    <div className="xp-progress-heading">
      <div>
        <p className="eyebrow"><span />LEARNING XP</p>
        <strong>{safeCurrentXp} / {totalAvailableXp} XP</strong>
      </div>
      <span className="xp-progress-percent">{percentage}%</span>
    </div>
    <Progress value={safeCurrentXp} max={totalAvailableXp} />
    <div className="xp-progress-footer">
      <span>{isPathComplete ? 'CURRENT PATH XP COMPLETE' : supportingText}</span>
      <span>{totalAvailableXp} AVAILABLE</span>
    </div>
  </section>
}
