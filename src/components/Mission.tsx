import type { CourseChapter } from '../course/data'
import type { AchievementDefinition } from '../progression/achievements'
import type { RankDefinition } from '../progression/ranks'
import { Button, Progress, StatusBadge, Surface } from './ui'
import { RankProgress } from './RankProgress'
import { XpProgress } from './XpProgress'

type MissionHeaderProps = {
  mission: CourseChapter
  step: number
  totalSteps: number
  xp: number
  onBack: () => void
}

export function MissionHeader({ mission, step, totalSteps, xp, onBack }: MissionHeaderProps) {
  return <nav className="lesson-nav shell mission-nav" aria-label={`${mission.missionLabel} navigation`}>
    <button className="lesson-back" type="button" onClick={onBack}>← BACK TO PATH</button>
    <div className="mission-nav-context">
      <span>{mission.missionLabel} / 07</span>
      <strong>{mission.title}</strong>
      <small>STEP {step} OF {totalSteps}</small>
    </div>
    <span className="mission-nav-xp">{xp} XP</span>
  </nav>
}

export function MissionIntro({ mission, completed = false }: { mission: CourseChapter; completed?: boolean }) {
  return <section className="mission-intro" aria-label={`${mission.missionLabel} briefing`}>
    <p className="eyebrow"><span />{mission.missionLabel}</p>
    {completed && <p className="mission-review-label">REVIEWING COMPLETED MISSION</p>}
    <h2>{mission.title}</h2>
    <p className="mission-summary">{mission.summary}</p>
    <div className="mission-intro-details">
      <div><span>OBJECTIVE</span><p>{mission.objective}</p></div>
      <div><span>{completed ? 'REWARD CLAIMED' : 'COMPLETION REWARD'}</span><strong>+{mission.xpReward} XP</strong></div>
    </div>
  </section>
}

type MissionCompleteProps = {
  mission: CourseChapter
  completedCount: number
  totalMissions: number
  nextMission: CourseChapter | null
  isCourseComplete: boolean
  profileXp: number
  totalAvailableXp: number
  currentRank: RankDefinition
  rankAdvanced: boolean
  newlyUnlockedAchievements: readonly AchievementDefinition[]
  certificateAvailable: boolean
  onContinue: () => void
  onBackToPath: () => void
  onViewCertificate: () => void
}

export function MissionComplete({
  mission,
  completedCount,
  totalMissions,
  nextMission,
  isCourseComplete,
  profileXp,
  totalAvailableXp,
  currentRank,
  rankAdvanced,
  newlyUnlockedAchievements,
  certificateAvailable,
  onContinue,
  onBackToPath,
  onViewCertificate,
}: MissionCompleteProps) {
  return <main className="lesson-screen mission-complete-screen">
    <MissionHeader mission={mission} step={1} totalSteps={1} xp={profileXp} onBack={onBackToPath} />
    <section className="mission-complete-shell shell">
      <div className="mission-complete-copy">
        <p className="eyebrow"><span />MISSION COMPLETE</p>
        <p className="mission-complete-number">{mission.number}</p>
        <h1>{mission.title}</h1>
        <p className="mission-complete-objective">You completed the mission and confirmed its objective:</p>
        <p className="mission-complete-quote">{mission.objective}</p>
      </div>

      <Surface className="mission-complete-summary" variant="completed">
        {rankAdvanced && <section className="rank-advanced" aria-label={`Rank advanced to ${currentRank.name}`} role="status"><p className="eyebrow"><span />RANK ADVANCED</p><strong>{currentRank.name}</strong><p>{currentRank.description}</p></section>}
        {newlyUnlockedAchievements.length > 0 && <section className="achievement-unlocks" aria-label="Achievements unlocked" role="status"><p className="eyebrow"><span />ACHIEVEMENTS UNLOCKED</p><ul>{newlyUnlockedAchievements.map((achievement) => <li key={achievement.id}><span aria-hidden="true">●</span><div><strong>{achievement.title}</strong><small>{achievement.description}</small></div></li>)}</ul></section>}
        <div className="mission-xp-feedback" aria-label="Mission XP earned"><div><span>XP EARNED</span><strong>+{mission.xpReward} XP</strong></div><div><span>TOTAL XP</span><b>{profileXp} / {totalAvailableXp} XP</b></div></div>
        <XpProgress currentXp={profileXp} totalAvailableXp={totalAvailableXp} supportingText={`${completedCount} missions complete`} />
        <RankProgress currentXp={profileXp} />
        <div className="mission-path-progress"><div><span>PATH PROGRESS</span><b>{completedCount} / {totalMissions} MISSIONS COMPLETE</b></div><Progress value={completedCount} max={totalMissions} /></div>
        {nextMission ? <div className="mission-next-handoff"><p className="eyebrow"><span />NEXT MISSION</p><p className="mission-complete-number">{nextMission.number}</p><h2>{nextMission.title}</h2><p>{nextMission.objective}</p><StatusBadge status="upcoming" label="UP NEXT" /></div> : <div className="mission-next-handoff mission-path-finished"><p className="eyebrow"><span />PATH COMPLETE</p><h2>You completed<br /><em>the full path.</em></h2><p>{isCourseComplete ? `All ${totalMissions} missions are complete. Your certificate is ready when you are.` : 'Your path is ready for review.'}</p></div>}
        <div className="completion-actions mission-complete-actions">
          {nextMission ? <Button className="primary-button" type="button" onClick={onContinue}>CONTINUE TO NEXT MISSION <span>→</span></Button> : certificateAvailable ? <Button className="primary-button" type="button" onClick={onViewCertificate}>VIEW CERTIFICATE <span>↗</span></Button> : null}
          <Button variant="text" type="button" onClick={onBackToPath}>BACK TO PATH <span>↗</span></Button>
        </div>
      </Surface>
    </section>
  </main>
}
