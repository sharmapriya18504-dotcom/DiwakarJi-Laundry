import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useConfig } from '../context/ConfigContext';
import FireworksCanvas from './FireworksCanvas';

export default function Hero() {
  const { theme } = useTheme();
  const { config, activeOffer, themeSettings } = useConfig();
  const isDiwali = theme === 'diwali';
  const showFireworks = isDiwali && (themeSettings ? themeSettings.fireworks_enabled : true);

  return (
    <section className="hero" id="home">
      {/* Background Fireworks (Subtle, Canvas-based, Zero Audio, Pointer-Events None) */}
      <FireworksCanvas enabled={showFireworks} />

      {/* Decorative Marigold Garlands Draped Across Top (Diwali Theme) */}
      {isDiwali && (
        <div className="marigold-garland" aria-hidden="true">
          <div className="garland-cord"></div>
          {Array.from({ length: 28 }).map((_, i) => (
            <span
              key={i}
              className={`marigold-flower ${i % 2 === 0 ? 'flower-orange' : 'flower-yellow'}`}
              style={{ animationDelay: `${(i * 0.1).toFixed(1)}s` }}
            ></span>
          ))}
        </div>
      )}

      {/* Hanging Festive Lanterns (Akasdeep / Kandil) */}
      {isDiwali && (
        <>
          <div className="hero-lantern lantern-left" aria-hidden="true">
            <div className="lantern-cord"></div>
            <svg className="lantern-svg" viewBox="0 0 60 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="30" cy="8" r="5" stroke="#F6C64A" strokeWidth="2" fill="none"/>
              <path d="M22 13 L38 13 L42 22 L18 22 Z" fill="#9a3412" stroke="#F6C64A" strokeWidth="1.2"/>
              <path d="M18 22 L42 22 L50 48 L10 48 Z" fill="url(#lanternL1)" stroke="#F6C64A" strokeWidth="1.5"/>
              <path d="M10 48 L50 48 L42 74 L18 74 Z" fill="url(#lanternL2)" stroke="#F6C64A" strokeWidth="1.5"/>
              <polygon points="30,28 44,48 30,68 16,48" fill="#fef08a" opacity="0.9" filter="drop-shadow(0 0 8px #f59e0b)"/>
              <path d="M22 74 L38 74 L35 80 L25 80 Z" fill="#9a3412" stroke="#F6C64A" strokeWidth="1.2"/>
              <line x1="25" y1="80" x2="22" y2="108" stroke="#F6C64A" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="30" y1="80" x2="30" y2="110" stroke="#fef08a" strokeWidth="2" strokeLinecap="round"/>
              <line x1="35" y1="80" x2="38" y2="108" stroke="#F6C64A" strokeWidth="1.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="lanternL1" x1="10" y1="22" x2="50" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#b91c1c"/>
                  <stop offset="50%" stopColor="#ea580c"/>
                  <stop offset="100%" stopColor="#991b1b"/>
                </linearGradient>
                <linearGradient id="lanternL2" x1="10" y1="48" x2="50" y2="74" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#7c2d12"/>
                  <stop offset="50%" stopColor="#ea580c"/>
                  <stop offset="100%" stopColor="#9a3412"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="hero-lantern lantern-right" aria-hidden="true">
            <div className="lantern-cord"></div>
            <svg className="lantern-svg" viewBox="0 0 60 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="30" cy="8" r="5" stroke="#F6C64A" strokeWidth="2" fill="none"/>
              <path d="M22 13 L38 13 L42 22 L18 22 Z" fill="#9a3412" stroke="#F6C64A" strokeWidth="1.2"/>
              <path d="M18 22 L42 22 L50 48 L10 48 Z" fill="url(#lanternR1)" stroke="#F6C64A" strokeWidth="1.5"/>
              <path d="M10 48 L50 48 L42 74 L18 74 Z" fill="url(#lanternR2)" stroke="#F6C64A" strokeWidth="1.5"/>
              <polygon points="30,28 44,48 30,68 16,48" fill="#fef08a" opacity="0.9" filter="drop-shadow(0 0 8px #f59e0b)"/>
              <path d="M22 74 L38 74 L35 80 L25 80 Z" fill="#9a3412" stroke="#F6C64A" strokeWidth="1.2"/>
              <line x1="25" y1="80" x2="22" y2="108" stroke="#F6C64A" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="30" y1="80" x2="30" y2="110" stroke="#fef08a" strokeWidth="2" strokeLinecap="round"/>
              <line x1="35" y1="80" x2="38" y2="108" stroke="#F6C64A" strokeWidth="1.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="lanternR1" x1="10" y1="22" x2="50" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#c2410c"/>
                  <stop offset="50%" stopColor="#f59e0b"/>
                  <stop offset="100%" stopColor="#9a3412"/>
                </linearGradient>
                <linearGradient id="lanternR2" x1="10" y1="48" x2="50" y2="74" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#9a3412"/>
                  <stop offset="50%" stopColor="#ea580c"/>
                  <stop offset="100%" stopColor="#7c2d12"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </>
      )}

      <div className="container">
        <div className="hero-grid-screenshot">
          {/* LEFT COLUMN: Typography, 3 Feature Badges & CTAs */}
          <div className="hero-left-screenshot">
            {isDiwali ? (
              <div className="hero-festive-badge">
                <span className="badge-flame">🪔</span>
                <span>{activeOffer?.badge_text || 'Happy Diwali'}</span>
                <span className="badge-flame">🪔</span>
              </div>
            ) : (
              <div className="hero-normal-badge">
                <span className="badge-dot"></span>
                <span>Serving Kanpur Since 2010</span>
              </div>
            )}

            <p className="hero-tagline-sub">
              {isDiwali
                ? (activeOffer?.subtitle || 'This Festival, Give Your Clothes the Care They Deserve')
                : "Kanpur's Trusted Fabric Care & Dry Cleaning"}
            </p>

            <h1 className="hero-headline-screenshot">
              Fresh Clothes.<br />
              <span className="gold-text">Fresh Feel.</span>
            </h1>

            <p className="hero-desc-screenshot">
              Professional laundry &amp; dry cleaning service in Kanpur with free doorstep pickup and delivery.
            </p>

            {/* 3 Feature Badges matching screenshot */}
            <div className="hero-badges-row">
              <div className="hero-badge-item">
                <span className="badge-icon-circle">
                  <i className="fa-solid fa-truck-fast"></i>
                </span>
                <span>Free Pickup &amp; Delivery</span>
              </div>

              <div className="hero-badge-item">
                <span className="badge-icon-circle">
                  <i className="fa-solid fa-sparkles"></i>
                </span>
                <span>Quality Cleaning</span>
              </div>

              <div className="hero-badge-item">
                <span className="badge-icon-circle">
                  <i className="fa-solid fa-clock"></i>
                </span>
                <span>On-Time Service</span>
              </div>
            </div>

            {/* CTAs matching screenshot: Gold 'Book a Pickup ➔' & Dark 'Explore Services' */}
            <div className="hero-ctas-screenshot">
              <a href="#booking" className="btn-gold-pill btn-lg-hero" id="hero-book-btn">
                <span>Book a Pickup</span>
                <i className="fa-solid fa-arrow-right"></i>
              </a>

              <a href="#services" className="btn-outline-pill btn-lg-hero" id="hero-explore-btn">
                <span>Explore Services</span>
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN: Folded Laundry on Brass Thali with Floating Diwali Special Seal */}
          <div className="hero-right-screenshot">
            <div className="hero-showcase-frame">
              <img
                src={isDiwali ? '/diwali_hero_stack.jpg' : '/hero_laundry.png'}
                alt="Diwakar Ji Laundry — Pristine folded laundry on festive brass platter"
                className="hero-main-photo"
                loading="eager"
              />

              {/* Ornate Circular Diwali Special Seal matching screenshot */}
              {isDiwali && (
                <div className="diwali-special-seal" aria-label="Diwali Special Seal">
                  <div className="seal-diya-top">🪔</div>
                  <div className="seal-title">{activeOffer?.title || '✦ Diwali Special ✦'}</div>
                  <div className="seal-subtitle">
                    {activeOffer?.discount_value ? `${activeOffer.discount_value}% OFF` : (activeOffer?.subtitle || 'Freshness for a brighter tomorrow')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


