import { getAchievementProgress, getAchievementStates, getUnlockedAchievements, type AchievementDefinition } from '../progression/achievements'
import { Progress } from './ui'

type AchievementProps = {
  completedMissionIds: readonly string[]
  currentXp: number
}

type AchievementsPanelProps = AchievementProps & {
  isExpanded: boolean
  onToggle: () => void
}

function AchievementRow({ achievement }: { achievement: AchievementDefinition & { state: 'unlocked' | 'locked' } }) {
  return <li className={`achievement-row achievement-row-${achievement.state}`}>
    <span className="achievement-glyph" aria-hidden="true">{achievement.state === 'unlocked' ? '●' : '◇'}</span>
    <div>
      <strong>{achievement.title}</strong>
      <p>{achievement.description}</p>
    </div>
    <span className="achievement-status">{achievement.state.toUpperCase()}</span>
  </li>
}

export function AchievementsPanel({ completedMissionIds, currentXp, isExpanded, onToggle }: AchievementsPanelProps) {
  const input = { completedMissionIds, xp: currentXp }
  const progress = getAchievementProgress(input)
  const states = getAchievementStates(input)
  const preview = getUnlockedAchievements(input).slice(0, 3)

  return <section className={`achievements-panel ${isExpanded ? 'achievements-panel-expanded' : ''}`} aria-label="Achievements">
    <div className="achievements-panel-heading">
      <div>
        <p className="eyebrow"><span />ACHIEVEMENTS</p>
        <h2>{progress.unlocked} / {progress.total} <em>unlocked</em></h2>
      </div>
      <span>{progress.percentage}%</span>
    </div>
    <Progress value={progress.unlocked} max={progress.total} />
    {!isExpanded ? <div className="achievement-preview" aria-label="Achievement preview">
      {preview.length ? preview.map((achievement) => <div className="achievement-preview-item" key={achievement.id}><span aria-hidden="true">●</span>{achievement.title}</div>) : <p className="achievement-empty">Your first learning signal will appear here.</p>}
    </div> : <ol className="achievement-list">
      {states.map((achievement) => <AchievementRow achievement={achievement} key={achievement.id} />)}
    </ol>}
    <button className="achievement-toggle" type="button" onClick={onToggle} aria-expanded={isExpanded}>{isExpanded ? 'HIDE ACHIEVEMENTS' : 'VIEW ALL'} <span aria-hidden="true">{isExpanded ? '−' : '→'}</span></button>
  </section>
}

export function AchievementProfileSummary({ completedMissionIds, currentXp }: AchievementProps) {
  const progress = getAchievementProgress({ completedMissionIds, xp: currentXp })
  const preview = getUnlockedAchievements({ completedMissionIds, xp: currentXp }).slice(0, 3)

  return <div className="achievement-profile-summary">
    <div><span>ACHIEVEMENTS</span><strong>{progress.unlocked} / {progress.total}</strong></div>
    {preview.length > 0 && <p>{preview.map((achievement) => achievement.title).join(' · ')}</p>}
  </div>
}
