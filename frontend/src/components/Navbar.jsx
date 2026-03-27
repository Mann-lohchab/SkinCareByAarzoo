import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MenuIcon, XIcon } from './Icons'
import logo from '../assets/logo.svg'
import '../style/Navbar.css'

export function Navbar() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '#philosophy', label: 'Philosophy' },
    { path: '#approach', label: 'Approach' },
    { path: '#pillars', label: 'Pillars' },
  ]

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const isActive = (path) => {
    if (path.startsWith('#')) {
      return location.hash === path
    }

    return location.pathname === path
  }

  return (
    <>
      <nav className="navbar-shell">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand" aria-label="SkinCare By Aarzoo home">
            <span className="navbar-brand-mark">
              <img src={logo} alt="SkinCare By Aarzoo Logo" style={{ width: 60, height: 60 }} />
            </span>
            <span className="navbar-brand-copy">
              <span className="navbar-brand-title">SkinCare By Aarzoo</span>
              <span className="navbar-brand-subtitle">Evidence-led skin care</span>
            </span>
          </Link>

          <div className="navbar-links">
            {navLinks.map((link) =>
              link.path.startsWith('#') ? (
                <a
                  key={link.path}
                  href={link.path}
                  className={`navbar-link ${isActive(link.path) ? 'active' : ''}`}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`navbar-link ${isActive(link.path) ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          <div className="navbar-actions">
            <Link to="/dashboard" className="navbar-cta">
              Get Started
            </Link>
            <button
              type="button"
              className="navbar-toggle"
              onClick={() => setIsOpen((open) => !open)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      <div className={`navbar-mobile-backdrop ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />

      <div className={`navbar-mobile-panel ${isOpen ? 'open' : ''}`}>
        <div className="navbar-mobile-links">
          {navLinks.map((link) =>
            link.path.startsWith('#') ? (
              <a
                key={link.path}
                href={link.path}
                className={`navbar-mobile-link ${isActive(link.path) ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar-mobile-link ${isActive(link.path) ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        <Link to="/dashboard" className="navbar-mobile-cta" onClick={() => setIsOpen(false)}>
          Launch Dashboard
        </Link>
      </div>
    </>
  )
}
