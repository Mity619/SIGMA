import { useState, useEffect } from 'react';
import './SCSS/NavBar.scss';

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container">
        {/* Logo */}
        <a href="/" className="navbar__logo">
          <div className="navbar__logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" stroke="#7C3AED" strokeWidth="2.5" fill="none" />
              <path
                d="M9 16.5L13.5 21L23 11"
                stroke="#7C3AED"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="navbar__logo-text">SIGMA</span>
        </a>

        {/* Nav Links */}
        <ul className="navbar__links">
          <li><a href="/noticias" className="navbar__link">Noticias</a></li>
          <li><a href="/about" className="navbar__link">¿Qué es SIGMA?</a></li>
          <li><a href="/SignIn" className="navbar__link">Inicia Sesión</a></li>
          <li>
            <a href="/SignUp" className="navbar__cta">
              Regístrate
            </a>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button className="navbar__hamburger" aria-label="Toggle menu">
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
};
