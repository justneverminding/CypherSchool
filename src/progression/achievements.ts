import { courseChapterIds } from '../course/data'
import { getCurrentRank } from './ranks'

export type AchievementDefinition = {
  id: string
  title: string
  description: string
  order: number
  category: 'FOUNDATION' | 'PRIVACY' | 'CRYPTOGRAPHY' | 'COMPLETION'
  requirement: AchievementRequirement
}

type AchievementRequirement =
  | { type: 'any-mission' }
  | { type: 'mission'; missionId: string }
  | { type: 'all-missions' }
  | { type: 'rank'; rankId: string }

export type AchievementState = 'unlocked' | 'locked'

export type AchievementInput = {
  completedMissionIds: readonly string[]
  xp: number | null | undefined
}

export const achievementDefinitions: readonly AchievementDefinition[] = [
  { id: 'first-signal', title: 'FIRST SIGNAL', description: 'Completed your first CypherSchool mission.', order: 1, category: 'FOUNDATION', requirement: { type: 'any-mission' } },
  { id: 'privacy-foundations', title: 'PRIVACY FOUNDATIONS', description: 'Completed The Case for Privacy.', order: 2, category: 'FOUNDATION', requirement: { type: 'mission', missionId: '01-case-for-privacy' } },
  { id: 'metadata-aware', title: 'METADATA AWARE', description: 'Learned what public financial activity can reveal.', order: 3, category: 'PRIVACY', requirement: { type: 'mission', missionId: '02-what-your-money-reveals' } },
  { id: 'toolkit-unlocked', title: 'TOOLKIT UNLOCKED', description: 'Completed The Tools of Privacy.', order: 4, category: 'CRYPTOGRAPHY', requirement: { type: 'mission', missionId: '03-tools-of-privacy' } },
  { id: 'first-proof', title: 'FIRST PROOF', description: 'Completed the zero-knowledge proof mission.', order: 5, category: 'CRYPTOGRAPHY', requirement: { type: 'mission', missionId: '04-prove-without-revealing' } },
  { id: 'shielded', title: 'SHIELDED', description: 'Completed Zcash & Private Money.', order: 6, category: 'PRIVACY', requirement: { type: 'mission', missionId: '05-zcash-private-money' } },
  { id: 'private-computation', title: 'PRIVATE COMPUTATION', description: 'Completed Arcium & Private Computation.', order: 7, category: 'CRYPTOGRAPHY', requirement: { type: 'mission', missionId: '06-arcium-private-computation' } },
  { id: 'intentional-privacy', title: 'INTENTIONAL PRIVACY', description: 'Completed Stealf and applied privacy ideas to real-world choices.', order: 8, category: 'PRIVACY', requirement: { type: 'mission', missionId: '07-stealf' } },
  { id: 'path-complete', title: 'PATH COMPLETE', description: 'Completed the current CypherSchool privacy learning path.', order: 9, category: 'COMPLETION', requirement: { type: 'all-missions' } },
  { id: 'privacy-guardian', title: 'PRIVACY GUARDIAN', description: 'Reached the highest rank in the current learning path.', order: 10, category: 'COMPLETION', requirement: { type: 'rank', rankId: 'privacy-guardian' } },
]

function isUnlocked(definition: AchievementDefinition, input: AchievementInput) {
  const completed = new Set(input.completedMissionIds)
  switch (definition.requirement.type) {
    case 'any-mission':
      return completed.size > 0
    case 'mission':
      return completed.has(definition.requirement.missionId)
    case 'all-missions':
      return courseChapterIds.every((missionId) => completed.has(missionId))
    case 'rank':
      return getCurrentRank(input.xp).id === definition.requirement.rankId
  }
}

export function getUnlockedAchievements(input: AchievementInput) {
  return achievementDefinitions.filter((definition) => isUnlocked(definition, input))
}

export function getAchievementStates(input: AchievementInput) {
  return achievementDefinitions.map((definition) => ({
    ...definition,
    state: isUnlocked(definition, input) ? 'unlocked' as const : 'locked' as const,
  }))
}

export function getAchievementProgress(input: AchievementInput) {
  const unlocked = getUnlockedAchievements(input).length
  const total = achievementDefinitions.length
  return { unlocked, total, percentage: total ? Math.round((unlocked / total) * 100) : 0 }
}

export function getNewlyUnlockedAchievements(previous: AchievementInput, current: AchievementInput) {
  const previousIds = new Set(getUnlockedAchievements(previous).map((achievement) => achievement.id))
  return getUnlockedAchievements(current).filter((achievement) => !previousIds.has(achievement.id))
}
