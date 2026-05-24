import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDownload, faRotate, faScroll,
  faMap, faSlidersH, faNewspaper,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import './Features.css'

const FEATURES: { icon: IconDefinition; title: string; desc: string }[] = [
  {
    icon: faDownload,
    title: 'Installation Automatique',
    desc: 'Téléchargez et installez automatiquement tous les mods requis en un seul clic, sans configuration manuelle.',
  },
  {
    icon: faRotate,
    title: 'Mises à Jour Serveur',
    desc: 'Restez toujours à jour. Le launcher détecte et applique automatiquement toutes les mises à jour du serveur.',
  },
  {
    icon: faScroll,
    title: 'Fiches Personnages',
    desc: 'Consultez les fiches de tous les personnages du serveur directement depuis votre launcher.',
  },
  {
    icon: faMap,
    title: 'Carte Interactive',
    desc: 'Explorez la carte du serveur et repérez vos points d\'intérêt avant même de vous connecter.',
  },
  {
    icon: faSlidersH,
    title: 'Configuration Avancée',
    desc: 'Personnalisez la RAM allouée, les arguments JVM et le chemin Java pour optimiser vos performances.',
  },
  {
    icon: faNewspaper,
    title: 'Actualités en Direct',
    desc: 'Suivez les dernières nouvelles du serveur et les annonces des administrateurs directement dans le launcher.',
  },
]

export default function Features() {
  return (
    <section className="features" id="fonctionnalites">
      <div className="container">
        <div className="features-header">
          <p className="section-label">Fonctionnalités</p>
          <h2 className="section-title">Fonctionnalités du Launcher</h2>
          <p className="section-sub">Tout ce dont vous avez besoin pour une expérience RP optimale.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">
                <FontAwesomeIcon icon={f.icon} />
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
