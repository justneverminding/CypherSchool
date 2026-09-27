export type LearnerProfile = {
  id: string
  alias: string
  xp: number
  avatarIndex?: number
  createdAt: string
  sessionToken: string
}

export type CourseCertificate = {
  certificateId: string
  issuedAt: string
}
