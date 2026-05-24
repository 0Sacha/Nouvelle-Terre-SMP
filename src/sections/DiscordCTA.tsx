import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'
import './DiscordCTA.css'

export default function DiscordCTA() {
  return (
    <section className="discord-cta">
      <div className="container discord-cta-inner">
        <h2 className="discord-cta-title">Rejoignez notre communauté Discord !</h2>
        <a href="#" className="btn btn-discord">
          <FontAwesomeIcon icon={faDiscord} />
          Rejoindre le Discord
        </a>
      </div>
    </section>
  )
}
