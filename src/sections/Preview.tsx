import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import './Preview.css'

const SLIDES = [
  {
    label: 'Interface moderne',
    desc: 'Une interface épurée et intuitive pour gérer votre expérience RP sans effort.',
  },
  {
    label: 'Mises à jour auto',
    desc: 'Le launcher se synchronise automatiquement avec le serveur à chaque lancement.',
  },
  {
    label: 'Multi comptes',
    desc: 'Gérez facilement plusieurs profils Minecraft depuis une seule application.',
  },
]

export default function Preview() {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent(i => (i - 1 + SLIDES.length) % SLIDES.length)
  const next = () => setCurrent(i => (i + 1) % SLIDES.length)

  return (
    <section className="preview">
      <div className="container">
        <div className="preview-header">
          <p className="section-label">Aperçu</p>
          <h2 className="section-title">Découvrez le Launcher</h2>
          <p className="section-sub">Une interface moderne et intuitive pour gérer votre expérience RP.</p>
        </div>

        <div className="preview-card">
          <div className="preview-topbar">
            <span className="preview-dot" />
            <span className="preview-dot" />
            <span className="preview-dot" />
          </div>
          <div className="preview-screen">
            <div className="preview-placeholder">
              <div className="preview-sidebar">
                {['🏠','🎮','📦','👥','🗺','👤'].map((icon, i) => (
                  <div key={i} className={`preview-sidebar-icon ${i === 0 ? 'active' : ''}`}>{icon}</div>
                ))}
              </div>
              <div className="preview-content">
                <div className="preview-content-bar" />
                <div className="preview-content-bar short" />
                <div className="preview-content-block" />
                <div className="preview-content-block tall" />
              </div>
            </div>
          </div>
        </div>

        <div className="preview-controls">
          <button className="preview-btn" onClick={prev}>
            <FontAwesomeIcon icon={faChevronLeft} />
            Précédent
          </button>
          <div className="preview-dots">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`preview-pip ${i === current ? 'preview-pip--active' : ''}`}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
          <button className="preview-btn" onClick={next}>
            Suivant
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>

        <div className="preview-slides">
          {SLIDES.map((s, i) => (
            <div key={i} className={`preview-slide ${i === current ? 'preview-slide--active' : ''}`}>
              <strong className="preview-slide-label">{s.label}</strong>
              <p className="preview-slide-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
