import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.svg'

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#approach', label: 'Approach' },
  { href: '#results', label: 'Results' },
]

export function LuxuryNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 22)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  return (
    <header className={`lux-navbar ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="home-luxury-shell lux-navbar-row">
        <Link to="/" className="lux-brand" aria-label="SkinCare by Aarzoo home" onClick={() => setIsMenuOpen(false)}>
          <span className="lux-brand-mark">
            <img src={logo} alt="SkinCare by Aarzoo logo" />
          </span>
          <span className="lux-brand-copy">
            <span className="lux-brand-title">SkinCare by Aarzoo</span>
            <span className="lux-brand-subtitle">Clinical Luxury</span>
          </span>
        </Link>

        <button
          type="button"
          className="lux-nav-toggle"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? 'Close' : 'Menu'}
        </button>

        <div className={`lux-nav-panel ${isMenuOpen ? 'open' : ''}`}>
          <nav className="lux-nav-links" aria-label="Home sections">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="lux-nav-link" onClick={() => setIsMenuOpen(false)}>
                {link.label}
              </a>
            ))}
          </nav>

          <Link to="/signup" className="lux-nav-cta" onClick={() => setIsMenuOpen(false)}>
            Get Started
          </Link>
        </div>
      </div>

      <button
        type="button"
        className={`lux-nav-backdrop ${isMenuOpen ? 'open' : ''}`}
        aria-label="Close navigation menu"
        onClick={() => setIsMenuOpen(false)}
      />
    </header>
  )
}
