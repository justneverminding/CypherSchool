import type { CSSProperties, ReactNode } from 'react'
import { getChapterState, type ChapterState } from '../course/progress'
import { getCurrentRank } from '../progression/ranks'
import type { CourseChapter } from '../course/data'
import type { CourseCertificate, LearnerProfile } from '../types'
import { Button, Divider, Progress, StatusBadge, Surface } from './ui'
import { AchievementProfileSummary, AchievementsPanel } from './Achievements'
import { RankPath, RankProgress } from './RankProgress'
import { XpProgress } from './XpProgress'
import { ZcashMark } from './ZcashMark'

type LearnerDashboardProps = {
  profile: LearnerProfile
  chapters: readonly CourseChapter[]
  completedChapterIds: readonly string[]
  currentChapter: CourseChapter | null
  nextChapter: CourseChapter | null
  completedChapterCount: number
  progressPercent: number
  currentXp: number
  totalAvailableXp: number
  isCourseComplete: boolean
  isProgressLoaded: boolean
  wordmarkSource: string
  themeToggle: ReactNode
  certificate: CourseCertificate | null
  certificatePreview?: ReactNode
  isProfileOpen: boolean
  isAchievementsOpen: boolean
  isAvatarPickerOpen: boolean
  selectedAvatarStyle: CSSProperties
  replacementRecoveryCode: string | null
  isReplacingRecoveryCode: boolean
  recoveryReplacementError: string
  onHome: () => void
  onLogout: () => void
  onBeginChapter: (chapterId: string) => void
  onReviewPath: () => void
  onToggleProfile: () => void
  onToggleAchievements: () => void
  onToggleAvatarPicker: () => void
  onSelectAvatar: (avatarIndex: number) => void | Promise<void>
  onReplaceRecoveryCode: () => void
  onShareCompletion: () => void
  onSaveCompletionCard: () => void
  onOpenCertificate: () => void
}

function statusLabel(state: ChapterState, isNextUp: boolean) {
  if (state === 'complete') return 'COMPLETE'
  if (state === 'current') return 'CURRENT'
  return isNextUp ? 'UP NEXT' : 'UPCOMING'
}

function statusClass(state: ChapterState) {
  return state === 'upcoming' ? 'upcoming' : state
}

export function LearnerDashboard({
  profile,
  chapters,
  completedChapterIds,
  currentChapter,
  nextChapter,
  completedChapterCount,
  progressPercent,
  currentXp,
  totalAvailableXp,
  isCourseComplete,
  isProgressLoaded,
  wordmarkSource,
  themeToggle,
  certificate,
  certificatePreview,
  isProfileOpen,
  isAchievementsOpen,
  isAvatarPickerOpen,
  selectedAvatarStyle,
  replacementRecoveryCode,
  isReplacingRecoveryCode,
  recoveryReplacementError,
  onHome,
  onLogout,
  onBeginChapter,
  onReviewPath,
  onToggleProfile,
  onToggleAchievements,
  onToggleAvatarPicker,
  onSelectAvatar,
  onReplaceRecoveryCode,
  onShareCompletion,
  onSaveCompletionCard,
  onOpenCertificate,
}: LearnerDashboardProps) {
  const missionsRemaining = chapters.length - completedChapterCount
  const currentIsFirstMission = completedChapterCount === 0
  const currentActionLabel = currentIsFirstMission ? 'BEGIN MISSION' : 'CONTINUE MISSION'
  const currentRank = getCurrentRank(currentXp)

  return <main className="dashboard-screen">
    <nav className="nav shell" aria-label="Dashboard navigation">
      <button className="wordmark nav-button" type="button" onClick={onHome} aria-label="Return to CypherSchool home">
        <img className="wordmark-mark" src={wordmarkSource} alt="" /><span>CYPHERSCHOOL</span>
      </button>
      <span className="nav-note">YOUR PRIVACY JOURNEY</span>
      <button className="nav-link nav-button" type="button" onClick={onLogout}>LOG OUT <span aria-hidden="true">↗</span></button>
    </nav>
    {themeToggle}

    <section className="dashboard-shell shell">
      <header className="dashboard-welcome">
        <p className="eyebrow"><span />YOUR LEARNING SPACE</p>
        <h1>Welcome back,<br /><em>{profile.alias}.</em></h1>
        <p>Continue your privacy path one clear idea at a time.</p>
      </header>

      <div className="dashboard-layout">
        <div className="dashboard-main-column">
          {!isCourseComplete ? <Surface className="dashboard-continue-card" variant="selected" aria-label="Continue mission">
            <div className="dashboard-continue-copy">
              <p className="eyebrow"><span />{currentIsFirstMission ? 'FIRST MISSION' : 'CURRENT MISSION'}</p>
              {currentChapter ? <>
                <p className="dashboard-chapter-number">{currentChapter.number}</p>
                <h2>{currentChapter.title}</h2>
                <div className="dashboard-mission-details"><span>OBJECTIVE</span><p>{currentChapter.objective}</p><span>COMPLETION REWARD</span><strong>+{currentChapter.xpReward} XP</strong></div>
              </> : <p className="dashboard-loading-copy">Loading your learning path…</p>}
            </div>
            <Button className="primary-button dashboard-continue-button" type="button" disabled={!currentChapter || !isProgressLoaded} onClick={() => currentChapter && onBeginChapter(currentChapter.id)}>
              {isProgressLoaded ? currentActionLabel : 'LOADING YOUR PATH…'} <span aria-hidden="true">→</span>
            </Button>
          </Surface> : <Surface className="dashboard-complete-state" variant="completed" aria-label="Course complete">
            <p className="eyebrow"><span />CURRENT PATH COMPLETE</p>
            <h2>You completed the<br /><em>CypherSchool foundation.</em></h2>
            <p>Seven missions, one clearer view of financial privacy. Review the path or open your completion certificate.</p>
            <div className="completion-actions">
              <Button className="primary-button" type="button" onClick={onReviewPath}>REVIEW LEARNING PATH <span>→</span></Button>
              {certificate && <Button variant="text" type="button" onClick={onOpenCertificate}>VIEW CERTIFICATE <span>↗</span></Button>}
            </div>
          </Surface>}

          <Surface className="dashboard-progress-card" aria-label="Learning progress">
            <div className="dashboard-panel-heading"><div><p className="eyebrow"><span />PATH PROGRESS</p><strong>{progressPercent}%</strong></div><span>{completedChapterCount} of {chapters.length} missions complete</span></div>
            <Progress value={progressPercent} max={100} />
            <div className="dashboard-xp-section"><XpProgress currentXp={currentXp} totalAvailableXp={totalAvailableXp} supportingText={`${completedChapterCount} missions complete`} /><RankProgress currentXp={currentXp} /></div>
          </Surface>

          <section className="dashboard-path" id="dashboard-path" aria-label="Your mission path">
            <div className="dashboard-path-heading"><div><p className="eyebrow"><span />YOUR MISSION PATH</p><h2>Seven missions.<br /><em>One clearer view.</em></h2></div><span>{completedChapterCount} / {chapters.length} COMPLETE</span></div>
            <Divider className="dashboard-divider" />
            <div className="dashboard-path-list">
              {chapters.map((chapter) => {
                const state = getChapterState(chapter, chapters, completedChapterIds)
                const isNextUp = nextChapter?.id === chapter.id
                const canOpen = state !== 'upcoming' && isProgressLoaded
                return <button className={`dashboard-path-row dashboard-path-row-${state} ${chapter.id === '07-stealf' ? 'dashboard-path-row-final-lab' : ''}`} type="button" key={chapter.id} disabled={!canOpen} onClick={() => canOpen && onBeginChapter(chapter.id)}>
                  <b>{chapter.number}</b>
                  <span className="dashboard-path-title"><strong>{chapter.title}</strong>{chapter.id === '07-stealf' && <small>FINAL LAB · PRACTICAL APPLICATION</small>}</span>
                  <StatusBadge status={statusClass(state)} label={statusLabel(state, isNextUp)} />
                  <i aria-hidden="true">{canOpen ? '›' : '·'}</i>
                </button>
              })}
            </div>
          </section>

          <Surface className="dashboard-achievements-card" aria-label="Achievements">
            <AchievementsPanel completedMissionIds={completedChapterIds} currentXp={currentXp} isExpanded={isAchievementsOpen} onToggle={onToggleAchievements} />
          </Surface>

          {isCourseComplete && <Surface className="course-complete-card dashboard-certificate-card" variant="completed" aria-label="Course complete certificate">
            {certificatePreview ?? <img src="/cypherschool-course-complete.png" alt="CypherSchool Financial Privacy Course complete Gold 07 medal" />}
            <div><p className="eyebrow"><span />COURSE COMPLETE</p><h2>Your certificate<br /><em>is ready.</em></h2><p>Keep your completion record and share a private verification link when you choose.</p><div className="completion-actions"><Button className="primary-button" type="button" onClick={onOpenCertificate}>VIEW CERTIFICATE <span>↗</span></Button><Button variant="text" type="button" onClick={onShareCompletion}>SHARE ON X <span>↗</span></Button><button className="path-home-button save-card-button" type="button" onClick={onSaveCompletionCard} disabled={!certificate}>DOWNLOAD CERTIFICATE</button></div></div>
          </Surface>}
        </div>

        <aside className="dashboard-side-column">
          {nextChapter && <Surface className="dashboard-next-card" variant="default" aria-label="Next mission">
            <p className="eyebrow"><span />NEXT MISSION</p>
            <p className="dashboard-chapter-number">{nextChapter.number}</p>
            <h2>{nextChapter.title}</h2>
            <p>{nextChapter.objective}</p>
            <StatusBadge status="upcoming" label="AFTER YOUR CURRENT MISSION" />
          </Surface>}

          <Surface className="dashboard-profile-card" variant="default" aria-label="Profile and recovery">
            <button className="dashboard-profile-toggle" type="button" onClick={onToggleProfile} aria-expanded={isProfileOpen} aria-controls="dashboard-profile-details">
              <span className="selected-avatar" style={selectedAvatarStyle} /><span><small>LEARNING AS</small><strong>{profile.alias}</strong><em>{currentRank.name}</em></span><i aria-hidden="true">{isProfileOpen ? '−' : '+'}</i>
            </button>
            {isProfileOpen && <div className="dashboard-profile-details" id="dashboard-profile-details">
              <div className="profile-stats"><div><b>{currentRank.name}</b><span>CURRENT RANK</span></div><div><b>{currentXp}</b><span>LEARNING XP</span></div><div><b>{missionsRemaining}</b><span>MISSIONS LEFT</span></div></div>
              <RankPath currentXp={currentXp} />
              <AchievementProfileSummary completedMissionIds={completedChapterIds} currentXp={currentXp} />
              <div className="medal-header"><span>MISSION MEDALS</span><span>{completedChapterCount} / {chapters.length}</span></div>
              <div className="medal-grid">{chapters.map((chapter) => { const earned = completedChapterIds.includes(chapter.id); return <div className={earned ? 'medal earned' : 'medal'} key={chapter.number}><span>{earned ? '✦' : chapter.number}</span><small>{earned ? 'EARNED' : 'LOCKED'}</small></div> })}</div>
              <div className="avatar-picker"><p>YOUR COLLECTIBLE PFP</p><button className="avatar-current" type="button" onClick={onToggleAvatarPicker} aria-expanded={isAvatarPickerOpen} style={selectedAvatarStyle} />{isAvatarPickerOpen && <div className="avatar-options">{Array.from({ length: 20 }, (_, avatarIndex) => <button type="button" aria-label={`Choose avatar ${avatarIndex + 1}`} className={(profile.avatarIndex ?? 0) === avatarIndex ? 'selected' : ''} key={avatarIndex} onClick={() => onSelectAvatar(avatarIndex)} style={{ backgroundImage: 'url(/cypherschool-pfps.png)', backgroundSize: '500% 400%', backgroundPosition: `${(avatarIndex % 5) * 25}% ${Math.floor(avatarIndex / 5) * 33.333}%` }} />)}</div>}</div>
              {isCourseComplete && <div className="gold-medal"><span>✦</span><div><b>GOLD COURSE MEDAL</b><small>ALL 7 MISSIONS COMPLETE</small></div></div>}
              <div className="recovery-replace"><p>RECOVERY CODE</p>{replacementRecoveryCode ? <><strong>{replacementRecoveryCode}</strong><small>Save this new code now. Your previous recovery code no longer works.</small></> : <><small>Need a replacement? Generate a new code for restoring this profile on another device.</small><button type="button" onClick={onReplaceRecoveryCode} disabled={isReplacingRecoveryCode}>{isReplacingRecoveryCode ? 'GENERATING…' : 'GENERATE NEW CODE'}</button></>}{recoveryReplacementError && <span className="alias-error">{recoveryReplacementError}</span>}</div>
              <button className="logout-button" type="button" onClick={onLogout}>LOG OUT OF THIS DEVICE <span aria-hidden="true">↗</span></button>
            </div>}
          </Surface>
        </aside>
      </div>
    </section>
  </main>
}
