import { useState, useEffect } from 'react'
import './Navbar.css'

const LINKS = [
  { href: '#accueil',         label: 'Accueil' },
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#telecharger',     label: 'Télécharger' },
  { href: '#apropos',         label: 'À propos' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar-inner">
        <span className="navbar-logo">NT</span>
        <ul className="navbar-links">
          {LINKS.map(l => (
            <li key={l.href}>
              <a href={l.href} className="navbar-link">{l.label}</a>
            </li>
          ))}
        </ul>
        <a href="#telecharger" className="btn btn-primary navbar-cta">Télécharger</a>
      </div>
    </nav>
  )
}
