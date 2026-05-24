import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWindows } from '@fortawesome/free-brands-svg-icons'
import { faDownload, faCheck } from '@fortawesome/free-solid-svg-icons'
import './Download.css'

const REQUIREMENTS = [
  { label: 'RAM', value: '8 Go recommandés' },
  { label: 'Java', value: 'Version 21 ou supérieure' },
  { label: 'Espace Disque', value: '3 Go disponibles' },
  { label: 'Minecraft', value: 'Compte officiel requis' },
]

export default function Download() {
  return (
    <section className="download" id="telecharger">
      <div className="container">
        <div className="download-header">
          <p className="section-label">Téléchargement</p>
          <h2 className="section-title">Télécharger le Launcher</h2>
          <p className="section-sub">Version 1.0.0 · Compatible Fabric 1.20.1</p>
        </div>

        <div className="download-card">
          <div className="download-os-icon">
            <FontAwesomeIcon icon={faWindows} />
          </div>
          <h3 className="download-os-name">Windows</h3>
          <p className="download-os-meta">64-bit · Version 10 ou supérieure</p>
          <a href="#" className="btn btn-primary download-btn">
            <FontAwesomeIcon icon={faDownload} />
            Télécharger pour Windows
          </a>
        </div>

        <div className="download-requirements">
          <h4 className="requirements-title">Configuration Requise</h4>
          <ul className="requirements-list">
            {REQUIREMENTS.map(r => (
              <li key={r.label} className="requirements-item">
                <FontAwesomeIcon icon={faCheck} className="requirements-check" />
                <span><strong>{r.label} :</strong> {r.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
