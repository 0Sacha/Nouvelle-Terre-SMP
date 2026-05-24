import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoins, faBookOpen, faUsers, faMountain } from '@fortawesome/free-solid-svg-icons'
import './About.css'

const PILLARS = [
  {
    icon: faCoins,
    title: 'Une économie joueur réelle',
    desc: 'Chaque ressource a de la valeur. Le marché est entièrement géré par les joueurs et leurs alliances.',
  },
  {
    icon: faBookOpen,
    title: 'Un lore narratif vivant',
    desc: 'L\'histoire évolue en fonction de vos actions. Chaque décision collective façonne le monde.',
  },
  {
    icon: faUsers,
    title: 'Un Conseil des Fondateurs',
    desc: 'Les joueurs les plus impliqués participent aux décisions majeures du serveur.',
  },
  {
    icon: faMountain,
    title: 'Des ruines à explorer',
    desc: 'Un monde ancien attend d\'être découvert. Artefacts, secrets et dangers vous y attendent.',
  },
]

export default function About() {
  return (
    <section className="about" id="apropos">
      <div className="container">
        <div className="about-header">
          <p className="section-label">À propos</p>
          <h2 className="section-title">À propos de Nouvelle Terre</h2>
        </div>

        <div className="about-intro">
          <p>
            Un serveur Minecraft RP où la vie, le travail et la politique façonnent une civilisation en devenir.
          </p>
          <p>
            Tout commence avec le <em>Velkor</em> — une nef échouée sur un continent inconnu. Des survivants
            que rien ne rapprochait. Ils fondent Nouvelle Terre, rédigent la Charte collective et s'organisent
            en Discord comme norme.
          </p>
          <p>
            Ce qui paraissait anex, c'est qu'ils allaient bientôt trouver d'autres traces sous la terre…
          </p>
        </div>

        <div className="about-grid">
          {PILLARS.map(p => (
            <div key={p.title} className="about-card">
              <div className="about-icon">
                <FontAwesomeIcon icon={p.icon} />
              </div>
              <h3 className="about-card-title">{p.title}</h3>
              <p className="about-card-desc">{p.desc}</p>
            </div>
          ))}
        </div>

        <blockquote className="about-quote">
          <p>
            "Lorsque le Velkor s'échoua sur ces rivages nouveaux, nous n'étions que des naufragés.
            C'est en signant la Charte que nous sommes devenus des citoyens."
          </p>
          <cite>— Nouvelle Terre</cite>
        </blockquote>

        <p className="about-tagline">
          Nouvelle Terre n'est pas un serveur où on joue sur Minecraft.<br />
          <strong>C'est un serveur où on joue dans un monde.</strong>
        </p>
      </div>
    </section>
  )
}
