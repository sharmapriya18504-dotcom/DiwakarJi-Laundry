import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function Header({ onOpenTracking }) {
  const { config } = useConfig();
  const { lang, setLang, t } = useLanguage();
  const { theme, switchTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const ownerPhone = config?.settings?.whatsapp_number || '917860462268';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header id="header" className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        {/* Brand Logo */}
        <Link to="/" className="logo" onClick={closeMenu}>
          <div className="logo-badge-icon" aria-hidden="true">
            <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
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

        {/* Center Nav Links - Strictly 1 Line, No Word Wrapping */}
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`} id="nav-links">
          <a href="#home" className="nav-link active-link" onClick={closeMenu}>
            <span>{t('home')}</span>
          </a>
          <a href="#services" className="nav-link" onClick={closeMenu}>
            <span>{t('services')}</span>
          </a>
          <a href="#pricing" className="nav-link" onClick={closeMenu}>
            <span>{t('pricing')}</span>
          </a>
          <a href="#how-it-works" className="nav-link" onClick={closeMenu}>
            <span>{t('howItWorks')}</span>
          </a>
          <a href="#about" className="nav-link" onClick={closeMenu}>
            <span>{t('whyChooseUs')}</span>
          </a>
          <a href="#reviews" className="nav-link" onClick={closeMenu}>
            <span>{t('reviews')}</span>
          </a>
          <button
            type="button"
            className="nav-link track-order-nav-btn"
            onClick={() => {
              closeMenu();
              if (onOpenTracking) onOpenTracking();
            }}
          >
            <i className="fa-solid fa-truck-fast"></i>
            <span>{t('trackOrder')}</span>
          </button>
          <a href="#contact" className="nav-link" onClick={closeMenu}>
            <span>{t('contact')}</span>
          </a>
          {/* Mobile Drawer Book Pickup CTA */}
          <a
            href="#booking"
            className="mobile-menu-cta-btn"
            onClick={closeMenu}
            style={{
              marginTop: '14px',
              padding: '12px 20px',
              borderRadius: '50px',
              background: 'linear-gradient(135deg, #f5c453 0%, #e6a827 100%)',
              color: '#0c1424',
              fontWeight: 800,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(245, 196, 83, 0.4)'
            }}
          >
            <span>{t('bookPickup')}</span>
            <i className="fa-solid fa-arrow-right"></i>
          </a>
        </nav>

        {/* Right Header Actions */}
        <div className="header-actions-group">
          {/* Dark / Light Mode Switcher Pill */}
          <button
            type="button"
            className="lang-switcher-pill theme-mode-pill"
            onClick={() => switchTheme(theme === 'light' ? 'classic' : 'light')}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            <i className={theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun'}></i>
            <span className="pill-text-desktop">{theme === 'light' ? 'Dark' : 'Light'}</span>
          </button>

          {/* Language Switcher Pill (EN / HI) */}
          <button
            type="button"
            className="lang-switcher-pill"
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            title={lang === 'en' ? 'Switch to Hindi / हिंदी में देखें' : 'Switch to English'}
          >
            <i className="fa-solid fa-globe"></i>
            <span>{lang === 'en' ? 'HI' : 'EN'}</span>
          </button>

          {/* Verified WhatsApp Contact Pill (Single Line, Desktop Only) */}
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
            <span className="wa-number-single">+91 7860462268</span>
          </a>

          {/* Book Pickup Gold CTA (Desktop Only, hidden on mobile) */}
          <a href="#booking" className="btn-gold-pill nav-cta-desktop" id="nav-book-pickup-btn">
            <span>{t('bookPickup')}</span>
            <i className="fa-solid fa-arrow-right"></i>
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
    </header>
  );
}
