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
  const showDiwaliDecor = theme === 'diwali';

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
        {/* Brand Logo matching screenshot: White Hanger in dark circle + Diwakar Ji Laundry */}
        <Link to="/" className="logo" onClick={closeMenu}>
          <div className="logo-badge-icon" aria-hidden="true">
            <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
              <circle cx="22" cy="22" r="21" fill="#0A2547" stroke="#F6C64A" strokeWidth="1.2" />
              <path d="M22 11 C22 11 22 9 23.8 8 C25.5 7 27 8.5 27 10.2 C27 11.5 25.8 12.5 24.5 12.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              <line x1="22" y1="11" x2="22" y2="17" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
              <path d="M22 17 C17 19 12 23 10 27" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              <path d="M22 17 C27 19 32 23 34 27" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              <path d="M10 27 Q22 30.5 34 27" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <div className="logo-text">
            <span className="logo-name">Diwakar Ji</span>
            <span className="logo-sub">Laundry</span>
          </div>
        </Link>

        {/* Center Nav Links matching screenshot: Home, Services, Pricing, About Us, Reviews, Contact */}
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`} id="nav-links">
          <a href="#home" className="nav-link active-link" onClick={closeMenu}>Home</a>
          <a href="#services" className="nav-link" onClick={closeMenu}>Services</a>
          <a href="#pricing" className="nav-link" onClick={closeMenu}>Pricing</a>
          <a href="#about" className="nav-link" onClick={closeMenu}>About Us</a>
          <a href="#reviews" className="nav-link" onClick={closeMenu}>Reviews</a>
          <a href="#contact" className="nav-link" onClick={closeMenu}>Contact</a>
        </nav>

        {/* Header Action Group: WhatsApp Pill + Book a Pickup Gold Button + Theme Toggle */}
        <div className="header-actions-group">
          {/* WhatsApp Contact Pill matching screenshot */}
          <a
            href={`https://wa.me/${ownerPhone}?text=${encodeURIComponent('Hello Diwakar Ji Laundry, I would like to inquire about laundry pickup in Kanpur.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="header-wa-pill"
            id="header-wa-pill"
          >
            <span className="wa-icon-circle">
              <i className="fa-brands fa-whatsapp"></i>
            </span>
            <div className="wa-text-col">
              <span className="wa-label">WhatsApp</span>
              <span className="wa-number">+91 7860462268</span>
            </div>
          </a>

          {/* Gold Pill CTA Button matching screenshot */}
          <a href="#booking" className="btn-gold-pill" id="nav-book-pickup-btn">
            Book a Pickup
          </a>

          {/* Theme Switcher Toggle Pill */}
          <div className="theme-toggle-switch" title="Toggle Theme (Normal / Diwali)">
            <button
              type="button"
              className={`theme-toggle-btn ${theme !== 'diwali' ? 'active' : ''}`}
              onClick={() => switchTheme('classic')}
              title="Normal Daily Theme"
            >
              Normal
            </button>
            <button
              type="button"
              className={`theme-toggle-btn ${theme === 'diwali' ? 'active' : ''}`}
              onClick={() => switchTheme('diwali')}
              title="Diwali Special Theme"
            >
              🪔 Diwali
            </button>
          </div>

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
    </header>
  );
}


