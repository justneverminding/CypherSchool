export interface Env {
  DB: D1Database
  ASSETS: Fetcher
}

type Profile = { id: string; alias: string; xp: number; avatar_index: number; created_at: string }

const json = (body: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(body), {
  ...init,
  headers: { 'content-type': 'application/json; charset=UTF-8', ...init.headers },
})

const badRequest = (message: string) => json({ error: message }, { status: 400 })

// The document is the only asset that must always be current. Vite fingerprints
// JavaScript and CSS filenames, so those files can remain safely cached while a
// returning learner receives the newest app shell on their next visit.
function freshDocument(response: Response) {
  const headers = new Headers(response.headers)
  headers.set('Cache-Control', 'no-cache, max-age=0, must-revalidate')
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

function normalizeAlias(value: unknown) {
  if (typeof value !== 'string') return null
  const alias = value.trim().replace(/\s+/g, ' ')
  return /^[a-zA-Z0-9 _-]{3,18}$/.test(alias) ? alias : null
}

function generateCode() {
  const words = ['AMBER', 'CIPHER', 'EMBER', 'FERN', 'MINT', 'NOVA', 'ORBIT', 'PAPER', 'RIVER', 'SIGNAL', 'VAULT', 'WILLOW']
  const bytes = new Uint32Array(3)
  crypto.getRandomValues(bytes)
  const first = words[bytes[0] % words.length]
  let second = words[bytes[1] % words.length]
  if (second === first) second = words[(bytes[1] + 1) % words.length]
  return `${first}-${second}-${String((bytes[2] % 90) + 10)}`
}

function generateToken() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function hash(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function publicProfile(profile: Profile) {
  return { id: profile.id, alias: profile.alias, xp: profile.xp, avatarIndex: profile.avatar_index, createdAt: profile.created_at }
}

async function readBody(request: Request) {
  try { return await request.json<Record<string, unknown>>() } catch { return null }
}

async function authorize(request: Request, env: Env) {
  const profileId = request.headers.get('x-cypherschool-profile')
  const token = request.headers.get('x-cypherschool-session')
  if (!profileId || !token) return null
  return env.DB.prepare('SELECT id, alias, xp, avatar_index, created_at FROM profiles WHERE id = ? AND session_token_hash = ?')
    .bind(profileId, await hash(token)).first<Profile>()
}

async function createProfile(request: Request, env: Env) {
  const body = await readBody(request)
  const alias = normalizeAlias(body?.alias)
  if (!alias) return badRequest('Choose an alias with 3–18 letters, numbers, spaces, hyphens, or underscores.')

  const id = crypto.randomUUID()
  const recoveryCode = generateCode()
  const sessionToken = generateToken()
  const now = new Date().toISOString()
  try {
    await env.DB.prepare(`INSERT INTO profiles (id, alias, recovery_code_hash, session_token_hash, xp, created_at, updated_at)
      VALUES (?, ?, ?, ?, 0, ?, ?)`)
      .bind(id, alias, await hash(recoveryCode), await hash(sessionToken), now, now).run()
  } catch {
    return json({ error: 'That alias is already in use. Try another one.' }, { status: 409 })
  }
  return json({ profile: { id, alias, xp: 0, avatarIndex: 0, createdAt: now }, recoveryCode, sessionToken }, { status: 201 })
}

async function restoreProfile(request: Request, env: Env) {
  const body = await readBody(request)
  const alias = normalizeAlias(body?.alias)
  const recoveryCode = typeof body?.recoveryCode === 'string' ? body.recoveryCode.trim().toUpperCase() : null
  if (!alias || !recoveryCode) return badRequest('Enter both your alias and recovery code.')
  const profile = await env.DB.prepare('SELECT id, alias, xp, avatar_index, created_at FROM profiles WHERE alias = ? AND recovery_code_hash = ?')
    .bind(alias, await hash(recoveryCode)).first<Profile>()
  if (!profile) return json({ error: 'We could not find that learning profile.' }, { status: 404 })
  const sessionToken = generateToken()
  await env.DB.prepare('UPDATE profiles SET session_token_hash = ?, updated_at = ? WHERE id = ?')
    .bind(await hash(sessionToken), new Date().toISOString(), profile.id).run()
  return json({ profile: publicProfile(profile), sessionToken })
}

async function replaceRecoveryCode(request: Request, env: Env) {
  const profile = await authorize(request, env)
  if (!profile) return json({ error: 'Your learning session has expired.' }, { status: 401 })
  const recoveryCode = generateCode()
  await env.DB.prepare('UPDATE profiles SET recovery_code_hash = ?, updated_at = ? WHERE id = ?')
    .bind(await hash(recoveryCode), new Date().toISOString(), profile.id).run()
  return json({ recoveryCode })
}

async function updateAvatar(request: Request, env: Env) {
  const profile = await authorize(request, env)
  const body = await readBody(request)
  const avatarIndex = typeof body?.avatarIndex === 'number' && Number.isInteger(body.avatarIndex) && body.avatarIndex >= 0 && body.avatarIndex < 20 ? body.avatarIndex : null
  if (!profile) return json({ error: 'Your learning session has expired.' }, { status: 401 })
  if (avatarIndex === null) return badRequest('Choose a valid avatar.')
  await env.DB.prepare('UPDATE profiles SET avatar_index = ?, updated_at = ? WHERE id = ?').bind(avatarIndex, new Date().toISOString(), profile.id).run()
  const updated = await env.DB.prepare('SELECT id, alias, xp, avatar_index, created_at FROM profiles WHERE id = ?').bind(profile.id).first<Profile>()
  return json({ profile: updated ? publicProfile(updated) : null })
}

async function getProgress(request: Request, env: Env) {
  const profile = await authorize(request, env)
  if (!profile) return json({ error: 'Your learning session has expired.' }, { status: 401 })
  const { results } = await env.DB.prepare('SELECT lesson_id AS lessonId, completed, score, xp_earned AS xpEarned, updated_at AS updatedAt FROM lesson_progress WHERE profile_id = ?')
    .bind(profile.id).all()
  return json({ profile: publicProfile(profile), lessons: results })
}

async function updateProgress(request: Request, env: Env) {
  const profile = await authorize(request, env)
  if (!profile) return json({ error: 'Your learning session has expired.' }, { status: 401 })
  const body = await readBody(request)
  const lessonId = typeof body?.lessonId === 'string' && /^[a-z0-9-]{1,40}$/i.test(body.lessonId) ? body.lessonId : null
  const completed = body?.completed === true ? 1 : 0
  const score = typeof body?.score === 'number' && Number.isInteger(body.score) && body.score >= 0 && body.score <= 100 ? body.score : null
  const xpEarned = typeof body?.xpEarned === 'number' && Number.isInteger(body.xpEarned) && body.xpEarned >= 0 && body.xpEarned <= 500 ? body.xpEarned : null
  if (!lessonId || xpEarned === null) return badRequest('Invalid lesson progress.')

  const now = new Date().toISOString()
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO lesson_progress (profile_id, lesson_id, completed, score, xp_earned, updated_at) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(profile_id, lesson_id) DO UPDATE SET completed = excluded.completed, score = excluded.score, xp_earned = excluded.xp_earned, updated_at = excluded.updated_at`)
      .bind(profile.id, lessonId, completed, score, xpEarned, now),
    env.DB.prepare('UPDATE profiles SET xp = (SELECT COALESCE(SUM(xp_earned), 0) FROM lesson_progress WHERE profile_id = ?), updated_at = ? WHERE id = ?')
      .bind(profile.id, now, profile.id),
  ])
  const updated = await env.DB.prepare('SELECT id, alias, xp, avatar_index, created_at FROM profiles WHERE id = ?').bind(profile.id).first<Profile>()
  return json({ profile: updated ? publicProfile(updated) : null })
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/api/profiles' && request.method === 'POST') return createProfile(request, env)
    if (url.pathname === '/api/profiles/restore' && request.method === 'POST') return restoreProfile(request, env)
    if (url.pathname === '/api/profiles/recovery' && request.method === 'POST') return replaceRecoveryCode(request, env)
    if (url.pathname === '/api/profiles/avatar' && request.method === 'PUT') return updateAvatar(request, env)
    if (url.pathname === '/api/progress' && request.method === 'GET') return getProgress(request, env)
    if (url.pathname === '/api/progress' && request.method === 'PUT') return updateProgress(request, env)
    const response = await env.ASSETS.fetch(request)
    const acceptsHtml = request.headers.get('accept')?.includes('text/html')
    return acceptsHtml ? freshDocument(response) : response
  },
} satisfies ExportedHandler<Env>
