import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useConfig } from '../context/ConfigContext';

export default function Header() {
  const { theme, switchTheme } = useTheme();
  const { config } = useConfig();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const ownerPhone = config?.settings?.whatsapp_number || '917860462268';
  const showDiwaliDecor = theme === 'diwali' && (config?.settings?.diwali_decorations_enabled === 'true' || config?.settings?.diwali_decorations_enabled === true);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header id="header" className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        {/* Atelier Logo — Matches Reference ("Launy" style) */}
        <Link to="/" className="logo" onClick={closeMenu}>
          <div className="logo-icon-svg" aria-hidden="true">
            <svg viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" width="42" height="42">
              <rect width="42" height="42" rx="10" fill={theme === 'diwali' ? '#2d144d' : '#0f172a'} />
              <rect x="1" y="1" width="40" height="40" rx="9" stroke={theme === 'diwali' ? '#f5c453' : '#334155'} strokeWidth="1.2" />
              <path d="M21 11 C21 11 21 9 22.8 8 C24.5 7 26 8.5 26 10.2 C26 11.5 24.8 12.5 23.5 12.5" stroke={theme === 'diwali' ? '#f5c453' : '#ffffff'} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
              <line x1="21" y1="11" x2="21" y2="17" stroke={theme === 'diwali' ? '#f5c453' : '#ffffff'} strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M21 17 C16 19 11 23 9 27" stroke={theme === 'diwali' ? '#f5c453' : '#ffffff'} strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M21 17 C26 19 31 23 33 27" stroke={theme === 'diwali' ? '#f5c453' : '#ffffff'} strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M9 27 Q21 30.5 33 27" stroke={theme === 'diwali' ? '#f5c453' : '#ffffff'} strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <div className="logo-text">
            <span className="logo-name">Diwakar Ji</span>
            <span className="logo-sub">LAUNDRY</span>
          </div>
        </Link>

        {/* Center Nav Links (Inspired by Reference: Home, About, Services, How It Works, Contact) */}
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`} id="nav-links">
          <a href="#home" className="nav-link active-link" onClick={closeMenu}>Home</a>
          <a href="#about" className="nav-link" onClick={closeMenu}>About</a>
          <a href="#services" className="nav-link" onClick={closeMenu}>Services</a>
          <a href="#how-it-works" className="nav-link" onClick={closeMenu}>How It Works</a>
          <a href="#pricing" className="nav-link" onClick={closeMenu}>Pricing</a>
          <a href="#contact" className="nav-link" onClick={closeMenu}>Contact</a>
        </nav>

        {/* Header Action Group: Theme Switcher Pill + Pill CTA Book Pickup ↗ */}
        <div className="header-actions-group">
          {/* Theme Switcher Pill */}
          <div className="theme-switch-pill" title="Switch Website Theme">
            <i className={theme === 'diwali' ? 'fa-solid fa-fire-flame-curved' : 'fa-regular fa-sun'} style={{ color: theme === 'diwali' ? '#f5c453' : '#2563eb', fontSize: '13px' }}></i>
            <select
              value={theme === 'diwali' ? 'diwali' : 'classic'}
              onChange={(e) => switchTheme(e.target.value)}
              aria-label="Switch Website Theme"
            >
              <option value="classic">Normal Daily</option>
              <option value="diwali">Special Diwali</option>
            </select>
          </div>

          {/* Reference Pill CTA Button (Book Pickup ↗) */}
          <a href="#booking" className="btn-pill" id="nav-book-pickup-btn">
            <span>Book Pickup</span>
            <span className="arrow-icon">↗</span>
          </a>

          {/* Mobile Hamburger Button */}
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      {/* Hanging Indian Fairy Lights Garland for Diwali */}
      {showDiwaliDecor && (
        <div className="fairy-lights-garland" id="fairy-lights" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} className="fairy-bulb"></span>
          ))}
        </div>
      )}
    </header>
  );
}

