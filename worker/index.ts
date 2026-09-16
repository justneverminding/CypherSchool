export interface Env {
  DB: D1Database
  ASSETS: Fetcher
}

type Profile = { id: string; alias: string; xp: number; avatar_index: number; created_at: string }
type ActivityEvent = { eventType: 'joined' | 'completed'; publicLabel: string; createdAt: string }
type Certificate = { certificateId: string; issuedAt: string }

const courseLessonIds = ['01-case-for-privacy', '02-what-your-money-reveals', '03-tools-of-privacy', '04-prove-without-revealing', '05-zcash-private-money', '06-arcium-private-computation', '07-stealf'] as const
const certificateAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

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

function completionSharePage(origin: string) {
  const url = `${origin}/course-complete`
  const image = `${origin}/cypherschool-certificate-template.png`
  const title = 'CypherSchool — Financial Privacy Course Complete'
  const description = 'Seven chapters completed. Take your path through financial privacy.'
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${url}"><meta property="og:type" content="website"><meta property="og:site_name" content="CypherSchool"><meta property="og:url" content="${url}"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:image" content="${image}"><meta property="og:image:secure_url" content="${image}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1672"><meta property="og:image:height" content="941"><meta property="og:image:alt" content="CypherSchool Financial Privacy Course Complete — Gold 07 Medal"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${image}"><meta name="twitter:image:alt" content="CypherSchool Financial Privacy Course Complete — Gold 07 Medal"><style>@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700&display=swap');body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0a0c0c;color:#f4f0df;font-family:Manrope,Arial,sans-serif}main{max-width:780px;padding:32px;text-align:center}img{width:100%;border:1px solid #d2a832}a{display:inline-block;margin-top:24px;padding:14px 18px;background:#9dee91;color:#101410;text-decoration:none;font:600 12px 'DM Mono',monospace;letter-spacing:.08em}</style></head><body><main><img src="${image}" alt="CypherSchool Financial Privacy Course Complete Gold 07 Medal"><p>${description}</p><a href="${origin}/">ENTER CYPHERSCHOOL</a></main></body></html>`, { headers: { 'content-type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-cache, max-age=0, must-revalidate' } })
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

function generateCertificateId() {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  const groups = Array.from({ length: 4 }, (_, group) => Array.from(bytes.slice(group * 5, group * 5 + 5), (byte) => certificateAlphabet[byte % certificateAlphabet.length]).join(''))
  return `CS-${groups.join('-')}`
}

function anonymousActivityLabel() {
  const bytes = new Uint32Array(1)
  crypto.getRandomValues(bytes)
  return `anon_${String((bytes[0] % 900) + 100)}`
}

async function recordActivity(env: Env, eventType: ActivityEvent['eventType']) {
  try {
    await env.DB.prepare('INSERT INTO activity_events (id, event_type, public_label, created_at) VALUES (?, ?, ?, ?)')
      .bind(crypto.randomUUID(), eventType, anonymousActivityLabel(), new Date().toISOString()).run()
    await env.DB.prepare('DELETE FROM activity_events WHERE id NOT IN (SELECT id FROM activity_events ORDER BY created_at DESC LIMIT 80)').run()
  } catch {
    // Activity is optional: an unavailable feed must never block learning progress.
  }
}

async function hash(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function certificateIdIsValid(value: string) {
  return /^CS-(?:[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{5}-){3}[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{5}$/.test(value)
}

async function existingCertificate(profileId: string, env: Env): Promise<Certificate | null> {
  const certificate = await env.DB.prepare('SELECT id AS certificateId, issued_at AS issuedAt FROM certificates WHERE profile_id = ?').bind(profileId).first<Certificate>()
  return certificate ?? null
}

async function issueCertificateIfEligible(profileId: string, env: Env): Promise<Certificate | null> {
  const existing = await existingCertificate(profileId, env)
  if (existing) return existing
  const { results } = await env.DB.prepare(`SELECT lesson_id FROM lesson_progress WHERE profile_id = ? AND completed = 1 AND lesson_id IN (${courseLessonIds.map(() => '?').join(', ')})`)
    .bind(profileId, ...courseLessonIds).all<{ lesson_id: string }>()
  if (results.length !== courseLessonIds.length) return null
  const certificateId = generateCertificateId()
  const issuedAt = new Date().toISOString()
  try {
    await env.DB.prepare('INSERT INTO certificates (id, certificate_hash, profile_id, issued_at) VALUES (?, ?, ?, ?)')
      .bind(certificateId, await hash(certificateId), profileId, issuedAt).run()
    return { certificateId, issuedAt }
  } catch {
    return existingCertificate(profileId, env)
  }
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
  await recordActivity(env, 'joined')
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
  const lessonId = typeof body?.lessonId === 'string' && courseLessonIds.includes(body.lessonId as typeof courseLessonIds[number]) ? body.lessonId as typeof courseLessonIds[number] : null
  const completed = body?.completed === true ? 1 : 0
  const score = body?.score === 100 ? 100 : null
  const xpEarned = body?.xpEarned === 100 ? 100 : null
  if (!lessonId || completed !== 1 || score === null || xpEarned === null) return badRequest('Invalid lesson progress.')

  const lessonIndex = courseLessonIds.indexOf(lessonId)
  if (lessonIndex > 0) {
    const previousLessonId = courseLessonIds[lessonIndex - 1]
    const previous = await env.DB.prepare('SELECT completed FROM lesson_progress WHERE profile_id = ? AND lesson_id = ?').bind(profile.id, previousLessonId).first<{ completed: number }>()
    if (!previous?.completed) return badRequest('Complete the previous chapter before continuing.')
  }

  const now = new Date().toISOString()
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO lesson_progress (profile_id, lesson_id, completed, score, xp_earned, updated_at) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(profile_id, lesson_id) DO UPDATE SET completed = excluded.completed, score = excluded.score, xp_earned = excluded.xp_earned, updated_at = excluded.updated_at`)
      .bind(profile.id, lessonId, completed, score, xpEarned, now),
    env.DB.prepare('UPDATE profiles SET xp = (SELECT COALESCE(SUM(xp_earned), 0) FROM lesson_progress WHERE profile_id = ?), updated_at = ? WHERE id = ?')
      .bind(profile.id, now, profile.id),
  ])
  const certificateBeforeCompletion = lessonId === '07-stealf' ? await existingCertificate(profile.id, env) : null
  const certificate = lessonId === '07-stealf' ? await issueCertificateIfEligible(profile.id, env) : null
  if (lessonId === '07-stealf' && certificate && !certificateBeforeCompletion) await recordActivity(env, 'completed')
  const updated = await env.DB.prepare('SELECT id, alias, xp, avatar_index, created_at FROM profiles WHERE id = ?').bind(profile.id).first<Profile>()
  return json({ profile: updated ? publicProfile(updated) : null, certificate })
}

async function getMyCertificate(request: Request, env: Env) {
  const profile = await authorize(request, env)
  if (!profile) return json({ error: 'Your learning session has expired.' }, { status: 401 })
  return json({ certificate: await issueCertificateIfEligible(profile.id, env) })
}

async function verifyCertificate(certificateId: string, env: Env) {
  if (!certificateIdIsValid(certificateId)) return json({ valid: false }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
  const certificate = await env.DB.prepare('SELECT issued_at AS issuedAt FROM certificates WHERE certificate_hash = ?').bind(await hash(certificateId)).first<{ issuedAt: string }>()
  if (!certificate) return json({ valid: false }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
  return json({ valid: true, certificate: { certificateId, issuedAt: certificate.issuedAt, course: 'Financial Privacy Course', medal: 'Gold 07 Medal' } }, { headers: { 'Cache-Control': 'no-store' } })
}

async function certificateVerificationPage(certificateId: string, origin: string, env: Env) {
  const result = await verifyCertificate(certificateId, env)
  const payload = await result.json() as { valid: boolean; certificate?: { issuedAt: string } }
  const valid = payload.valid
  const issued = payload.certificate ? new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date(payload.certificate.issuedAt)) : ''
  const title = valid ? 'Verified CypherSchool Certificate' : 'Certificate not found'
  const body = valid ? `<p class="signal">✓ VERIFIED CERTIFICATE</p><h1>Financial Privacy<br><em>Course Complete.</em></h1><p>Gold 07 Medal · Issued ${issued}</p><code>${certificateId}</code><small>This verification reveals no learner identity or progress data.</small>` : `<p class="signal">CERTIFICATE NOT FOUND</p><h1>We could not verify<br><em>this certificate.</em></h1><p>Check the certificate ID and try again.</p>`
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | CypherSchool</title><meta name="robots" content="noindex, nofollow"><style>@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700&display=swap');body{margin:0;min-height:100vh;display:grid;place-items:center;background:#090b0b;color:#f1f0e9;font-family:Manrope,Arial,sans-serif}main{width:min(88vw,680px);padding:55px;border:1px solid #344039;background:radial-gradient(circle at 80% 0,#1e3621 0,transparent 38%),#0d100e}h1{margin:0 0 24px;font-size:clamp(42px,7vw,75px);line-height:.92;letter-spacing:-.06em}em{font-family:'Instrument Serif',Georgia,serif;font-weight:400;color:#9cf58f}.signal,code,small{font:500 11px/1.6 'DM Mono',monospace;letter-spacing:.08em}.signal{color:#9cf58f}code{display:block;margin:29px 0 18px;padding:14px;border:1px solid #445647;color:#dffadc}small{display:block;color:#8c998f}a{color:#9cf58f}</style></head><body><main>${body}<p><a href="${origin}/">ENTER CYPHERSCHOOL →</a></p></main></body></html>`, { status: valid ? 200 : 404, headers: { 'content-type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-store' } })
}

async function getActivity(env: Env) {
  try {
    const { results } = await env.DB.prepare('SELECT event_type AS eventType, public_label AS publicLabel, created_at AS createdAt FROM activity_events ORDER BY created_at DESC LIMIT 7').all<ActivityEvent>()
    return json({ events: results }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return json({ events: [] }, { headers: { 'Cache-Control': 'no-store' } })
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/course-complete') return completionSharePage(url.origin)
    if (url.pathname === '/api/profiles' && request.method === 'POST') return createProfile(request, env)
    if (url.pathname === '/api/profiles/restore' && request.method === 'POST') return restoreProfile(request, env)
    if (url.pathname === '/api/profiles/recovery' && request.method === 'POST') return replaceRecoveryCode(request, env)
    if (url.pathname === '/api/profiles/avatar' && request.method === 'PUT') return updateAvatar(request, env)
    if (url.pathname === '/api/activity' && request.method === 'GET') return getActivity(env)
    if (url.pathname === '/api/progress' && request.method === 'GET') return getProgress(request, env)
    if (url.pathname === '/api/progress' && request.method === 'PUT') return updateProgress(request, env)
    if (url.pathname === '/api/certificates/me' && request.method === 'GET') return getMyCertificate(request, env)
    if (url.pathname.startsWith('/api/certificates/') && request.method === 'GET') return verifyCertificate(decodeURIComponent(url.pathname.slice('/api/certificates/'.length)).toUpperCase(), env)
    if (url.pathname.startsWith('/verify/')) return certificateVerificationPage(decodeURIComponent(url.pathname.slice('/verify/'.length)).toUpperCase(), url.origin, env)
    const response = await env.ASSETS.fetch(request)
    const acceptsHtml = request.headers.get('accept')?.includes('text/html')
    return acceptsHtml ? freshDocument(response) : response
  },
} satisfies ExportedHandler<Env>
