import { getCurrentRank, getNextRank, getRankProgress, getRankState, getXpToNextRank, rankDefinitions } from '../progression/ranks'
import { Progress } from './ui'

type RankProgressProps = {
  currentXp: number
  className?: string
}

export function RankProgress({ currentXp, className = '' }: RankProgressProps) {
  const safeXp = typeof currentXp === 'number' && Number.isFinite(currentXp) ? Math.max(0, currentXp) : 0
  const currentRank = getCurrentRank(safeXp)
  const nextRank = getNextRank(safeXp)
  const xpToNextRank = getXpToNextRank(safeXp)
  const progress = getRankProgress(safeXp)

  return <section className={`rank-progress ${className}`.trim()} aria-label="Current rank">
    <div className="rank-progress-heading">
      <div>
        <p className="eyebrow"><span />CURRENT RANK</p>
        <h3>{currentRank.name}</h3>
      </div>
      <strong>{safeXp} XP</strong>
    </div>
    <p className="rank-description">{currentRank.description}</p>
    <Progress value={progress} max={100} />
    <div className="rank-progress-footer">
      {nextRank && xpToNextRank !== null ? <>
        <span>{xpToNextRank} XP TO {nextRank.name}</span>
        <span>NEXT · {nextRank.name} · {nextRank.minXp} XP</span>
      </> : <span>CURRENT PATH RANK COMPLETE</span>}
    </div>
  </section>
}

export function RankPath({ currentXp }: { currentXp: number }) {
  return <section className="rank-path" aria-label="CypherSchool ranks">
    <div className="rank-path-heading">
      <p className="eyebrow"><span />CYPHERSCHOOL RANKS</p>
      <span>KNOWLEDGE PROGRESSION</span>
    </div>
    <div className="rank-path-list">
      {rankDefinitions.map((rank) => {
        const state = getRankState(rank, currentXp)
        const stateLabel = state === 'completed' ? 'ATTAINED' : state === 'current' ? 'CURRENT' : `${rank.minXp} XP`
        return <div className={`rank-path-row rank-path-row-${state}`} key={rank.id}>
          <span className="rank-path-number">{String(rank.order).padStart(2, '0')}</span>
          <div><strong>{rank.name}</strong><small>{stateLabel}</small></div>
          <span className="rank-path-state" aria-label={`${rank.name}: ${stateLabel}`}>{state === 'completed' ? '✓' : state === 'current' ? 'CURRENT' : ''}</span>
        </div>
      })}
    </div>
  </section>
}
