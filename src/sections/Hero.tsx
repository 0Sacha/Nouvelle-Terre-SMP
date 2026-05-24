import './Hero.css'

export default function Hero() {
  return (
    <section className="hero" id="accueil">
      <div className="hero-glow" />
      <div className="container hero-inner">
        <div className="hero-badge">● Serveur en ligne</div>
        <h1 className="hero-title">
          Bienvenue sur<br />
          <span className="hero-title--accent">Nouvelle Terre</span>
        </h1>
        <p className="hero-sub">
          Serveur Minecraft RP avec launcher dédié. Installation automatique des mods,
          mises à jour simplifiées, et une expérience de jeu unique dans un monde vivant.
        </p>
        <div className="hero-actions">
          <a href="#telecharger" className="btn btn-primary">Télécharger le Launcher</a>
          <a href="#apropos" className="btn btn-outline">En savoir plus</a>
        </div>
      </div>
    </section>
  )
}
