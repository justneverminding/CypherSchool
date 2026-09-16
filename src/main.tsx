import { FormEvent, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import QRCode from 'qrcode'
import './styles.css'

type Lesson = {
  id: string
  number: string
  title: string
  description: string
  status: 'ready' | 'locked'
  mark: string
}

type LearnerProfile = {
  id: string
  alias: string
  xp: number
  avatarIndex?: number
  createdAt: string
  sessionToken: string
}

type AnonymousActivity = {
  eventType: 'joined' | 'completed'
  publicLabel: string
  createdAt: string
}

type CourseCertificate = {
  certificateId: string
  issuedAt: string
}

const profileStorageKey = 'cypherschool.profile'
const builtLessonIds = ['01-case-for-privacy', '02-what-your-money-reveals', '03-tools-of-privacy', '04-prove-without-revealing', '05-zcash-private-money', '06-arcium-private-computation', '07-stealf']

function activityTime(createdAt: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000))
  if (seconds < 60) return 'JUST NOW'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}M AGO`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}H AGO`
  return 'EARLIER'
}

const lessons: Lesson[] = [
  {
    id: '01-case-for-privacy',
    number: '01',
    title: 'The Case for Privacy',
    description: 'Why privacy matters.',
    status: 'ready',
    mark: '◌',
  },
  {
    id: '02-what-your-money-reveals',
    number: '02',
    title: 'What Your Money Reveals',
    description: 'What leaks without it.',
    status: 'locked',
    mark: '↗',
  },
  {
    id: '03-tools-of-privacy',
    number: '03',
    title: 'The Tools of Privacy',
    description: 'Cryptographic foundations.',
    status: 'locked',
    mark: '✦',
  },
  {
    id: '04-prove-without-revealing',
    number: '04',
    title: 'Prove Without Revealing',
    description: 'Zero knowledge.',
    status: 'locked',
    mark: '◇',
  },
  {
    id: '05-zcash-private-money',
    number: '05',
    title: 'Zcash & Private Money',
    description: 'Private money with Zcash.',
    status: 'locked',
    mark: '₿',
  },
  {
    id: '06-arcium-private-computation',
    number: '06',
    title: 'Arcium & Private Computation',
    description: 'Private computation with Arcium.',
    status: 'locked',
    mark: '⌁',
  },
  {
    id: '07-stealf',
    number: '07',
    title: 'Stealf',
    description: 'Stealf as the practical application.',
    status: 'locked',
    mark: 'S',
  },
]

function ZcashMark() {
  return <svg className="zcash-mark" viewBox="0 0 44 44" aria-label="Zcash">
    <circle cx="22" cy="22" r="18" />
    <path d="M14 14h16L14 30h16" />
  </svg>
}

function CertificateVerificationFallback({ certificateId }: { certificateId: string }) {
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading')
  const [issuedAt, setIssuedAt] = useState('')

  useEffect(() => {
    let isCurrent = true
    fetch(`/api/certificates/${encodeURIComponent(certificateId)}`)
      .then(async (response) => response.ok ? response.json() as Promise<{ valid?: boolean; certificate?: { issuedAt?: string } }> : { valid: false })
      .then((result) => {
        if (!isCurrent) return
        setIssuedAt(('certificate' in result ? result.certificate?.issuedAt : '') ?? '')
        setStatus(result.valid ? 'valid' : 'invalid')
      })
      .catch(() => { if (isCurrent) setStatus('invalid') })
    return () => { isCurrent = false }
  }, [certificateId])

  const issued = issuedAt ? new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date(issuedAt)) : ''
  return <main className="verify-fallback"><section>
    {status === 'loading' ? <><p className="eyebrow"><span />VERIFYING CERTIFICATE</p><h1>Checking your<br /><em>credential.</em></h1></> : status === 'valid' ? <><p className="eyebrow"><span />✓ VERIFIED CERTIFICATE</p><h1>Financial Privacy<br /><em>Course Complete.</em></h1><p>Gold 07 Medal · Issued {issued}</p><code>{certificateId}</code><small>This verification reveals no learner identity or progress data.</small></> : <><p className="eyebrow"><span />CERTIFICATE NOT FOUND</p><h1>We could not verify<br /><em>this certificate.</em></h1><p>Check the Certificate ID and try again.</p></>}
    <a href="/">ENTER CYPHERSCHOOL →</a>
  </section></main>
}

function CertificateTemplate({ certificate, compact = false }: { certificate: CourseCertificate; compact?: boolean }) {
  const [qrSource, setQrSource] = useState('')
  const verificationUrl = `${window.location.origin}/verify/${certificate.certificateId}`

  useEffect(() => {
    QRCode.toDataURL(verificationUrl, { width: 240, margin: 0, color: { dark: '#F1F0E9', light: '#0B0D0C' } })
      .then(setQrSource)
      .catch(() => setQrSource(''))
  }, [verificationUrl])

  return <figure className={compact ? 'certificate-template certificate-template-compact' : 'certificate-template'}>
    <img src="/cypherschool-certificate-template.png" alt="CypherSchool Financial Privacy Course completion certificate" />
    <figcaption className="certificate-template-verification">
      <span>CERTIFICATE ID</span>
      <code>{certificate.certificateId}</code>
      <small>VERIFY AT CYPHERSCHOOL.ONLINE/VERIFY</small>
    </figcaption>
    {qrSource && <img className="certificate-template-qr" src={qrSource} alt={`QR code to verify ${certificate.certificateId}`} />}
  </figure>
}

type LegalPageName = 'terms' | 'privacy' | 'privacy-settings'
type InfoPageName = 'faq' | 'blog'
const donationAddress = 'u1fjhk803p7p38ge2r463ne62vymmduatv6yz42qr8f65pch8xff5ls7gczqc2lwds53a44jg55q0ktdwg2puqcyqfnf2hx75nu7zm5e7xegeg5uj088kszzavv3ajqqrjvclg0wjyl0wgzz5my84urq9584amu6s77w5e06x42uhetvvv'
const donationMemo = 'CypherSchool'
const donationUri = `zcash:${donationAddress}?memo=Q3lwaGVyU2Nob29s&message=Support%20CypherSchool&label=CypherSchool`

function DonatePage({ theme, setTheme }: { theme: 'dark' | 'light'; setTheme: (theme: 'dark' | 'light') => void }) {
  const [qrSource, setQrSource] = useState('')
  const [copyStatus, setCopyStatus] = useState('COPY ADDRESS')

  useEffect(() => {
    QRCode.toDataURL(donationUri, { width: 960, margin: 2, errorCorrectionLevel: 'H', color: { dark: '#101410', light: '#FFFFFF' } })
      .then(setQrSource)
      .catch(() => setQrSource(''))
  }, [])

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(donationAddress)
      setCopyStatus('ADDRESS COPIED')
    } catch {
      setCopyStatus('COPY UNAVAILABLE')
    }
  }

  return <main className="donate-screen">
    <nav className="nav shell" aria-label="Donation navigation"><a className="wordmark" href="/"><img className="wordmark-mark" src={theme === 'light' ? '/cypherschool-c-mark-light.png' : '/cypherschool-c-mark-dark.png'} alt="" /><span>CYPHERSCHOOL</span></a><a className="nav-link" href="/">RETURN TO SCHOOL <span aria-hidden="true">↗</span></a></nav>
    <button className="theme-toggle" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}><span aria-hidden="true">{theme === 'dark' ? '☼' : '◐'}</span>{theme === 'dark' ? 'LIGHT' : 'DARK'}</button>
    <section className="donate-shell shell">
      <div className="donate-copy"><p className="eyebrow"><span />KEEP PRIVACY EDUCATION FREE</p><h1>Support the<br /><em>school.</em></h1><p className="donate-intro">If CypherSchool has helped you see financial privacy more clearly, you can support its continued building with a private Zcash donation.</p><a className="guardian-credit" href="https://x.com/dguardian0" target="_blank" rel="noreferrer"><img className="guardian-mark" src="/guardian-pfp.png" alt="Guardian" /><span><small>BUILT BY</small><strong>Guardian <i>↗</i></strong></span></a></div>
      <section className="donate-card" aria-label="Donate Zcash privately"><p className="eyebrow"><span />ZCASH · SHIELDED DONATION</p><div className="donation-qr">{qrSource ? <img src={qrSource} alt="QR code for a shielded Zcash donation to CypherSchool" /> : <div className="qr-loading">PREPARING QR…</div>}<span className="qr-mark"><img src="/cypherschool-c-mark-light.png" alt="" /></span></div><p className="donation-memo">MEMO <b>{donationMemo}</b></p><p className="donation-address">{donationAddress}</p><div className="donation-actions"><button type="button" onClick={copyAddress}>{copyStatus}</button><a href={donationUri}>OPEN IN WALLET <span>↗</span></a></div><p className="donation-note">Use a wallet that supports shielded Zcash payments. The memo is included in the payment request for compatible wallets.</p></section>
    </section>
    <footer className="footer shell"><span>© 2026 CYPHERSCHOOL</span><span>PRIVACY IS THE POWER.</span><a href="/">RETURN TO SCHOOL ↑</a></footer>
  </main>
}

function InfoPage({ page, theme, setTheme }: { page: InfoPageName; theme: 'dark' | 'light'; setTheme: (theme: 'dark' | 'light') => void }) {
  const isFaq = page === 'faq'
  return <main className="legal-screen info-screen">
    <nav className="nav shell" aria-label="Information navigation"><a className="wordmark" href="/"><img className="wordmark-mark" src={theme === 'light' ? '/cypherschool-c-mark-light.png' : '/cypherschool-c-mark-dark.png'} alt="" /><span>CYPHERSCHOOL</span></a><a className="nav-link" href="/">RETURN TO SCHOOL <span aria-hidden="true">↗</span></a></nav>
    <button className="theme-toggle" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}><span aria-hidden="true">{theme === 'dark' ? '☼' : '◐'}</span>{theme === 'dark' ? 'LIGHT' : 'DARK'}</button>
    <section className="legal-shell shell">
      <p className="eyebrow"><span />CYPHERSCHOOL · INFORMATION</p>
      <h1>{isFaq ? <>Questions,<br /><em>answered.</em></> : <>Notes from<br /><em>the school.</em></>}</h1>
      {isFaq ? <div className="faq-list">
        <details open><summary>What is CypherSchool?</summary><p>CypherSchool is a free, interactive learning platform for understanding financial privacy, zero-knowledge proofs, and private computation one short lesson at a time.</p></details>
        <details><summary>Do I need a wallet or an account?</summary><p>No wallet connection or email address is required. You can use an alias-only learning profile to save progress on your device.</p></details>
        <details><summary>Is this financial or investment advice?</summary><p>No. CypherSchool is educational and uses fictional examples. It does not provide financial, legal, tax, security, or investment advice.</p></details>
        <details><summary>What data does CypherSchool keep?</summary><p>The platform keeps the limited information needed for an alias-based learning profile and certificate verification. Read the full <a href="/privacy">Privacy Policy</a> for the exact details.</p></details>
        <details><summary>How do Zcash donations work?</summary><p>The Support page provides a shielded Zcash payment request, including the CypherSchool memo for wallets that support it. Donations are optional and do not change access to the course.</p></details>
      </div> : <div className="blog-list">
        <article><p className="eyebrow"><span />FOUNDATION</p><h2>Privacy is not secrecy.</h2><p>Privacy is the ability to decide what you reveal, to whom, and in what context. It is a practical condition for ordinary life—not a signal of wrongdoing.</p><a href="/#curriculum">START THE FIRST LESSON →</a></article>
        <article><p className="eyebrow"><span />ZERO KNOWLEDGE</p><h2>Prove without revealing.</h2><p>Zero-knowledge proofs make it possible to demonstrate that a statement is true without disclosing the private information behind it.</p><a href="/#curriculum">EXPLORE THE LEARNING PATH →</a></article>
        <article><p className="eyebrow"><span />THE SCHOOL</p><h2>One short lesson at a time.</h2><p>CypherSchool is built for clarity: a focused idea, a fictional scenario, and a quick check before the next step.</p><a href="/#curriculum">ENTER CYPHERSCHOOL →</a></article>
      </div>}
    </section>
    <footer className="footer shell"><span>© 2026 CYPHERSCHOOL</span><span>PRIVACY IS THE POWER.</span><a href="/">RETURN TO SCHOOL ↑</a></footer>
  </main>
}

function LegalPage({ page, theme, setTheme }: { page: LegalPageName; theme: 'dark' | 'light'; setTheme: (theme: 'dark' | 'light') => void }) {
  const [deviceDataCleared, setDeviceDataCleared] = useState(false)
  const title = page === 'terms' ? 'Terms of Service' : page === 'privacy' ? 'Privacy Policy' : 'Privacy Settings'
  const clearDeviceData = () => {
    window.localStorage.removeItem(profileStorageKey)
    window.localStorage.removeItem('cypherschool.theme')
    setDeviceDataCleared(true)
  }

  return <main className="legal-screen">
    <nav className="nav shell" aria-label="Legal navigation"><a className="wordmark" href="/"><img className="wordmark-mark" src={theme === 'light' ? '/cypherschool-c-mark-light.png' : '/cypherschool-c-mark-dark.png'} alt="" /><span>CYPHERSCHOOL</span></a><a className="nav-link" href="/">RETURN TO SCHOOL <span aria-hidden="true">↗</span></a></nav>
    <button className="theme-toggle" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}><span aria-hidden="true">{theme === 'dark' ? '☼' : '◐'}</span>{theme === 'dark' ? 'LIGHT' : 'DARK'}</button>
    <section className="legal-shell shell">
      <p className="eyebrow"><span />CYPHERSCHOOL · UPDATED 16 SEPTEMBER 2026</p>
      <h1>{title === 'Privacy Settings' ? <>Control your<br /><em>device data.</em></> : <>{title.split(' ')[0]}<br /><em>{title.split(' ').slice(1).join(' ')}.</em></>}</h1>
      {page === 'terms' && <div className="legal-copy">
        <p className="legal-lead">CypherSchool is a learning platform for short, interactive lessons about financial privacy, zero-knowledge proofs, and private computation.</p>
        <h2>Using CypherSchool</h2><p>You may use CypherSchool for lawful, personal learning. Do not interfere with the service, attempt to access another learner’s profile, or use the service to violate another person’s privacy or rights.</p>
        <h2>Learning, not advice</h2><p>CypherSchool is educational. It does not provide financial, investment, legal, tax, security, or compliance advice. Lessons and examples are illustrative; make independent decisions and seek qualified advice where appropriate.</p>
        <h2>Your learning profile</h2><p>You choose an alias to save progress. Keep your recovery code private: it can restore access to your learning profile. You are responsible for activity performed through a device or recovery code you control.</p>
        <h2>Service changes</h2><p>We may update, pause, or improve CypherSchool and these terms. If a change is material, the updated date on this page will change. Continued use after an update means you accept the revised terms.</p>
        <h2>Contact</h2><p>Questions about these terms can be sent through CypherSchool’s official support channel when one is made available.</p>
      </div>}
      {page === 'privacy' && <div className="legal-copy">
        <p className="legal-lead">Privacy is part of the lesson. This policy describes the limited data CypherSchool uses to provide an alias-based learning experience.</p>
        <h2>What we collect</h2><p>When you create a learning profile, we store your alias, a random profile ID, your avatar choice, earned XP, lesson completion records, and timestamps. We store only cryptographic hashes of your session token and recovery code—not the readable values.</p>
        <h2>What stays on your device</h2><p>Your device stores your profile ID, alias, session token, avatar choice, and theme preference in local storage so you can continue learning. You can clear that device data from Privacy Settings or by logging out.</p>
        <h2>Anonymous activity signal</h2><p>CypherSchool may show recent starts and completions as a random label such as <code>anon_123</code>. That label is generated separately and is not connected to an alias, profile, wallet, or recovery code.</p>
        <h2>What we do not collect</h2><p>CypherSchool does not require a wallet connection. It does not use advertising trackers or sell personal data. We do not ask for a real name, email address, payment details, or your financial activity to use the lessons.</p>
        <h2>Certificates</h2><p>If you complete the course, we store a certificate ID and its cryptographic hash so it can be verified. Verification shows only that a certificate is valid and when it was issued; it does not reveal your alias or lesson history.</p>
        <h2>Retention and choices</h2><p>Learning-profile records are retained while CypherSchool operates so progress can be restored with your alias and recovery code. Clearing data from a device signs that device out; it does not erase the server-side learning profile. Do not create a profile if you do not want this limited record retained.</p>
        <h2>Policy updates</h2><p>If this policy changes, we will update the date at the top of this page.</p>
      </div>}
      {page === 'privacy-settings' && <div className="legal-copy privacy-controls">
        <p className="legal-lead">CypherSchool has no advertising or analytics controls because it does not use advertising trackers. These settings control information kept by this browser.</p>
        <section className="privacy-setting"><div><h2>Appearance</h2><p>Your theme choice is stored only in this browser.</p></div><div className="theme-choice" role="group" aria-label="Color theme"><button className={theme === 'dark' ? 'selected' : ''} type="button" onClick={() => setTheme('dark')}>DARK</button><button className={theme === 'light' ? 'selected' : ''} type="button" onClick={() => setTheme('light')}>LIGHT</button></div></section>
        <section className="privacy-setting"><div><h2>Device session</h2><p>Remove the saved profile session, alias, and theme preference from this browser. This signs out this device only; your recoverable learning profile remains on the service.</p></div><button className="privacy-action" type="button" onClick={clearDeviceData}>{deviceDataCleared ? 'DEVICE DATA CLEARED' : 'CLEAR DEVICE DATA'}</button></section>
        <section className="privacy-note-card"><h2>No wallet. No ad tracking.</h2><p>CypherSchool does not connect to wallets, collect payment information, or use advertising trackers. Read the <a href="/privacy">Privacy Policy</a> for the full description of the limited data used to run the learning experience.</p></section>
      </div>}
    </section>
    <footer className="footer shell"><span>© 2026 CYPHERSCHOOL</span><span>PRIVACY IS THE POWER.</span><a href="/">RETURN TO SCHOOL ↑</a></footer>
  </main>
}

function App() {
  const verificationPath = window.location.pathname.match(/^\/verify\/([^/]+)$/)
  if (verificationPath) return <CertificateVerificationFallback certificateId={decodeURIComponent(verificationPath[1]).toUpperCase()} />
  const [profile, setProfile] = useState<LearnerProfile | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => localStorage.getItem('cypherschool.theme') === 'dark' ? 'dark' : 'light')
  const [isAliasDialogOpen, setIsAliasDialogOpen] = useState(false)
  const [alias, setAlias] = useState('')
  const [aliasError, setAliasError] = useState('')
  const [newRecoveryCode, setNewRecoveryCode] = useState<string | null>(null)
  const [hasSavedRecoveryCode, setHasSavedRecoveryCode] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [isEntryChoiceOpen, setIsEntryChoiceOpen] = useState(false)
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [isDashboardOpen, setIsDashboardOpen] = useState(false)
  const [manifestoStep, setManifestoStep] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [isSavingLesson, setIsSavingLesson] = useState(false)
  const [lessonError, setLessonError] = useState('')
  const [isLessonComplete, setIsLessonComplete] = useState(false)
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([])
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false)
  const [replacementRecoveryCode, setReplacementRecoveryCode] = useState<string | null>(null)
  const [isReplacingRecoveryCode, setIsReplacingRecoveryCode] = useState(false)
  const [recoveryReplacementError, setRecoveryReplacementError] = useState('')
  const [isProgressLoaded, setIsProgressLoaded] = useState(false)
  const [isCourseCertificateOpen, setIsCourseCertificateOpen] = useState(false)
  const [certificate, setCertificate] = useState<CourseCertificate | null>(null)
  const [activity, setActivity] = useState<AnonymousActivity[]>([])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('cypherschool.theme', theme)
  }, [theme])
  const progressRequestId = useRef(0)

  useEffect(() => {
    try {
      const savedProfile = window.localStorage.getItem(profileStorageKey)
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile) as Partial<LearnerProfile>
        if (parsedProfile.id && parsedProfile.alias && parsedProfile.sessionToken) {
          setProfile(parsedProfile as LearnerProfile)
          setIsDashboardOpen(true)
        }
        else window.localStorage.removeItem(profileStorageKey)
      }
    } catch {
      window.localStorage.removeItem(profileStorageKey)
    }
  }, [])

  useEffect(() => {
    if (!profile) {
      setIsProgressLoaded(false)
      return
    }
    setIsProgressLoaded(false)
    const requestId = ++progressRequestId.current
    fetch('/api/progress', { headers: { 'x-cypherschool-profile': profile.id, 'x-cypherschool-session': profile.sessionToken } })
      .then(async (response) => {
        if (!response.ok) return
        const result = await response.json() as { profile?: Omit<LearnerProfile, 'sessionToken'>; lessons?: Array<{ lessonId: string; completed: number }> }
        if (requestId !== progressRequestId.current) return
        if (result.profile) {
          const refreshedProfile = { ...result.profile, sessionToken: profile.sessionToken }
          window.localStorage.setItem(profileStorageKey, JSON.stringify(refreshedProfile))
          setProfile(refreshedProfile)
        }
        const completedIds = result.lessons?.filter((lesson) => lesson.completed).map((lesson) => lesson.lessonId) ?? []
        setCompletedLessonIds(completedIds)
        setIsLessonComplete(completedIds.includes('01-case-for-privacy'))
      })
      .catch(() => undefined)
      .finally(() => {
        if (requestId === progressRequestId.current) setIsProgressLoaded(true)
      })
  }, [profile?.id, profile?.sessionToken, isProfileOpen])

  useEffect(() => {
    if (!profile || !completedLessonIds.includes('07-stealf')) {
      setCertificate(null)
      return
    }
    let isCurrent = true
    fetch('/api/certificates/me', { headers: { 'x-cypherschool-profile': profile.id, 'x-cypherschool-session': profile.sessionToken } })
      .then(async (response) => response.ok ? response.json() as Promise<{ certificate?: CourseCertificate | null }> : { certificate: null })
      .then((result) => { if (isCurrent) setCertificate(result.certificate ?? null) })
      .catch(() => undefined)
    return () => { isCurrent = false }
  }, [profile?.id, profile?.sessionToken, completedLessonIds.includes('07-stealf')])

  useEffect(() => {
    let isCurrent = true
    const loadActivity = () => {
      fetch('/api/activity')
        .then(async (response) => response.ok ? response.json() as Promise<{ events?: AnonymousActivity[] }> : { events: [] })
        .then((result) => { if (isCurrent) setActivity(result.events ?? []) })
        .catch(() => undefined)
    }
    loadActivity()
    const interval = window.setInterval(loadActivity, 20_000)
    return () => { isCurrent = false; window.clearInterval(interval) }
  }, [])

  const legalPath = window.location.pathname.replace(/^\//, '') as LegalPageName
  if (window.location.pathname === '/donate') return <DonatePage theme={theme} setTheme={setTheme} />
  const infoPath = window.location.pathname.replace(/^\//, '') as InfoPageName
  if (infoPath === 'faq' || infoPath === 'blog') return <InfoPage page={infoPath} theme={theme} setTheme={setTheme} />
  if (legalPath === 'terms' || legalPath === 'privacy' || legalPath === 'privacy-settings') return <LegalPage page={legalPath} theme={theme} setTheme={setTheme} />

  function openAliasDialog() {
    setAlias(profile?.alias ?? '')
    setAliasError('')
    setNewRecoveryCode(null)
    setHasSavedRecoveryCode(false)
    setIsRestoring(false)
    setIsEntryChoiceOpen(false)
    setIsAliasDialogOpen(true)
  }

  function openEntryChoice() {
    setIsEntryChoiceOpen(true)
  }

  function openRestoreDialog() {
    setAlias('')
    setAliasError('')
    setRecoveryCodeInput('')
    setNewRecoveryCode(null)
    setIsRestoring(true)
    setIsEntryChoiceOpen(false)
    setIsAliasDialogOpen(true)
  }

  function returnToEntryChoice() {
    setAliasError('')
    setIsAliasDialogOpen(false)
    setIsEntryChoiceOpen(true)
  }

  async function createProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedAlias = alias.trim().replace(/\s+/g, ' ')

    if (normalizedAlias.length < 3 || normalizedAlias.length > 18) {
      setAliasError('Choose 3–18 characters.')
      return
    }

    if (!/^[a-zA-Z0-9 _-]+$/.test(normalizedAlias)) {
      setAliasError('Use letters, numbers, spaces, hyphens, or underscores.')
      return
    }

    setIsSavingProfile(true)
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ alias: normalizedAlias }),
      })
      const result = await response.json() as { error?: string; profile?: Omit<LearnerProfile, 'sessionToken'>; recoveryCode?: string; sessionToken?: string }
      if (!response.ok || !result.profile || !result.recoveryCode || !result.sessionToken) {
        setAliasError(result.error ?? 'Unable to create your learning profile. Please try again.')
        return
      }
      const nextProfile = { ...result.profile, sessionToken: result.sessionToken }
      window.localStorage.setItem(profileStorageKey, JSON.stringify(nextProfile))
      setProfile(nextProfile)
      setNewRecoveryCode(result.recoveryCode)
    } catch {
      setAliasError('The learning service is unavailable. Please try again shortly.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function restoreProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedAlias = alias.trim().replace(/\s+/g, ' ')
    if (!normalizedAlias || !recoveryCodeInput.trim()) {
      setAliasError('Enter both your alias and recovery code.')
      return
    }
    setIsSavingProfile(true)
    try {
      const response = await fetch('/api/profiles/restore', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ alias: normalizedAlias, recoveryCode: recoveryCodeInput }),
      })
      const result = await response.json() as { error?: string; profile?: Omit<LearnerProfile, 'sessionToken'>; sessionToken?: string }
      if (!response.ok || !result.profile || !result.sessionToken) {
        setAliasError(result.error ?? 'Unable to restore your learning profile.')
        return
      }
      const nextProfile = { ...result.profile, sessionToken: result.sessionToken }
      window.localStorage.setItem(profileStorageKey, JSON.stringify(nextProfile))
      setProfile(nextProfile)
      setIsAliasDialogOpen(false)
      setActiveLessonId(null)
      setIsDashboardOpen(true)
    } catch {
      setAliasError('The learning service is unavailable. Please try again shortly.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  function enterLab() {
    setIsAliasDialogOpen(false)
    setNewRecoveryCode(null)
    setIsDashboardOpen(true)
  }

  function nextBuiltLessonId() {
    return lessons.find((lesson) => builtLessonIds.includes(lesson.id) && !completedLessonIds.includes(lesson.id))?.id ?? null
  }

  function beginLesson(requestedLessonId?: string) {
    if (profile) {
      if (!requestedLessonId) {
        setIsDashboardOpen(true)
        return
      }
      const nextLessonId = requestedLessonId ?? nextBuiltLessonId()
      if (!nextLessonId) {
        document.querySelector('#curriculum')?.scrollIntoView({ behavior: 'smooth' })
        return
      }
      setManifestoStep(0)
      setSelectedAnswer('')
      setLessonError('')
      setActiveLessonId(nextLessonId)
      return
    }
    openEntryChoice()
  }

  function logOut() {
    window.localStorage.removeItem(profileStorageKey)
    setProfile(null)
    setCompletedLessonIds([])
    setIsLessonComplete(false)
    setIsProfileOpen(false)
    setActiveLessonId(null)
    setIsDashboardOpen(false)
  }

  async function selectAvatar(avatarIndex: number) {
    if (!profile) return
    const response = await fetch('/api/profiles/avatar', { method: 'PUT', headers: { 'content-type': 'application/json', 'x-cypherschool-profile': profile.id, 'x-cypherschool-session': profile.sessionToken }, body: JSON.stringify({ avatarIndex }) })
    const result = await response.json() as { profile?: Omit<LearnerProfile, 'sessionToken'> }
    if (!response.ok || !result.profile) return
    const nextProfile = { ...result.profile, sessionToken: profile.sessionToken }
    window.localStorage.setItem(profileStorageKey, JSON.stringify(nextProfile))
    setProfile(nextProfile)
    setIsAvatarPickerOpen(false)
  }

  async function saveCompletionCard() {
    if (!certificate) return
    const template = new Image()
    template.src = '/cypherschool-certificate-template.png'
    await new Promise<void>((resolve, reject) => { template.onload = () => resolve(); template.onerror = () => reject(new Error('Template unavailable')) })
    const canvas = document.createElement('canvas')
    canvas.width = template.naturalWidth
    canvas.height = template.naturalHeight
    const context = canvas.getContext('2d')
    if (!context) return
    context.drawImage(template, 0, 0)
    context.fillStyle = '#0b0d0c'
    context.fillRect(canvas.width * .59, canvas.height * .735, canvas.width * .37, canvas.height * .2)
    const qrSource = await QRCode.toDataURL(`${window.location.origin}/verify/${certificate.certificateId}`, { width: 230, margin: 0, color: { dark: '#F1F0E9', light: '#0B0D0C' } })
    const qr = new Image()
    qr.src = qrSource
    await new Promise<void>((resolve, reject) => { qr.onload = () => resolve(); qr.onerror = () => reject(new Error('QR unavailable')) })
    context.fillStyle = '#aeb9b0'
    context.font = '16px monospace'
    context.fillText('CERTIFICATE ID', canvas.width * .64, canvas.height * .785)
    context.fillStyle = '#f1f0e9'
    context.font = '24px monospace'
    context.fillText(certificate.certificateId, canvas.width * .64, canvas.height * .83)
    context.fillStyle = '#9cf58f'
    context.font = '15px monospace'
    context.fillText('VERIFY AT CYPHERSCHOOL.ONLINE/VERIFY', canvas.width * .64, canvas.height * .88)
    context.drawImage(qr, canvas.width * .86, canvas.height * .745, canvas.width * .09, canvas.width * .09)
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `cypherschool-certificate-${certificate.certificateId}.png`
    link.click()
  }

  function shareCompletion() {
    const text = `I completed the Financial Privacy Course at CypherSchool. Take your path and learn financial privacy one short lesson at a time.`
    const link = certificate ? `${window.location.origin}/verify/${certificate.certificateId}` : `${window.location.origin}/course-complete`
    window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`, '_blank', 'noopener,noreferrer')
  }

  async function replaceRecoveryCode() {
    if (!profile) return
    setIsReplacingRecoveryCode(true)
    setRecoveryReplacementError('')
    try {
      const response = await fetch('/api/profiles/recovery', {
        method: 'POST',
        headers: { 'x-cypherschool-profile': profile.id, 'x-cypherschool-session': profile.sessionToken },
      })
      const result = await response.json() as { error?: string; recoveryCode?: string }
      if (!response.ok || !result.recoveryCode) {
        setRecoveryReplacementError(result.error ?? 'We could not generate a recovery code. Try again shortly.')
        return
      }
      setReplacementRecoveryCode(result.recoveryCode)
    } catch {
      setRecoveryReplacementError('The learning service is unavailable. Please try again shortly.')
    } finally {
      setIsReplacingRecoveryCode(false)
    }
  }

  function goToNextPath(nextLessonId: string) {
    setSelectedAnswer('')
    setManifestoStep(0)
    if (nextLessonId === '02-what-your-money-reveals' || nextLessonId === '03-tools-of-privacy' || nextLessonId === '04-prove-without-revealing' || nextLessonId === '05-zcash-private-money' || nextLessonId === '06-arcium-private-computation' || nextLessonId === '07-stealf') {
      setActiveLessonId(nextLessonId)
      return
    }
    setActiveLessonId(null)
    window.setTimeout(() => document.querySelector('#curriculum')?.scrollIntoView({ behavior: 'smooth' }), 0)
  }

  async function completeLesson(lessonId: '01-case-for-privacy' | '02-what-your-money-reveals' | '03-tools-of-privacy' | '04-prove-without-revealing' | '05-zcash-private-money' | '06-arcium-private-computation' | '07-stealf') {
    const correctAnswer = lessonId === '01-case-for-privacy' ? 'choice' : lessonId === '02-what-your-money-reveals' ? 'choice-two' : lessonId === '03-tools-of-privacy' ? 'choice-three' : lessonId === '04-prove-without-revealing' ? 'choice-four' : lessonId === '05-zcash-private-money' ? 'choice-five' : lessonId === '06-arcium-private-computation' ? 'choice-six' : 'choice-seven'
    if (!profile || selectedAnswer !== correctAnswer) return
    setIsSavingLesson(true)
    setLessonError('')
    try {
      const response = await fetch('/api/progress', {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          'x-cypherschool-profile': profile.id,
          'x-cypherschool-session': profile.sessionToken,
        },
        body: JSON.stringify({ lessonId, completed: true, score: 100, xpEarned: 100 }),
      })
      const result = await response.json() as { error?: string; profile?: Omit<LearnerProfile, 'sessionToken'>; certificate?: CourseCertificate | null }
      if (!response.ok || !result.profile) {
        setLessonError(result.error ?? 'We could not save this lesson. Please try again.')
        return
      }
      const nextProfile = { ...result.profile, sessionToken: profile.sessionToken }
      progressRequestId.current += 1
      window.localStorage.setItem(profileStorageKey, JSON.stringify(nextProfile))
      setProfile(nextProfile)
      if (result.certificate) setCertificate(result.certificate)
      if (lessonId === '01-case-for-privacy') setIsLessonComplete(true)
      setCompletedLessonIds((lessonIds) => lessonIds.includes(lessonId) ? lessonIds : [...lessonIds, lessonId])
      if (lessonId === '07-stealf') {
        setIsCourseCertificateOpen(true)
        setActiveLessonId(null)
      }
    } catch {
      setLessonError('The learning service is unavailable. Please try again shortly.')
    } finally {
      setIsSavingLesson(false)
    }
  }

  const completedChapters = completedLessonIds.length
  const chaptersRemaining = lessons.length - completedChapters
  const isCourseComplete = completedChapters === lessons.length
  const nextLesson = lessons.find((lesson) => lesson.id === nextBuiltLessonId())
  const continuePathLabel = nextLesson ? `CONTINUE: ${nextLesson.number} — ${nextLesson.title.toUpperCase()}` : 'VIEW NEXT PATH'
  const selectedAvatarStyle = { backgroundImage: 'url(/cypherschool-pfps.png)', backgroundSize: '500% 400%', backgroundPosition: `${((profile?.avatarIndex ?? 0) % 5) * 25}% ${Math.floor((profile?.avatarIndex ?? 0) / 5) * 33.333}%` }
  const wordmarkSource = theme === 'light' ? '/cypherschool-c-mark-light.png' : '/cypherschool-c-mark-dark.png'
  const themeToggle = <button className="theme-toggle" type="button" onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}><span aria-hidden="true">{theme === 'dark' ? '☼' : '◐'}</span>{theme === 'dark' ? 'LIGHT' : 'DARK'}</button>

  if (isDashboardOpen && !activeLessonId) {
    return <main className="dashboard-screen">
      <nav className="nav shell" aria-label="Dashboard navigation">
        <button className="wordmark nav-button" type="button" onClick={() => setIsDashboardOpen(false)} aria-label="Return to CypherSchool home">
          <img className="wordmark-mark" src={wordmarkSource} alt="" /><span>CYPHERSCHOOL</span>
        </button>
        <span className="nav-note">YOUR 7 CHAPTER LEARNING PATH</span>
        <button className="nav-link nav-button" type="button" onClick={logOut}>LOG OUT <span aria-hidden="true">↗</span></button>
      </nav>
      {themeToggle}
      <section className="dashboard-shell shell">
        <div className="dashboard-intro">
          <p className="eyebrow"><span />YOUR LEARNING SPACE</p>
          <h1>Learn at<br />your <em>own pace.</em></h1>
          <p>Each chapter gives you one clear idea, a fictional scenario, and a short check before you move forward.</p>
          <button className="dashboard-profile" type="button" onClick={() => setIsProfileOpen((open) => !open)} aria-expanded={isProfileOpen} aria-controls="dashboard-profile"><span className="selected-avatar" style={{ backgroundImage: 'url(/cypherschool-pfps.png)', backgroundSize: '500% 400%', backgroundPosition: `${((profile?.avatarIndex ?? 0) % 5) * 25}% ${Math.floor((profile?.avatarIndex ?? 0) / 5) * 33.333}%` }} /><div><small>LEARNING AS</small><strong>{profile?.alias}</strong></div><b>{profile?.xp ?? 0} XP</b></button>
          {isProfileOpen && <section className="dashboard-profile-details" id="dashboard-profile" aria-label="Your learning profile">
            <div className="profile-stats"><div><b>{profile?.xp ?? 0}</b><span>TOTAL XP</span></div><div><b>{chaptersRemaining}</b><span>CHAPTERS LEFT</span></div></div>
            <div className="medal-header"><span>CHAPTER MEDALS</span><span>{completedChapters} / {lessons.length}</span></div>
            <div className="medal-grid">{lessons.map((lesson) => { const earned = completedLessonIds.includes(lesson.id); return <div className={earned ? 'medal earned' : 'medal'} key={lesson.number}><span>{earned ? '✦' : lesson.number}</span><small>{earned ? 'EARNED' : 'LOCKED'}</small></div> })}</div>
            <div className="avatar-picker"><p>YOUR COLLECTIBLE PFP</p><button className="avatar-current" type="button" onClick={() => setIsAvatarPickerOpen((open) => !open)} aria-expanded={isAvatarPickerOpen} style={{ backgroundImage: 'url(/cypherschool-pfps.png)', backgroundSize: '500% 400%', backgroundPosition: `${((profile?.avatarIndex ?? 0) % 5) * 25}% ${Math.floor((profile?.avatarIndex ?? 0) / 5) * 33.333}%` }} />{isAvatarPickerOpen && <div className="avatar-options">{Array.from({ length: 20 }, (_, avatarIndex) => <button type="button" aria-label={`Choose avatar ${avatarIndex + 1}`} className={(profile?.avatarIndex ?? 0) === avatarIndex ? 'selected' : ''} key={avatarIndex} onClick={() => selectAvatar(avatarIndex)} style={{ backgroundImage: 'url(/cypherschool-pfps.png)', backgroundSize: '500% 400%', backgroundPosition: `${(avatarIndex % 5) * 25}% ${Math.floor(avatarIndex / 5) * 33.333}%` }} />)}</div>}</div>
            {isCourseComplete && <div className="gold-medal"><span>✦</span><div><b>GOLD COURSE MEDAL</b><small>ALL 7 CHAPTERS COMPLETE</small></div></div>}
            <div className="recovery-replace"><p>RECOVERY CODE</p>{replacementRecoveryCode ? <><strong>{replacementRecoveryCode}</strong><small>Save this new code now. Your previous recovery code no longer works.</small></> : <><small>Need a replacement? Generate a new code for restoring this profile on another device.</small><button type="button" onClick={replaceRecoveryCode} disabled={isReplacingRecoveryCode}>{isReplacingRecoveryCode ? 'GENERATING…' : 'GENERATE NEW CODE'}</button></>}{recoveryReplacementError && <span className="alias-error">{recoveryReplacementError}</span>}</div>
            <button className="logout-button" type="button" onClick={logOut}>LOG OUT OF THIS DEVICE <span aria-hidden="true">↗</span></button>
          </section>}
          <button className="primary-button" type="button" disabled={!nextLesson} onClick={() => nextLesson && beginLesson(nextLesson.id)}>{nextLesson ? `START ${nextLesson.number}` : 'PATH COMPLETE'} <span>→</span></button>
        </div>
        <section className="dashboard-course" aria-label="Your seven chapter learning path">
          <div className="dashboard-course-head"><span>YOUR LEARNING PATH</span><span>{completedChapters} / 7 COMPLETE</span></div>
          <div className="lesson-grid">{lessons.map((lesson) => {
            const complete = completedLessonIds.includes(lesson.id)
            const available = builtLessonIds.includes(lesson.id) && (lesson.id === '01-case-for-privacy' || (lesson.id === '02-what-your-money-reveals' && isLessonComplete) || (lesson.id === '03-tools-of-privacy' && completedLessonIds.includes('02-what-your-money-reveals')) || (lesson.id === '04-prove-without-revealing' && completedLessonIds.includes('03-tools-of-privacy')) || (lesson.id === '05-zcash-private-money' && completedLessonIds.includes('04-prove-without-revealing')) || (lesson.id === '06-arcium-private-computation' && completedLessonIds.includes('05-zcash-private-money')) || (lesson.id === '07-stealf' && completedLessonIds.includes('06-arcium-private-computation')))
            return <article className={`lesson-card ${available ? 'ready' : 'locked'}`} key={lesson.id} role={available ? 'button' : undefined} tabIndex={available ? 0 : undefined} onClick={() => available && beginLesson(lesson.id)} onKeyDown={(event) => { if (available && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); beginLesson(lesson.id) } }}>
              <div className="lesson-meta"><span>CHAPTER {lesson.number}</span><span className="lesson-mark">{lesson.id === '05-zcash-private-money' ? <ZcashMark /> : lesson.mark}</span></div>
              <h3>{lesson.title}</h3><p>{lesson.description}</p>
              <span className="lesson-action">{complete ? 'REVISIT CHAPTER' : available ? 'BEGIN CHAPTER' : 'UNLOCKS NEXT'} <span aria-hidden="true">→</span></span>
            </article>
          })}</div>
          {isCourseComplete && <section className="course-complete-card" aria-label="Course complete">
            {certificate ? <CertificateTemplate certificate={certificate} compact /> : <img src="/cypherschool-course-complete.png" alt="CypherSchool Financial Privacy Course complete Gold 07 medal" />}
            <div><p className="eyebrow"><span />COURSE COMPLETE</p><h2>You completed<br /><em>CypherSchool.</em></h2><p>Seven chapters, one clearer view of financial privacy. Share your completion and invite someone to take their path.</p>{certificate && <a className="certificate-id" href={`/verify/${certificate.certificateId}`}>CERTIFICATE ID <code>{certificate.certificateId}</code><span>VERIFY →</span></a>}<div className="completion-actions"><button className="primary-button" type="button" onClick={shareCompletion}>SHARE ON X <span>↗</span></button><button className="path-home-button save-card-button" type="button" onClick={saveCompletionCard}>DOWNLOAD CERTIFICATE</button></div></div>
          </section>}
        </section>
      </section>
      {isCourseCertificateOpen && <section className="certificate-overlay" role="dialog" aria-modal="true" aria-labelledby="certificate-title">
        <div className="certificate-dialog">
          <button className="certificate-close" type="button" onClick={() => setIsCourseCertificateOpen(false)} aria-label="Close completion certificate">×</button>
          <p className="eyebrow"><span />COURSE COMPLETE</p>
          {certificate ? <CertificateTemplate certificate={certificate} /> : <img src="/cypherschool-course-complete.png" alt="CypherSchool Financial Privacy Course complete gold medal" />}
          <p className="certificate-awarded">AWARDED TO {profile?.alias?.toUpperCase()}</p>
          <h2 id="certificate-title">Your certificate<br /><em>is unlocked.</em></h2>
          <p className="certificate-copy">You completed all seven chapters of the CypherSchool Financial Privacy Course and earned the Gold 07 Medal.</p>
          {certificate ? <a className="certificate-id certificate-modal-id" href={`/verify/${certificate.certificateId}`}>CERTIFICATE ID <code>{certificate.certificateId}</code><span>PUBLICLY VERIFIABLE →</span></a> : <p className="certificate-pending">ISSUING YOUR PRIVATE CERTIFICATE ID…</p>}
          <div className="completion-actions certificate-actions"><button className="primary-button" type="button" onClick={shareCompletion}>SHARE ON X <span>↗</span></button><button className="path-home-button save-card-button" type="button" onClick={saveCompletionCard}>DOWNLOAD CERTIFICATE</button></div>
          <button className="certificate-dashboard" type="button" onClick={() => { setIsCourseCertificateOpen(false); setActiveLessonId(null) }}>VIEW YOUR DASHBOARD <span>→</span></button>
        </div>
      </section>}
    </main>
  }

  if (activeLessonId === '02-what-your-money-reveals') {
    const exposurePages = [
      { eyebrow: 'WHAT YOUR MONEY REVEALS', title: <>Every payment<br />leaves <em>a clue.</em></>, body: 'On a public ledger, an observer can often see a sender, recipient, amount, and time. Each entry may feel small on its own.', note: 'The risk is rarely in one transaction, but in the pattern they create together.' },
      { eyebrow: 'A FICTIONAL TRAIL', title: <>Patterns make<br />context <em>visible.</em></>, body: 'Meet Juno. These fictional payments are not private data—they are a learning exercise about what an outside observer could connect when timing, counterparties, and amounts repeat.', note: 'A public trail can suggest routines and relationships without proving every detail.' },
    ]
    const exposurePage = exposurePages[manifestoStep]
    const secondComplete = completedLessonIds.includes('02-what-your-money-reveals')
    return (
      <main className="lesson-screen exposure-screen">
        <nav className="lesson-nav shell" aria-label="Lesson navigation"><button className="lesson-back" type="button" onClick={() => setActiveLessonId(null)}>← BACK TO PATH</button><span>CHAPTER 02 / 07</span><span>{profile?.xp ?? 0} XP</span></nav>
        <section className="manifesto-shell shell">
          <div className="manifesto-rail" aria-label={`Page ${Math.min(manifestoStep + 1, 3)} of 3`}>{[0, 1, 2].map((step) => <span className={step <= manifestoStep ? 'active' : ''} key={step} />)}</div>
          {manifestoStep < 2 && exposurePage ? <article className="manifesto-page">
            <div><p className="eyebrow"><span />{exposurePage.eyebrow}</p><p className="lesson-kicker">// 02.0{manifestoStep + 1}</p><h1>{exposurePage.title}</h1></div>
            <div className="manifesto-reading">{manifestoStep === 1 && <div className="transaction-trail"><div><span>MON · 08:12</span><b>18 USDC → GREEN RAIL</b></div><div><span>TUE · 12:40</span><b>42 USDC → CENTRAL CLINIC</b></div><div><span>FRI · 19:05</span><b>18 USDC → GREEN RAIL</b></div></div>}<p>{exposurePage.body}</p><aside>{exposurePage.note}</aside>{manifestoStep > 0 && <button className="review-notes" type="button" onClick={() => setManifestoStep((step) => step - 1)}>← PREVIOUS NOTE</button>}<button className="primary-button" type="button" onClick={() => setManifestoStep((step) => step + 1)}>CONTINUE <span aria-hidden="true">→</span></button></div>
          </article> : <article className="manifesto-page manifesto-check">
            <div><p className="eyebrow"><span />PATTERN CHECK</p><p className="lesson-kicker">// 02.03</p><h1>What can an<br /><em>observer infer?</em></h1></div>
            <div className="manifesto-reading">{secondComplete ? <><button className="review-notes" type="button" onClick={() => setManifestoStep(1)}>← REVIEW PREVIOUS NOTES</button><p>You completed What Your Money Reveals.</p><aside>+100 XP and Medal 02 synced to your anonymous learning profile.</aside><div className="completion-actions"><button className="primary-button" type="button" onClick={() => goToNextPath('03-tools-of-privacy')}>NEXT PATH <span aria-hidden="true">→</span></button><button className="path-home-button" type="button" onClick={() => setActiveLessonId(null)}>RETURN TO MAIN HOME</button></div></> : <><button className="review-notes" type="button" onClick={() => setManifestoStep(1)}>← REVIEW PREVIOUS NOTES</button><div className="answer-options"><button className={selectedAnswer === 'choice-two' ? 'selected' : ''} type="button" onClick={() => setSelectedAnswer('choice-two')}>Juno may have a regular routine around Central Square.</button><button className={selectedAnswer === 'wrong-three' ? 'selected' : ''} type="button" onClick={() => setSelectedAnswer('wrong-three')}>Juno’s medical diagnosis is publicly known.</button><button className={selectedAnswer === 'wrong-four' ? 'selected' : ''} type="button" onClick={() => setSelectedAnswer('wrong-four')}>Nothing meaningful can be learned from public payments.</button></div>{selectedAnswer && selectedAnswer !== 'choice-two' && <p className="answer-note">Not quite. Patterns can suggest a routine, but they do not prove a diagnosis or reveal everything about a person.</p>}{lessonError && <p className="alias-error" role="alert">{lessonError}</p>}<button className="primary-button" type="button" disabled={selectedAnswer !== 'choice-two' || isSavingLesson} onClick={() => completeLesson('02-what-your-money-reveals')}>{isSavingLesson ? 'SAVING…' : 'COMPLETE CHAPTER'} <span aria-hidden="true">→</span></button></>}</div>
          </article>}
        </section>
      </main>
    )
  }

  if (activeLessonId === '03-tools-of-privacy') {
    const toolPages = [
      { eyebrow: 'THE TOOLS OF PRIVACY', title: <>A secret needs<br /><em>a shield.</em></>, body: 'A message left in plain text can be read by anyone who sees it. Encryption transforms it into ciphertext: information that is unreadable without the right key.', note: 'Encryption protects the contents of information, even when the information has to travel.' },
      { eyebrow: 'THE RIGHT KEY', title: <span className="right-key-title">The lock is public.<br />The key is <em>yours.</em></span>, body: 'Good privacy tools do not depend on hiding the existence of a lock. They depend on making the key hard to guess, hard to copy, and available only to the intended person.', note: 'Cryptography lets systems verify and protect information without asking everyone to trust a middleman.' },
    ]
    const toolPage = toolPages[manifestoStep]
    const thirdComplete = completedLessonIds.includes('03-tools-of-privacy')
    return (
      <main className="lesson-screen tools-screen">
        <nav className="lesson-nav shell" aria-label="Lesson navigation"><button className="lesson-back" type="button" onClick={() => setActiveLessonId(null)}>← BACK TO PATH</button><span>CHAPTER 03 / 07</span><span>{profile?.xp ?? 0} XP</span></nav>
        <section className="manifesto-shell shell">
          <div className="manifesto-rail" aria-label={`Page ${Math.min(manifestoStep + 1, 3)} of 3`}>{[0, 1, 2].map((step) => <span className={step <= manifestoStep ? 'active' : ''} key={step} />)}</div>
          {manifestoStep < 2 && toolPage ? <article className="manifesto-page">
            <div><p className="eyebrow"><span />{toolPage.eyebrow}</p><p className="lesson-kicker">// 03.0{manifestoStep + 1}</p><h1>{toolPage.title}</h1></div>
            <div className="manifesto-reading">{manifestoStep === 0 && <div className="crypto-transform"><span>“PAY JUNO 18”</span><b>ENCRYPT</b><strong>8Q7X · L2KM · 4V9P</strong></div>}<p>{toolPage.body}</p><aside>{toolPage.note}</aside>{manifestoStep > 0 && <button className="review-notes" type="button" onClick={() => setManifestoStep((step) => step - 1)}>← PREVIOUS NOTE</button>}<button className="primary-button" type="button" onClick={() => setManifestoStep((step) => step + 1)}>CONTINUE <span aria-hidden="true">→</span></button></div>
          </article> : <article className="manifesto-page manifesto-check">
            <div><p className="eyebrow"><span />FOUNDATION CHECK</p><p className="lesson-kicker">// 03.03</p><h1>What does<br /><em>encryption do?</em></h1></div>
            <div className="manifesto-reading">{thirdComplete ? <><button className="review-notes" type="button" onClick={() => setManifestoStep(1)}>← REVIEW PREVIOUS NOTES</button><div className="answer-options recorded-answer"><button className="selected" type="button" disabled>It turns readable information into protected ciphertext that needs a key to read.</button><button type="button" disabled>It makes public information disappear forever.</button><button type="button" disabled>It proves that a person is trustworthy.</button></div><p className="answer-note answer-recorded">ANSWER RECORDED — Encryption protects information from people who do not hold the key.</p><aside>Chapter complete. +100 XP and Medal 03 are synced to your learning profile.</aside><div className="completion-actions"><button className="primary-button" type="button" onClick={() => goToNextPath('04-prove-without-revealing')}>NEXT PATH <span aria-hidden="true">→</span></button><button className="path-home-button" type="button" onClick={() => setActiveLessonId(null)}>RETURN TO MAIN HOME</button></div></> : <><button className="review-notes" type="button" onClick={() => setManifestoStep(1)}>← REVIEW PREVIOUS NOTES</button><div className="answer-options"><button className={selectedAnswer === 'choice-three' ? 'selected' : ''} type="button" onClick={() => setSelectedAnswer('choice-three')}>It turns readable information into protected ciphertext that needs a key to read.</button><button className={selectedAnswer === 'wrong-five' ? 'selected' : ''} type="button" onClick={() => setSelectedAnswer('wrong-five')}>It makes public information disappear forever.</button><button className={selectedAnswer === 'wrong-six' ? 'selected' : ''} type="button" onClick={() => setSelectedAnswer('wrong-six')}>It proves that a person is trustworthy.</button></div>{selectedAnswer && selectedAnswer !== 'choice-three' && <p className="answer-note">Not quite. Encryption protects the contents of information; it does not erase public facts or prove trust by itself.</p>}{lessonError && <p className="alias-error" role="alert">{lessonError}</p>}<button className="primary-button" type="button" disabled={selectedAnswer !== 'choice-three' || isSavingLesson} onClick={() => completeLesson('03-tools-of-privacy')}>{isSavingLesson ? 'SAVING…' : 'COMPLETE CHAPTER'} <span aria-hidden="true">→</span></button></>}</div>
          </article>}
        </section>
      </main>
    )
  }

  if (activeLessonId === '07-stealf') {
    const isComplete = completedLessonIds.includes('07-stealf')
    const pages = [
      { eyebrow: 'STEALF', title: <>Privacy needs<br />a <em>real choice.</em></>, body: 'Stealf is a stablecoin-native neobank on Solana designed around a simple idea: people should be able to choose the level of financial privacy that fits the moment.', note: 'The course ideas now meet a practical product design: a public wallet for ordinary transparency and a private wallet for confidential activity.' },
      { eyebrow: 'THE PUBLIC WALLET', title: <>Use the public rail<br />when <em>visibility helps.</em></>, body: 'The public wallet works like a regular on-chain wallet. Its balance and transactions are visible, making it suitable for activity where transparency is expected. Payment cards require KYC.', note: 'Privacy is not a demand that every action be hidden. It is the ability to make an intentional choice.' },
      { eyebrow: 'THE PRIVATE WALLET', title: <>Keep sensitive activity<br /><em>confidential.</em></>, body: 'Stealf’s private wallet uses Arcium’s MPC network to keep balances, amounts, senders, and receivers encrypted. It is designed to give users a private option for situations where public financial exposure is not appropriate.', note: 'The goal is a usable financial experience where confidentiality is available by design—not an afterthought.' },
    ]
    const page = pages[manifestoStep]
    return <main className="lesson-screen stealf-screen">
      <nav className="lesson-nav shell"><button className="lesson-back" type="button" onClick={() => setActiveLessonId(null)}>← BACK TO PATH</button><span>CHAPTER 07 / 07</span><span>{profile?.xp ?? 0} XP</span></nav>
      <section className="manifesto-shell shell">
        <div className="manifesto-rail">{[0, 1, 2, 3].map((step) => <span className={step <= manifestoStep ? 'active' : ''} key={step} />)}</div>
        {manifestoStep < pages.length && page ? <article className="manifesto-page">
          <div><p className="eyebrow"><span />{page.eyebrow}</p><p className="lesson-kicker">// 07.0{manifestoStep + 1}</p><h1>{page.title}</h1></div>
          <div className="manifesto-reading">
            {manifestoStep === 0 && <div className="stealf-symbol"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="M16 47C16 27.7 31.7 12 51 12h37v15H51c-11 0-20 9-20 20H16Z" /><path d="M84 53c0 19.3-15.7 35-35 35H12V73h37c11 0 20-9 20-20h15Z" /></svg><span>STEALF</span></div>}
            {manifestoStep === 1 && <div className="wallet-rails"><span>PUBLIC WALLET</span><b>VISIBLE BALANCE · VISIBLE TRANSACTIONS</b></div>}
            {manifestoStep === 2 && <div className="wallet-rails private"><span>PRIVATE WALLET</span><b>ENCRYPTED BALANCE · ENCRYPTED TRANSACTIONS</b></div>}
            <p>{page.body}</p><aside>{page.note}</aside>
            {manifestoStep > 0 && <button className="review-notes" type="button" onClick={() => setManifestoStep((step) => step - 1)}>← PREVIOUS NOTE</button>}
            <button className="primary-button" type="button" onClick={() => setManifestoStep((step) => step + 1)}>CONTINUE <span>→</span></button>
          </div>
        </article> : <article className="manifesto-page manifesto-check">
          <div><p className="eyebrow"><span />FINAL CHECK</p><p className="lesson-kicker">// 07.04</p><h1>What does a<br /><em>privacy choice</em> make possible?</h1></div>
          <div className="manifesto-reading">{isComplete ? <>
            <button className="review-notes" type="button" onClick={() => setManifestoStep(2)}>← REVIEW PREVIOUS NOTES</button>
            <div className="answer-options recorded-answer"><button className="selected" type="button" disabled>Using public or private financial activity according to the situation.</button><button type="button" disabled>Making all payments permanently invisible.</button><button type="button" disabled>Removing the need for secure infrastructure.</button></div>
            <aside>Course complete. +100 XP and Medal 07 are synced to your learning profile.</aside><div className="completion-actions"><button className="primary-button" type="button" onClick={() => setActiveLessonId(null)}>VIEW YOUR DASHBOARD <span>→</span></button></div>
          </> : <>
            <button className="review-notes" type="button" onClick={() => setManifestoStep(2)}>← REVIEW PREVIOUS NOTES</button>
            <div className="answer-options"><button className={selectedAnswer === 'choice-seven' ? 'selected' : ''} type="button" onClick={() => setSelectedAnswer('choice-seven')}>Using public or private financial activity according to the situation.</button><button className={selectedAnswer === 'wrong-thirteen' ? 'selected' : ''} type="button" onClick={() => setSelectedAnswer('wrong-thirteen')}>Making all payments permanently invisible.</button><button className={selectedAnswer === 'wrong-fourteen' ? 'selected' : ''} type="button" onClick={() => setSelectedAnswer('wrong-fourteen')}>Removing the need for secure infrastructure.</button></div>
            {selectedAnswer && selectedAnswer !== 'choice-seven' && <p className="answer-note">Not quite. Privacy is a practical choice about what to reveal; it does not remove the need for security or make everything invisible.</p>}{lessonError && <p className="alias-error" role="alert">{lessonError}</p>}
            <button className="primary-button" type="button" disabled={selectedAnswer !== 'choice-seven' || isSavingLesson} onClick={() => completeLesson('07-stealf')}>{isSavingLesson ? 'SAVING…' : 'COMPLETE COURSE'} <span>→</span></button>
          </>}</div>
        </article>}
      </section>
    </main>
  }

  if (activeLessonId === '06-arcium-private-computation') {
    const isComplete = completedLessonIds.includes('06-arcium-private-computation')
    const pages = [
      { eyebrow: 'PRIVATE COMPUTATION', title: <>Data is often exposed<br />when it is <em>used.</em></>, body: 'Encryption can protect data while it is stored or sent. But many systems still decrypt sensitive data before they calculate with it—creating a point where a processor, service, or database can see it.', note: 'Private computation asks a different question: can a system calculate a result without first opening every input?' },
      { eyebrow: 'MULTI-PARTY COMPUTATION', title: <>One answer.<br />No single party sees <em>everything.</em></>, body: 'Multi-Party Computation, or MPC, lets several participants jointly compute with sensitive inputs. Each participant works with a protected share rather than receiving the complete underlying data.', note: 'The aim is to reveal the useful result while keeping the inputs confidential from any one computing party.' },
      { eyebrow: 'ARCIUM', title: <>Encrypted computation<br />for <em>applications.</em></>, body: 'Arcium is a private computation network that uses MPC so applications can process encrypted data without exposing the full inputs to any single node. It works with Solana for coordination and application integration.', note: 'This can enable private financial logic, confidential DeFi, sealed bids, and other applications where a result is useful but the raw data is sensitive.' },
    ]
    const page = pages[manifestoStep]
    return <main className="lesson-screen arcium-screen">
      <nav className="lesson-nav shell"><button className="lesson-back" type="button" onClick={() => setActiveLessonId(null)}>← BACK TO PATH</button><span>CHAPTER 06 / 07</span><span>{profile?.xp ?? 0} XP</span></nav>
      <section className="manifesto-shell shell">
        <div className="manifesto-rail">{[0, 1, 2, 3].map((step) => <span className={step <= manifestoStep ? 'active' : ''} key={step} />)}</div>
        {manifestoStep < pages.length && page ? <article className="manifesto-page">
          <div><p className="eyebrow"><span />{page.eyebrow}</p><p className="lesson-kicker">// 06.0{manifestoStep + 1}</p><h1>{page.title}</h1></div>
          <div className="manifesto-reading">
            {manifestoStep === 1 && <div className="mpc-shares"><span>PRIVATE INPUT</span><b>SHARE A</b><b>SHARE B</b><b>SHARE C</b><strong>COMPUTE TOGETHER → RESULT</strong></div>}
            {manifestoStep === 2 && <div className="arcium-flow"><span>ENCRYPTED INPUT</span><b>MPC NETWORK</b><span>PRIVATE RESULT</span></div>}
            <p>{page.body}</p><aside>{page.note}</aside>
            {manifestoStep > 0 && <button className="review-notes" type="button" onClick={() => setManifestoStep((step) => step - 1)}>← PREVIOUS NOTE</button>}
            <button className="primary-button" type="button" onClick={() => setManifestoStep((step) => step + 1)}>CONTINUE <span>→</span></button>
          </div>
        </article> : <article className="manifesto-page manifesto-check">
          <div><p className="eyebrow"><span />MPC CHECK</p><p className="lesson-kicker">// 06.04</p><h1>What does MPC<br />help an app <em>do?</em></h1></div>
          <div className="manifesto-reading">{isComplete ? <>
            <button className="review-notes" type="button" onClick={() => setManifestoStep(2)}>← REVIEW PREVIOUS NOTES</button>
            <div className="answer-options recorded-answer"><button className="selected" type="button" disabled>Compute with sensitive inputs without giving any single party the full data.</button><button type="button" disabled>Make sensitive data public more efficiently.</button><button type="button" disabled>Remove the need to verify a computation.</button></div>
            <aside>Chapter complete. +100 XP and Medal 06 are synced to your learning profile.</aside><div className="completion-actions"><button className="primary-button" type="button" onClick={() => goToNextPath('07-stealf')}>NEXT PATH <span>→</span></button><button className="path-home-button" type="button" onClick={() => setActiveLessonId(null)}>RETURN TO MAIN HOME</button></div>
          </> : <>
            <button className="review-notes" type="button" onClick={() => setManifestoStep(2)}>← REVIEW PREVIOUS NOTES</button>
            <div className="answer-options"><button className={selectedAnswer === 'choice-six' ? 'selected' : ''} type="button" onClick={() => setSelectedAnswer('choice-six')}>Compute with sensitive inputs without giving any single party the full data.</button><button className={selectedAnswer === 'wrong-eleven' ? 'selected' : ''} type="button" onClick={() => setSelectedAnswer('wrong-eleven')}>Make sensitive data public more efficiently.</button><button className={selectedAnswer === 'wrong-twelve' ? 'selected' : ''} type="button" onClick={() => setSelectedAnswer('wrong-twelve')}>Remove the need to verify a computation.</button></div>
            {selectedAnswer && selectedAnswer !== 'choice-six' && <p className="answer-note">Not quite. MPC keeps the inputs confidential while the participants work together to produce a result.</p>}{lessonError && <p className="alias-error" role="alert">{lessonError}</p>}
            <button className="primary-button" type="button" disabled={selectedAnswer !== 'choice-six' || isSavingLesson} onClick={() => completeLesson('06-arcium-private-computation')}>{isSavingLesson ? 'SAVING…' : 'COMPLETE CHAPTER'} <span>→</span></button>
          </>}</div>
        </article>}
      </section>
    </main>
  }

  if (activeLessonId === '05-zcash-private-money') {
    const isComplete = completedLessonIds.includes('05-zcash-private-money')
    const pages = [
      { eyebrow: 'WHAT IS ZCASH?', title: <>A currency built<br />for <em>financial privacy.</em></>, body: 'Zcash is a cryptocurrency network that gives people a choice between public and private on-chain payments. Its currency is ZEC. It uses zero-knowledge cryptography so the network can verify a transaction without making every financial detail public.', note: 'ZEC is the currency people hold and send on the Zcash network—similar to how ETH is used on Ethereum or BTC on Bitcoin.' },
      { eyebrow: 'TRANSPARENT TRANSACTIONS', title: <>Transparent means<br /><em>public on-chain.</em></>, body: 'A transparent Zcash transaction is the public form of payment. The participating addresses and amount are recorded on the blockchain, where anyone can inspect the trail and potentially connect patterns over time.', note: 'Transparency can be useful for public accounting, but it does not provide financial privacy by default.' },
      { eyebrow: 'SHIELDED TRANSACTIONS', title: <>Shielded means<br /><em>details protected.</em></>, body: 'A shielded transaction can still be validated by the Zcash network while keeping the amount and participating addresses from being publicly visible on the blockchain. The payment follows the rules without publishing its financial details.', note: 'Shielding changes what observers can see—not whether the network verifies that a payment is valid.' },
      { eyebrow: 'GETTING STARTED', title: <>Start small.<br />Protect your <em>keys.</em></>, body: 'Choose a wallet that explicitly supports shielded Zcash, such as ZODL Wallet or Vizor Wallet. Back up its recovery phrase offline before receiving funds, then make a small test transaction so you understand the wallet and its fees.', note: 'Never share a recovery phrase or private key. Keep it offline and verify the receiving address carefully before you send ZEC.' },
    ]
    const page = pages[manifestoStep]
    return <main className="lesson-screen zcash-screen">
      <nav className="lesson-nav shell"><button className="lesson-back" type="button" onClick={() => setActiveLessonId(null)}>← BACK TO PATH</button><span>CHAPTER 05 / 07</span><span>{profile?.xp ?? 0} XP</span></nav>
      <section className="manifesto-shell shell">
        <div className="manifesto-rail">{[0, 1, 2, 3, 4].map((step) => <span className={step <= manifestoStep ? 'active' : ''} key={step} />)}</div>
        {manifestoStep < pages.length && page ? <article className="manifesto-page">
          <div><p className="eyebrow"><span />{page.eyebrow}</p><p className="lesson-kicker">// 05.0{manifestoStep + 1}</p><h1>{page.title}</h1></div>
          <div className="manifesto-reading">
            {manifestoStep === 1 && <div className="zcash-compare"><div><b>TRANSPARENT</b><span>Address · amount · trail visible</span></div><div><b>SHIELDED</b><span>Details protected · validity verified</span></div></div>}
            {manifestoStep === 2 && <div className="zcash-proof"><ZcashMark /><span>SHIELDED TRANSACTION</span><b>VALID ON-CHAIN</b></div>}
            {manifestoStep === 3 && <div className="zcash-start"><b>01</b><span>Choose shielded support</span><b>02</b><span>Back up offline</span><b>03</b><span>Test with a small amount</span></div>}
            <p>{page.body}</p><aside>{page.note}</aside>
            {manifestoStep > 0 && <button className="review-notes" type="button" onClick={() => setManifestoStep((step) => step - 1)}>← PREVIOUS NOTE</button>}
            <button className="primary-button" type="button" onClick={() => setManifestoStep((step) => step + 1)}>CONTINUE <span>→</span></button>
          </div>
        </article> : <article className="manifesto-page manifesto-check">
          <div><p className="eyebrow"><span />PRIVATE MONEY CHECK</p><p className="lesson-kicker">// 05.05</p><h1>What can a<br /><em>shielded payment</em> protect?</h1></div>
          <div className="manifesto-reading">{isComplete ? <>
            <button className="review-notes" type="button" onClick={() => setManifestoStep(3)}>← REVIEW PREVIOUS NOTES</button>
            <div className="answer-options recorded-answer"><button className="selected" type="button" disabled>The amount and participating addresses from public on-chain view.</button><button type="button" disabled>Every detail of a person’s life in every context.</button><button type="button" disabled>The validity of a payment from the network.</button></div>
            <aside>Chapter complete. +100 XP and Medal 05 are synced to your learning profile.</aside>
            <div className="completion-actions"><button className="primary-button" type="button" onClick={() => goToNextPath('06-arcium-private-computation')}>NEXT PATH <span>→</span></button><button className="path-home-button" type="button" onClick={() => setActiveLessonId(null)}>RETURN TO MAIN HOME</button></div>
          </> : <>
            <button className="review-notes" type="button" onClick={() => setManifestoStep(3)}>← REVIEW PREVIOUS NOTES</button>
            <div className="answer-options"><button className={selectedAnswer === 'choice-five' ? 'selected' : ''} type="button" onClick={() => setSelectedAnswer('choice-five')}>The amount and participating addresses from public on-chain view.</button><button className={selectedAnswer === 'wrong-nine' ? 'selected' : ''} type="button" onClick={() => setSelectedAnswer('wrong-nine')}>Every detail of a person’s life in every context.</button><button className={selectedAnswer === 'wrong-ten' ? 'selected' : ''} type="button" onClick={() => setSelectedAnswer('wrong-ten')}>The validity of a payment from the network.</button></div>
            {selectedAnswer && selectedAnswer !== 'choice-five' && <p className="answer-note">Not quite. Shielding can protect transaction details on-chain while the network still validates that the transaction follows its rules.</p>}{lessonError && <p className="alias-error" role="alert">{lessonError}</p>}
            <button className="primary-button" type="button" disabled={selectedAnswer !== 'choice-five' || isSavingLesson} onClick={() => completeLesson('05-zcash-private-money')}>{isSavingLesson ? 'SAVING…' : 'COMPLETE CHAPTER'} <span>→</span></button>
          </>}</div>
        </article>}
      </section>
    </main>
  }

  if (activeLessonId === '04-prove-without-revealing') {
    const isComplete = completedLessonIds.includes('04-prove-without-revealing')
    const pages = [
      { title: <>A fact can be<br /><em>enough.</em></>, body: 'Sometimes a person needs to prove a condition is true without sharing the sensitive information behind it.', note: 'Zero-knowledge proofs separate what must be verified from what must be revealed.' },
      { title: <>Prove the threshold.<br />Keep the number <em>private.</em></>, body: 'A person can prove that a private balance is above 100 USDC. The verifier receives a valid yes or no—not the exact balance, identity, or transaction history.', note: 'A valid proof answers the question without handing over the underlying data.' },
    ]
    const page = pages[manifestoStep]
    return <main className="lesson-screen"><nav className="lesson-nav shell"><button className="lesson-back" type="button" onClick={() => setActiveLessonId(null)}>← BACK TO PATH</button><span>CHAPTER 04 / 07</span><span>{profile?.xp ?? 0} XP</span></nav><section className="manifesto-shell shell"><div className="manifesto-rail">{[0, 1, 2].map((step) => <span className={step <= manifestoStep ? 'active' : ''} key={step} />)}</div>{manifestoStep < 2 && page ? <article className="manifesto-page"><div><p className="eyebrow"><span />PROVE WITHOUT REVEALING</p><p className="lesson-kicker">// 04.0{manifestoStep + 1}</p><h1>{page.title}</h1></div><div className="manifesto-reading"><p>{page.body}</p><aside>{page.note}</aside>{manifestoStep > 0 && <button className="review-notes" type="button" onClick={() => setManifestoStep((step) => step - 1)}>← PREVIOUS NOTE</button>}<button className="primary-button" type="button" onClick={() => setManifestoStep((step) => step + 1)}>CONTINUE <span>→</span></button></div></article> : <article className="manifesto-page manifesto-check"><div><p className="eyebrow"><span />ZERO-KNOWLEDGE CHECK</p><p className="lesson-kicker">// 04.03</p><h1 className="proof-question-title">Juno proves she has<br /><em>enough.</em> What stays private?</h1></div><div className="manifesto-reading">{isComplete ? <><button className="review-notes" type="button" onClick={() => setManifestoStep(1)}>← REVIEW PREVIOUS NOTES</button><div className="answer-options recorded-answer"><button className="selected" type="button" disabled>Her exact balance.</button><button type="button" disabled>Whether her balance is above 100 USDC.</button><button type="button" disabled>Whether the proof is valid.</button></div><aside>Chapter complete. +100 XP and Medal 04 are synced to your learning profile.</aside><div className="completion-actions"><button className="primary-button" type="button" onClick={() => goToNextPath('05-zcash-private-money')}>NEXT PATH <span>→</span></button><button className="path-home-button" type="button" onClick={() => setActiveLessonId(null)}>RETURN TO MAIN HOME</button></div></> : <><button className="review-notes" type="button" onClick={() => setManifestoStep(1)}>← REVIEW PREVIOUS NOTES</button><div className="answer-options"><button className={selectedAnswer === 'choice-four' ? 'selected' : ''} type="button" onClick={() => setSelectedAnswer('choice-four')}>Her exact balance.</button><button className={selectedAnswer === 'wrong-seven' ? 'selected' : ''} type="button" onClick={() => setSelectedAnswer('wrong-seven')}>Whether her balance is above 100 USDC.</button><button className={selectedAnswer === 'wrong-eight' ? 'selected' : ''} type="button" onClick={() => setSelectedAnswer('wrong-eight')}>Whether the proof is valid.</button></div>{selectedAnswer && selectedAnswer !== 'choice-four' && <p className="answer-note">Not quite. The proof confirms that Juno has enough; her exact balance stays private.</p>}<button className="primary-button" type="button" disabled={selectedAnswer !== 'choice-four' || isSavingLesson} onClick={() => completeLesson('04-prove-without-revealing')}>{isSavingLesson ? 'SAVING…' : 'COMPLETE CHAPTER'} <span>→</span></button></>}</div></article>}</section></main>
  }

  if (activeLessonId === '01-case-for-privacy') {
    const pages = [
      { eyebrow: 'THE CASE FOR PRIVACY', title: <>Privacy is not<br /><em>suspicion.</em></>, body: 'It is the ability to move through ordinary life without every choice becoming a permanent public record.', note: 'Privacy lets people decide what a moment means—and who gets to see it.' },
      { eyebrow: 'THE QUIET TRAIL', title: <>Information creates<br /><em>an outline.</em></>, body: 'A payment can reveal where someone spends time, what they can afford, who they support, or when their circumstances change.', note: 'One data point can be harmless. A pattern of them can be intimate.' },
      { eyebrow: 'THE REAL CHOICE', title: <>Privacy protects<br /><em>agency.</em></>, body: 'It gives people room to make legal, ordinary decisions without being profiled, pressured, or exposed by default.', note: 'Financial privacy is about choosing what you reveal—not disappearing.' },
    ]
    const page = pages[manifestoStep]
    return (
      <main className="lesson-screen">
        <nav className="lesson-nav shell" aria-label="Lesson navigation">
          <button className="lesson-back" type="button" onClick={() => setActiveLessonId(null)}>← BACK TO PATH</button>
          <span>CHAPTER 01 / 07</span>
          <span>{profile?.xp ?? 0} XP</span>
        </nav>
        <section className="manifesto-shell shell">
          <div className="manifesto-rail" aria-label={`Page ${Math.min(manifestoStep + 1, 4)} of 4`}>
            {[0, 1, 2, 3].map((step) => <span className={step <= manifestoStep ? 'active' : ''} key={step} />)}
          </div>
          {manifestoStep < 3 && page ? (
            <article className="manifesto-page">
              <div>
                <p className="eyebrow"><span />{page.eyebrow}</p>
                <p className="lesson-kicker">// 01.0{manifestoStep + 1}</p>
                <h1>{page.title}</h1>
              </div>
              <div className="manifesto-reading">
                <p>{page.body}</p>
                <aside>{page.note}</aside>
                {manifestoStep > 0 && <button className="review-notes" type="button" onClick={() => setManifestoStep((step) => step - 1)}>← PREVIOUS NOTE</button>}
                <button className="primary-button" type="button" onClick={() => setManifestoStep((step) => step + 1)}>CONTINUE <span aria-hidden="true">→</span></button>
              </div>
            </article>
          ) : (
            <article className="manifesto-page manifesto-check">
              <div>
                <p className="eyebrow"><span />REFLECTION CHECK</p>
                <p className="lesson-kicker">// 01.04</p>
                <h1>What does<br /><em>privacy give us?</em></h1>
              </div>
              <div className="manifesto-reading">
                {isLessonComplete ? <>
                  <div className="answer-options recorded-answer" aria-label="Recorded answer"><button className="selected" type="button" disabled>The ability to choose what we reveal.</button><button type="button" disabled>A way to avoid responsibility.</button><button type="button" disabled>A reason to hide ordinary activity.</button></div>
                  <p className="answer-note answer-recorded">ANSWER RECORDED — Privacy gives people the agency to choose what they reveal.</p>
                  <aside>Chapter complete. +100 XP and Medal 01 are synced to your learning profile.</aside>
                  <button className="review-notes" type="button" onClick={() => setManifestoStep(2)}>← REVIEW PREVIOUS NOTES</button>
                  <div className="completion-actions"><button className="primary-button" type="button" onClick={() => goToNextPath('02-what-your-money-reveals')}>NEXT PATH <span aria-hidden="true">→</span></button><button className="path-home-button" type="button" onClick={() => setActiveLessonId(null)}>RETURN TO MAIN HOME</button></div>
                </> : <>
                  <button className="review-notes" type="button" onClick={() => setManifestoStep(2)}>← REVIEW PREVIOUS NOTES</button>
                  <div className="answer-options">
                    <button className={selectedAnswer === 'choice' ? 'selected' : ''} type="button" onClick={() => setSelectedAnswer('choice')}>The ability to choose what we reveal.</button>
                    <button className={selectedAnswer === 'wrong-one' ? 'selected' : ''} type="button" onClick={() => setSelectedAnswer('wrong-one')}>A way to avoid responsibility.</button>
                    <button className={selectedAnswer === 'wrong-two' ? 'selected' : ''} type="button" onClick={() => setSelectedAnswer('wrong-two')}>A reason to hide ordinary activity.</button>
                  </div>
                  {selectedAnswer && selectedAnswer !== 'choice' && <p className="answer-note">Try again. Privacy is about control and agency, not avoiding accountability.</p>}
                  {lessonError && <p className="alias-error" role="alert">{lessonError}</p>}
                  <button className="primary-button" type="button" disabled={selectedAnswer !== 'choice' || isSavingLesson} onClick={() => completeLesson('01-case-for-privacy')}>{isSavingLesson ? 'SAVING…' : 'COMPLETE CHAPTER'} <span aria-hidden="true">→</span></button>
                </>}
              </div>
            </article>
          )}
        </section>
      </main>
    )
  }

  return (
    <main>
      <nav className="nav shell" aria-label="Primary navigation">
        <a className="wordmark" href="#top" aria-label="CypherSchool home">
          <img className="wordmark-mark" src={wordmarkSource} alt="" />
          <span>CYPHERSCHOOL</span>
        </a>
        {profile ? (
          <div className="learner-area">
            <p className="learner-welcome">WELCOME BACK, <strong>{profile.alias.toUpperCase()}</strong></p>
            <button className="profile-orb" type="button" onClick={() => setIsProfileOpen((open) => !open)} aria-expanded={isProfileOpen} aria-controls="learner-profile">
              <span className="profile-pfp" style={selectedAvatarStyle} aria-hidden="true" />
              <b>{profile.xp} XP</b>
            </button>
            {isProfileOpen && (
              <section className="learner-profile" id="learner-profile" aria-label="Your learning profile">
                <div className="profile-head"><span className="profile-avatar profile-pfp" style={selectedAvatarStyle} aria-hidden="true" /><div><p>ANONYMOUS LEARNER</p><h2>{profile.alias}</h2></div></div>
                <div className="profile-stats"><div><b>{profile.xp}</b><span>TOTAL XP</span></div><div><b>{chaptersRemaining}</b><span>CHAPTERS LEFT</span></div></div>
                <div className="medal-header"><span>CHAPTER MEDALS</span><span>{completedChapters} / {lessons.length}</span></div>
                <div className="medal-grid">{lessons.map((lesson) => {
                  const earned = completedLessonIds.includes(lesson.id)
                  return <div className={earned ? 'medal earned' : 'medal'} key={lesson.number} title={earned ? `${lesson.title} medal earned` : `${lesson.title} medal locked`}><span>{earned ? '✦' : lesson.number}</span><small>{earned ? 'EARNED' : 'LOCKED'}</small></div>
                })}</div>
                <p className="profile-privacy">YOUR ALIAS IS ONLY USED TO RESTORE THIS LEARNING PATH.</p>
                <button className="logout-button" type="button" onClick={logOut}>LOG OUT OF THIS DEVICE <span aria-hidden="true">↗</span></button>
              </section>
            )}
          </div>
        ) : <span className="nav-note">A PRIVACY LEARNING LAB</span>}
      </nav>
      {themeToggle}

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span />FINANCIAL PRIVACY SCHOOL</p>
          <h1 className="school-headline">Learn financial privacy.<br /><em>One short lesson at a time.</em></h1>
          <p className="hero-intro">
            Understand what money reveals, how privacy tools work, and where to begin.
          </p>
          <div className="hero-actions">
            <button className="primary-button" type="button" disabled={Boolean(profile && !isProgressLoaded)} onClick={() => beginLesson()}>
              {profile ? (isProgressLoaded ? continuePathLabel : 'LOADING YOUR PATH…') : 'ENTER THE LAB'} <span aria-hidden="true">→</span>
            </button>
          </div>
          <p className="privacy-note">No account. No wallet. No personal financial data.</p>
        </div>

        <div className="path-panel" aria-label="Seven chapter learning path">
          <div className="path-panel-head"><span>YOUR LEARNING PATH</span><span>{completedChapters} / 7 COMPLETE</span></div>
          <div className="path-list">{lessons.map((lesson) => {
            const complete = completedLessonIds.includes(lesson.id)
            const available = builtLessonIds.includes(lesson.id) && (lesson.id === '01-case-for-privacy' || (lesson.id === '02-what-your-money-reveals' && isLessonComplete) || (lesson.id === '03-tools-of-privacy' && completedLessonIds.includes('02-what-your-money-reveals')) || (lesson.id === '04-prove-without-revealing' && completedLessonIds.includes('03-tools-of-privacy')) || (lesson.id === '05-zcash-private-money' && completedLessonIds.includes('04-prove-without-revealing')) || (lesson.id === '06-arcium-private-computation' && completedLessonIds.includes('05-zcash-private-money')) || (lesson.id === '07-stealf' && completedLessonIds.includes('06-arcium-private-computation')))
            const next = nextLesson?.id === lesson.id
            return <button className={`path-row ${next ? 'next' : ''} ${complete ? 'complete' : ''}`} type="button" key={lesson.id} disabled={!available} onClick={() => available && beginLesson(lesson.id)}><b>{lesson.number}</b><span>{lesson.title}</span><small>{complete ? 'COMPLETE' : next ? 'NEXT' : available ? 'READY' : 'LOCKED'}</small><i aria-hidden="true">{available ? '›' : '×'}</i></button>
          })}</div>
        </div>
      </section>

      <section className="principle shell" aria-label="CypherSchool principle">
        <span className="principle-number">// MANIFESTO</span>
        <p>“Privacy is not <em>Secrecy.</em>” <small>— ERIC HUGHES, 9 MARCH 1993</small></p>
      </section>

      <section className="curriculum shell" id="curriculum">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><span />HOW CYPHERSCHOOL WORKS</p>
            <h2>Learn the ideas.<br />Keep your agency.</h2>
          </div>
        </div>

        <div className="how-grid">
          <article><span>01</span><h3>Short lessons</h3><p>Move through one focused idea at a time, then check your understanding before continuing.</p></article>
          <article><span>02</span><h3>Fictional scenarios</h3><p>Learn from safe examples, not real wallets, balances, identities, or personal financial data.</p></article>
          <article><span>03</span><h3>Your learning path</h3><p>Choose an alias to save XP and progress. Restore it anywhere with the recovery code you keep.</p></article>
        </div>
      </section>

      <section className="stewardship shell">
        <div className="stewardship-mark" aria-label="Stealf logo">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <path d="M16 47C16 27.7 31.7 12 51 12h37v15H51c-11 0-20 9-20 20H16Z" />
            <path d="M84 53c0 19.3-15.7 35-35 35H12V73h37c11 0 20-9 20-20h15Z" />
          </svg>
        </div>
        <div>
          <p className="eyebrow"><span />FROM PRINCIPLE TO PRACTICE</p>
          <h2>Understand the problem<br />before choosing the tools.</h2>
        </div>
        <p>CypherSchool uses fictional scenarios to build privacy literacy. The final chapter introduces Stealf as one practical application of private financial infrastructure.</p>
      </section>

      <section className="activity-feed shell" aria-live="polite" aria-label="Anonymous learning activity">
        <div className="activity-feed-head"><p className="eyebrow"><span />LIVE LEARNING SIGNAL</p><small>ANONYMOUS BY DESIGN</small></div>
        <div className="activity-list">
          {activity.length ? activity.map((event, index) => <article className="activity-event" key={`${event.createdAt}-${index}`}><span className="activity-pulse" /><strong>{event.publicLabel}</strong><p>{event.eventType === 'completed' ? 'just completed the Financial Privacy Course.' : 'just started a learning path.'}</p><time dateTime={event.createdAt}>{activityTime(event.createdAt)}</time></article>) : <p className="activity-empty">Waiting for the next anonymous learner to begin.</p>}
        </div>
        <p className="activity-privacy">A new random label is generated for each signal. It is never connected to an alias, profile, wallet, or recovery code.</p>
      </section>

      <footer className="footer footer-navigation shell">
        <div className="footer-columns">
          <section className="footer-brand"><a className="wordmark" href="/"><img className="wordmark-mark" src={wordmarkSource} alt="" /><span>CYPHERSCHOOL</span></a><p>Short, interactive lessons about financial privacy, zero-knowledge proofs, and private computation.</p></section>
          <section><p>SCHOOL</p><a href="#curriculum">LEARN</a><a href="/donate">SUPPORT CYPHERSCHOOL</a></section>
          <section><p>POLICIES</p><a href="/terms">TERMS OF SERVICE</a><a href="/privacy">PRIVACY POLICY</a><a href="/privacy-settings">PRIVACY SETTINGS</a></section>
          <section><p>INFO</p><a href="/faq">FAQS</a><a href="/blog">BLOG</a></section>
        </div>
        <div className="footer-meta"><small>© 2026 CYPHERSCHOOL</small><a href="#top">BACK TO TOP ↑</a></div>
      </footer>

      {isEntryChoiceOpen && (
        <div className="alias-overlay" role="presentation" onMouseDown={() => setIsEntryChoiceOpen(false)}>
          <section className="alias-dialog entry-choice" role="dialog" aria-modal="true" aria-labelledby="entry-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="dialog-close" type="button" onClick={() => setIsEntryChoiceOpen(false)} aria-label="Close entry dialog">×</button>
            <p className="eyebrow"><span />PRIVATE ENTRY</p>
            <p className="dialog-index">// CYPHERSCHOOL / 001</p>
            <h2 id="entry-title">Enter the<br /><em>lab.</em></h2>
            <p className="dialog-copy">Start a new learning path or pick up where you left off. CypherSchool never asks for an email, wallet, or personal information.</p>
            <div className="entry-actions">
              <button className="entry-option" type="button" onClick={openAliasDialog}>
                <span className="entry-option-index">01</span>
                <span><strong>CREATE LEARNING PROFILE</strong><small>Choose an alias and receive a recovery code.</small></span>
                <b aria-hidden="true">→</b>
              </button>
              <button className="entry-option" type="button" onClick={openRestoreDialog}>
                <span className="entry-option-index">02</span>
                <span><strong>RESTORE PROGRESS</strong><small>Use your saved alias and recovery code.</small></span>
                <b aria-hidden="true">→</b>
              </button>
            </div>
          </section>
        </div>
      )}

      {isAliasDialogOpen && (
        <div className="alias-overlay" role="presentation" onMouseDown={() => !newRecoveryCode && setIsAliasDialogOpen(false)}>
          <section className="alias-dialog" role="dialog" aria-modal="true" aria-labelledby="alias-title" onMouseDown={(event) => event.stopPropagation()}>
            {!newRecoveryCode && <button className="dialog-close" type="button" onClick={() => setIsAliasDialogOpen(false)} aria-label="Close alias dialog">×</button>}
            {newRecoveryCode ? (
              <div className="recovery-screen">
                <p className="eyebrow"><span />YOUR PRIVATE BACKUP</p>
                <p className="dialog-index">// CYPHERSCHOOL / RECOVERY</p>
                <h2 id="alias-title">Save your<br /><em>recovery code.</em></h2>
                <p className="dialog-copy">Use this code to restore your learning progress when you move to another browser or device.</p>
                <div className="recovery-code" aria-label={`Your recovery code is ${newRecoveryCode}`}>{newRecoveryCode}</div>
                <p className="recovery-warning">This is the only time CypherSchool will show this code.</p>
                <label className="recovery-check"><input type="checkbox" checked={hasSavedRecoveryCode} onChange={(event) => setHasSavedRecoveryCode(event.target.checked)} /><span>I have saved my recovery code.</span></label>
                <button className="primary-button dialog-submit" type="button" onClick={enterLab} disabled={!hasSavedRecoveryCode}>OPEN YOUR DASHBOARD <span aria-hidden="true">→</span></button>
              </div>
            ) : isRestoring ? (
              <>
                <button className="dialog-close" type="button" onClick={() => setIsAliasDialogOpen(false)} aria-label="Close restore dialog">×</button>
                <p className="eyebrow"><span />RETURN TO CYPHERSCHOOL</p>
                <p className="dialog-index">// CYPHERSCHOOL / RESTORE</p>
                <h2 id="alias-title">Restore your<br /><em>progress.</em></h2>
                <p className="dialog-copy">Enter the alias and recovery code you saved when you first entered the lab.</p>
                <button className="back-button" type="button" onClick={returnToEntryChoice}>← BACK TO ENTRY OPTIONS</button>
                <form onSubmit={restoreProfile}>
                  <label htmlFor="restore-alias">YOUR ALIAS</label>
                  <input id="restore-alias" name="alias" autoComplete="username" autoFocus maxLength={18} value={alias} onChange={(event) => setAlias(event.target.value)} placeholder="e.g. nocturne" />
                  <label className="recovery-input-label" htmlFor="recovery-code">RECOVERY CODE</label>
                  <input id="recovery-code" name="recovery-code" autoComplete="off" maxLength={32} value={recoveryCodeInput} onChange={(event) => setRecoveryCodeInput(event.target.value.toUpperCase())} placeholder="e.g. MINT-ORBIT-42" />
                  {aliasError && <p className="alias-error" role="alert">{aliasError}</p>}
                  <button className="primary-button dialog-submit" type="submit" disabled={isSavingProfile}>{isSavingProfile ? 'RESTORING…' : 'RESTORE MY PATH'} <span aria-hidden="true">→</span></button>
                </form>
              </>
            ) : (
              <>
                <p className="eyebrow"><span />PRIVATE ENTRY</p>
                <p className="dialog-index">// CYPHERSCHOOL / 001</p>
                <h2 id="alias-title">Choose your<br /><em>alias.</em></h2>
                <p className="dialog-copy">This is only your name inside the lab. It stays on this device with your lesson progress.</p>
                <button className="back-button" type="button" onClick={returnToEntryChoice}>← BACK TO ENTRY OPTIONS</button>
                <form onSubmit={createProfile}>
                  <label htmlFor="alias">YOUR ALIAS</label>
                  <input id="alias" name="alias" autoComplete="off" autoFocus maxLength={18} value={alias} onChange={(event) => setAlias(event.target.value)} placeholder="e.g. nocturne" />
                  {aliasError && <p className="alias-error" role="alert">{aliasError}</p>}
                  <p className="dialog-privacy">NO EMAIL · NO WALLET · NO PERSONAL DATA</p>
                  <button className="primary-button dialog-submit" type="submit" disabled={isSavingProfile}>{isSavingProfile ? 'CREATING PROFILE…' : 'CREATE MY LEARNING PROFILE'} <span aria-hidden="true">→</span></button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
