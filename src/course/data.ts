export type CourseChapter = {
  id: string
  number: string
  title: string
  summary: string
  objective: string
  missionLabel: string
  xpReward: number
  order: number
  mark: string
  status: 'ready' | 'locked'
}

export const MISSION_XP_REWARD = 100

export const courseChapters: CourseChapter[] = [
  { id: '01-case-for-privacy', number: '01', missionLabel: 'MISSION 01', title: 'The Case for Privacy', summary: 'Why privacy matters.', objective: 'Understand why financial privacy matters and what agency it protects.', xpReward: MISSION_XP_REWARD, order: 1, status: 'ready', mark: '◌' },
  { id: '02-what-your-money-reveals', number: '02', missionLabel: 'MISSION 02', title: 'What Your Money Reveals', summary: 'What leaks without it.', objective: 'Recognize what public payment patterns can reveal about a person’s routine.', xpReward: MISSION_XP_REWARD, order: 2, status: 'locked', mark: '↗' },
  { id: '03-tools-of-privacy', number: '03', missionLabel: 'MISSION 03', title: 'The Tools of Privacy', summary: 'Cryptographic foundations.', objective: 'Understand the core tools used to protect private information.', xpReward: MISSION_XP_REWARD, order: 3, status: 'locked', mark: '✦' },
  { id: '04-prove-without-revealing', number: '04', missionLabel: 'MISSION 04', title: 'Prove Without Revealing', summary: 'Zero knowledge.', objective: 'Understand how zero-knowledge proofs verify facts without revealing secrets.', xpReward: MISSION_XP_REWARD, order: 4, status: 'locked', mark: '◇' },
  { id: '05-zcash-private-money', number: '05', missionLabel: 'MISSION 05', title: 'Zcash & Private Money', summary: 'Private money with Zcash.', objective: 'Understand how shielded Zcash payments protect transaction details.', xpReward: MISSION_XP_REWARD, order: 5, status: 'locked', mark: '₿' },
  { id: '06-arcium-private-computation', number: '06', missionLabel: 'MISSION 06', title: 'Arcium & Private Computation', summary: 'Private computation with Arcium.', objective: 'Understand how MPC enables computation without exposing complete inputs.', xpReward: MISSION_XP_REWARD, order: 6, status: 'locked', mark: '⌁' },
  { id: '07-stealf', number: '07', missionLabel: 'MISSION 07', title: 'Stealf', summary: 'Stealf as the practical application.', objective: 'Apply privacy ideas through intentional public and private financial choices.', xpReward: MISSION_XP_REWARD, order: 7, status: 'locked', mark: 'S' },
]

export const courseChapterIds = courseChapters.map((chapter) => chapter.id)
