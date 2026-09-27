export type RankDefinition = {
  id: string
  name: string
  minXp: number
  order: number
  description: string
}

export type RankState = 'completed' | 'current' | 'upcoming'

export const rankDefinitions: readonly RankDefinition[] = [
  { id: 'initiate', name: 'INITIATE', minXp: 0, order: 1, description: 'Beginning the study of privacy and digital autonomy.' },
  { id: 'operator', name: 'OPERATOR', minXp: 100, order: 2, description: 'Building practical understanding of privacy systems.' },
  { id: 'cypherpunk', name: 'CYPHERPUNK', minXp: 300, order: 3, description: 'Understanding privacy as both technology and individual agency.' },
  { id: 'cryptographer', name: 'CRYPTOGRAPHER', minXp: 500, order: 4, description: 'Developing deeper understanding of cryptographic privacy tools.' },
  { id: 'privacy-researcher', name: 'PRIVACY RESEARCHER', minXp: 600, order: 5, description: 'Connecting privacy technologies, tradeoffs, and real-world applications.' },
  { id: 'privacy-guardian', name: 'PRIVACY GUARDIAN', minXp: 700, order: 6, description: 'Completed the current CypherSchool privacy foundation.' },
]

function normalizeXp(xp: number | null | undefined) {
  if (typeof xp !== 'number' || !Number.isFinite(xp)) return 0
  return Math.max(0, xp)
}

export function getCurrentRank(xp: number | null | undefined) {
  const safeXp = normalizeXp(xp)
  return [...rankDefinitions].reverse().find((rank) => rank.minXp <= safeXp) ?? rankDefinitions[0]
}

export function getNextRank(xp: number | null | undefined) {
  const currentRank = getCurrentRank(xp)
  return rankDefinitions.find((rank) => rank.order === currentRank.order + 1) ?? null
}

export function getXpToNextRank(xp: number | null | undefined) {
  const nextRank = getNextRank(xp)
  if (!nextRank) return null
  return Math.max(0, nextRank.minXp - normalizeXp(xp))
}

export function getRankProgress(xp: number | null | undefined) {
  const safeXp = normalizeXp(xp)
  const currentRank = getCurrentRank(safeXp)
  const nextRank = getNextRank(safeXp)
  if (!nextRank) return 100

  const range = nextRank.minXp - currentRank.minXp
  if (range <= 0) return 0
  return Math.min(100, Math.max(0, Math.round(((safeXp - currentRank.minXp) / range) * 100)))
}

export function getRankState(rank: RankDefinition, xp: number | null | undefined): RankState {
  const currentRank = getCurrentRank(xp)
  if (rank.order < currentRank.order) return 'completed'
  if (rank.id === currentRank.id) return 'current'
  return 'upcoming'
}
