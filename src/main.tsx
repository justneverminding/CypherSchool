import { FormEvent, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

type Lesson = {
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
  createdAt: string
  sessionToken: string
}

const profileStorageKey = 'cypherschool.profile'

const lessons: Lesson[] = [
  {
    number: '01',
    title: 'The Case for Privacy',
    description: 'Why privacy matters.',
    status: 'ready',
    mark: '◌',
  },
  {
    number: '02',
    title: 'What Your Money Reveals',
    description: 'What leaks without it.',
    status: 'locked',
    mark: '↗',
  },
  {
    number: '03',
    title: 'The Tools of Privacy',
    description: 'Cryptographic foundations.',
    status: 'locked',
    mark: '✦',
  },
  {
    number: '04',
    title: 'Prove Without Revealing',
    description: 'Zero knowledge.',
    status: 'locked',
    mark: '◇',
  },
  {
    number: '05',
    title: 'Zcash & Private Money',
    description: 'Private money with Zcash.',
    status: 'locked',
    mark: '₿',
  },
  {
    number: '06',
    title: 'Arcium & Private Computation',
    description: 'Private computation with Arcium.',
    status: 'locked',
    mark: '⌁',
  },
  {
    number: '07',
    title: 'Stealf',
    description: 'Stealf as the practical application.',
    status: 'locked',
    mark: 'S',
  },
]

function App() {
  const [profile, setProfile] = useState<LearnerProfile | null>(null)
  const [isAliasDialogOpen, setIsAliasDialogOpen] = useState(false)
  const [alias, setAlias] = useState('')
  const [aliasError, setAliasError] = useState('')
  const [newRecoveryCode, setNewRecoveryCode] = useState<string | null>(null)
  const [hasSavedRecoveryCode, setHasSavedRecoveryCode] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [isEntryChoiceOpen, setIsEntryChoiceOpen] = useState(false)
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  useEffect(() => {
    try {
      const savedProfile = window.localStorage.getItem(profileStorageKey)
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile) as Partial<LearnerProfile>
        if (parsedProfile.id && parsedProfile.alias && parsedProfile.sessionToken) setProfile(parsedProfile as LearnerProfile)
        else window.localStorage.removeItem(profileStorageKey)
      }
    } catch {
      window.localStorage.removeItem(profileStorageKey)
    }
  }, [])

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
    } catch {
      setAliasError('The learning service is unavailable. Please try again shortly.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  function enterLab() {
    setIsAliasDialogOpen(false)
    setNewRecoveryCode(null)
    document.querySelector('#curriculum')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main>
      <nav className="nav shell" aria-label="Primary navigation">
        <a className="wordmark" href="#top" aria-label="CypherSchool home">
          <span className="wordmark-mark">C</span>
          <span>CYPHERSCHOOL</span>
        </a>
        <span className="nav-note">{profile ? `WELCOME, ${profile.alias.toUpperCase()}` : 'A STEALF-POWERED PRIVACY LAB'}</span>
        <a className="nav-link" href="#curriculum">CURRICULUM <span aria-hidden="true">↘</span></a>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span />PRIVATE KNOWLEDGE, PUBLICLY USEFUL</p>
          <h1>Privacy is<br /><em>a skill.</em></h1>
          <p className="hero-intro">
            Short, interactive lessons for understanding what financial data reveals—and what cryptography can keep private.
          </p>
          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={profile ? openAliasDialog : openEntryChoice}>
              {profile ? 'CONTINUE YOUR PATH' : 'ENTER THE LAB'} <span aria-hidden="true">→</span>
            </button>
            <a className="text-link" href="#curriculum">EXPLORE THE PATH <span aria-hidden="true">↓</span></a>
          </div>
          <p className="privacy-note">No account. No wallet. No personal financial data.</p>
        </div>

        <div className="signal-panel" aria-label="Illustration of protected information">
          <div className="signal-topline"><span>LIVE LEARNING SYSTEM</span><span>FOUNDATION PATH</span></div>
          <div className="signal-orbit orbit-one" />
          <div className="signal-orbit orbit-two" />
          <div className="signal-core">
            <span className="core-symbol">⌁</span>
            <span>YOUR DATA<br />IS YOURS</span>
          </div>
          <span className="signal-label label-one">OBSERVE</span>
          <span className="signal-label label-two">PROVE</span>
          <span className="signal-label label-three">PROTECT</span>
          <div className="signal-footer"><span>FICTIONAL DATA ONLY</span><span className="pulse">●</span></div>
        </div>
      </section>

      <section className="principle shell" aria-label="CypherSchool principle">
        <span className="principle-number">// 001</span>
        <p>Financial privacy is not about having something to hide. It is about choosing what you reveal.</p>
      </section>

      <section className="curriculum shell" id="curriculum">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><span />THE FIRST PATH</p>
            <h2>Seven chapters.<br />One clearer view.</h2>
          </div>
          <p className="section-summary">From why privacy matters to Stealf as a practical application—one short, connected learning path.</p>
        </div>

        <div className="lesson-grid">
          {lessons.map((lesson) => (
            <article className={`lesson-card ${lesson.status}`} key={lesson.number}>
              <div className="lesson-meta"><span>LAB {lesson.number}</span><span className="lesson-mark">{lesson.mark}</span></div>
              <h3>{lesson.title}</h3>
              <p>{lesson.description}</p>
              <button className="lesson-action" type="button" disabled={lesson.status === 'locked'} onClick={lesson.status === 'ready' ? openAliasDialog : undefined}>
                {lesson.status === 'ready' ? 'BEGIN LESSON' : 'UNLOCKS NEXT'} <span aria-hidden="true">→</span>
              </button>
            </article>
          ))}
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
          <p className="eyebrow"><span />BUILT FOR STEALF</p>
          <h2>Understand the problem<br />before meeting the infrastructure.</h2>
        </div>
        <p>CypherSchool uses fictional scenarios to introduce financial privacy. The final lab will connect those ideas to Stealf’s dual-wallet approach and Arcium-powered private computation.</p>
      </section>

      <footer className="footer shell">
        <span>© 2026 CYPHERSCHOOL</span>
        <span>PRIVACY IS A PRACTICE.</span>
        <a href="#top">BACK TO TOP ↑</a>
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
                <button className="primary-button dialog-submit" type="button" onClick={enterLab} disabled={!hasSavedRecoveryCode}>BEGIN LAB 01 <span aria-hidden="true">→</span></button>
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
