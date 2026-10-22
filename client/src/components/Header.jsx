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
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header id="header" className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        <Link to="/" className="logo" onClick={closeMenu}>
          <div className="logo-icon">
            <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
              <circle cx="26" cy="26" r="26" fill="url(#logoGrad)"/>
              <path d="M26 10 C26 10 26 8 28 7 C30 6 32 7.5 32 9.5 C32 11 30.5 12 29 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              <line x1="26" y1="10" x2="26" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M26 18 C20 20 12 25 10 30" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M26 18 C32 20 40 25 42 30" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M10 30 Q26 34 42 30" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M29 12 C31 10 35 10 35 13 C35 16 31 17 29 15 C27 13 29 12 29 12Z" fill="#4ade80"/>
              <path d="M29 12 C32 13.5 29 15 29 15" stroke="#22c55e" strokeWidth="0.8" strokeLinecap="round"/>
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1a3a5c"/>
                  <stop offset="100%" stopColor="#10243A"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="logo-text">
            <span className="logo-name">Diwakar Ji</span>
            <span className="logo-sub">LAUNDRY</span>
          </div>
        </Link>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`} id="nav-links">
          <a href="#services" className="nav-link" onClick={closeMenu}>Services</a>
          <a href="#pricing" className="nav-link" onClick={closeMenu}>Pricing</a>
          <a href="#how-it-works" className="nav-link" onClick={closeMenu}>How It Works</a>
          <a href="#reviews" className="nav-link" onClick={closeMenu}>Reviews</a>
          <a href="#faq" className="nav-link" onClick={closeMenu}>FAQ</a>
        </nav>

        {/* Live Theme Switcher Dropdown Badge */}
        <div className="header-theme-selector" title="Preview Theme">
          <i className="fa-solid fa-palette theme-icon"></i>
          <select
            value={theme}
            onChange={(e) => switchTheme(e.target.value)}
            aria-label="Switch Theme Preview"
          >
            <option value="diwali">🪔 Shubh Diwali</option>
            <option value="classic">🌊 Classic Ocean</option>
            <option value="royal_gold">👑 Royal Gold</option>
            <option value="fresh_mint">🍃 Fresh Mint</option>
          </select>
        </div>

        <a
          href={`https://wa.me/${ownerPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp header-wa-btn"
        >
          <i className="fa-brands fa-whatsapp"></i>
          Book on WhatsApp
        </a>

        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span></span><span></span><span></span>
        </button>
      </div>

      {/* Fairy Lights Garland */}
      {showDiwaliDecor && (
        <div className="fairy-lights-garland" id="fairy-lights" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="fairy-bulb"></span>
          ))}
        </div>
      )}
    </header>
  );
}
