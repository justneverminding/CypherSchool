import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

type Lesson = {
  number: string
  title: string
  description: string
  status: 'ready' | 'locked'
  mark: string
}

const lessons: Lesson[] = [
  {
    number: '01',
    title: 'Financial Exposure',
    description: 'Follow a fictional payment trail and see what public activity can quietly reveal.',
    status: 'ready',
    mark: '↗',
  },
  {
    number: '02',
    title: 'Prove Without Revealing',
    description: 'Learn the shape of a zero-knowledge proof by protecting a secret in plain sight.',
    status: 'locked',
    mark: '◇',
  },
  {
    number: '03',
    title: 'Private Computation',
    description: 'Explore how a useful answer can exist without exposing the underlying data.',
    status: 'locked',
    mark: '✦',
  },
]

function App() {
  const [isStarting, setIsStarting] = useState(false)

  function beginSession() {
    setIsStarting(true)
    window.setTimeout(() => setIsStarting(false), 1700)
  }

  return (
    <main>
      <nav className="nav shell" aria-label="Primary navigation">
        <a className="wordmark" href="#top" aria-label="CypherSchool home">
          <span className="wordmark-mark">C</span>
          <span>CYPHERSCHOOL</span>
        </a>
        <span className="nav-note">A STEALF-POWERED PRIVACY LAB</span>
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
            <button className="primary-button" type="button" onClick={beginSession} disabled={isStarting}>
              {isStarting ? 'INITIALIZING LAB…' : 'ENTER THE LAB'} <span aria-hidden="true">→</span>
            </button>
            <a className="text-link" href="#curriculum">EXPLORE THE PATH <span aria-hidden="true">↓</span></a>
          </div>
          <p className="privacy-note">No account. No wallet. No personal financial data.</p>
        </div>

        <div className="signal-panel" aria-label="Illustration of protected information">
          <div className="signal-topline"><span>LIVE LEARNING SYSTEM</span><span>01 / 03</span></div>
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
            <h2>Three lessons.<br />One clearer view.</h2>
          </div>
          <p className="section-summary">Begin with the visible traces of a transaction. Finish by seeing how a private answer can be computed.</p>
        </div>

        <div className="lesson-grid">
          {lessons.map((lesson) => (
            <article className={`lesson-card ${lesson.status}`} key={lesson.number}>
              <div className="lesson-meta"><span>LAB {lesson.number}</span><span className="lesson-mark">{lesson.mark}</span></div>
              <h3>{lesson.title}</h3>
              <p>{lesson.description}</p>
              <button className="lesson-action" type="button" disabled={lesson.status === 'locked'}>
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
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
