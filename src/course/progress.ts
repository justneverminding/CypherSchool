import type { CourseChapter } from './data'

export type ChapterState = 'complete' | 'current' | 'upcoming'

function completedSet(completedChapterIds: readonly string[]) {
  return new Set(completedChapterIds)
}

export function getCompletedChapterCount(chapters: readonly CourseChapter[], completedChapterIds: readonly string[]) {
  const completed = completedSet(completedChapterIds)
  return chapters.filter((chapter) => completed.has(chapter.id)).length
}

export function getOverallProgressPercent(chapters: readonly CourseChapter[], completedChapterIds: readonly string[]) {
  if (!chapters.length) return 0
  return Math.round((getCompletedChapterCount(chapters, completedChapterIds) / chapters.length) * 100)
}

export function getCurrentChapter(chapters: readonly CourseChapter[], completedChapterIds: readonly string[]) {
  const completed = completedSet(completedChapterIds)
  return chapters.find((chapter) => !completed.has(chapter.id)) ?? null
}

export function getNextChapter(chapters: readonly CourseChapter[], completedChapterIds: readonly string[]) {
  const current = getCurrentChapter(chapters, completedChapterIds)
  if (!current) return null
  return chapters.find((chapter) => chapter.order === current.order + 1) ?? null
}

export function getChapterState(chapter: CourseChapter, chapters: readonly CourseChapter[], completedChapterIds: readonly string[]): ChapterState {
  const completed = completedSet(completedChapterIds)
  if (completed.has(chapter.id)) return 'complete'
  return getCurrentChapter(chapters, completedChapterIds)?.id === chapter.id ? 'current' : 'upcoming'
}

export function isCourseComplete(chapters: readonly CourseChapter[], completedChapterIds: readonly string[]) {
  return getCompletedChapterCount(chapters, completedChapterIds) === chapters.length && chapters.length > 0
}

/** The server-backed profile value, normalized only for presentation. */
export function getCurrentXp(profileXp: number | null | undefined) {
  if (typeof profileXp !== 'number' || !Number.isFinite(profileXp)) return 0
  return Math.max(0, profileXp)
}

/** The XP currently available across the supplied mission path. */
export function getTotalAvailableXp(chapters: readonly CourseChapter[]) {
  return chapters.reduce((total, chapter) => total + Math.max(0, chapter.xpReward), 0)
}

/** A clamped display percentage; this never changes the stored profile XP. */
export function getXpPercent(currentXp: number, totalAvailableXp: number) {
  if (totalAvailableXp <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((currentXp / totalAvailableXp) * 100)))
}

/** Expected XP represented by completed missions, derived from mission metadata only. */
export function getCompletedMissionXp(chapters: readonly CourseChapter[], completedChapterIds: readonly string[]) {
  const completed = completedSet(completedChapterIds)
  return chapters.reduce((total, chapter) => completed.has(chapter.id) ? total + Math.max(0, chapter.xpReward) : total, 0)
}
