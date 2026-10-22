import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useConfig } from '../context/ConfigContext';

export default function Hero() {
  const { theme } = useTheme();
  const { config } = useConfig();
  const [celebrated, setCelebrated] = useState(false);

  const isDiwali = theme === 'diwali';
  const showDiwaliDecor = isDiwali && (config?.settings?.diwali_decorations_enabled === 'true' || config?.settings?.diwali_decorations_enabled === true);
  const ownerPhone = config?.settings?.whatsapp_number || '917860462268';

  const handleDiyaClick = () => {
    setCelebrated(true);
    setTimeout(() => setCelebrated(false), 3500);
  };

  return (
    <section className="hero" id="home">
      {/* Rotating Lotus Rangoli Background Ornament for Diwali */}
      {showDiwaliDecor && (
        <svg className="hero-rangoli-mandala" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="200" cy="200" r="190" stroke="#f5c453" strokeWidth="1.5" strokeDasharray="6 6"/>
          <circle cx="200" cy="200" r="160" stroke="#f5c453" strokeWidth="1.2"/>
          <circle cx="200" cy="200" r="120" stroke="#f5c453" strokeWidth="1.5"/>
          <circle cx="200" cy="200" r="80" stroke="#f5c453" strokeWidth="1.2"/>
          <circle cx="200" cy="200" r="40" stroke="#f5c453" strokeWidth="1.5"/>
          <g stroke="#f5c453" strokeWidth="1.5" fill="none">
            <path d="M200 40 Q240 120 200 200 Q160 120 200 40Z" />
            <path d="M200 360 Q240 280 200 200 Q160 280 200 360Z" />
            <path d="M40 200 Q120 240 200 200 Q120 160 40 200Z" />
            <path d="M360 200 Q280 240 200 200 Q280 160 360 200Z" />
            <path d="M87 87 Q170 145 200 200 Q145 170 87 87Z" />
            <path d="M313 313 Q230 255 200 200 Q255 230 313 313Z" />
            <path d="M87 313 Q145 230 200 200 Q170 255 87 313Z" />
            <path d="M313 87 Q255 170 200 200 Q230 145 313 87Z" />
          </g>
          <circle cx="200" cy="200" r="14" fill="#f5c453" opacity="0.3"/>
        </svg>
      )}

      {/* Hanging Festive Lanterns (Akasdeep / Kandil) */}
      {showDiwaliDecor && (
        <>
          <div className="hero-lantern lantern-left" aria-hidden="true">
            <div className="lantern-cord"></div>
            <svg className="lantern-svg" viewBox="0 0 60 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="30" cy="8" r="5" stroke="#f5c453" strokeWidth="2" fill="none"/>
              <path d="M22 13 L38 13 L42 22 L18 22 Z" fill="#9a3412" stroke="#f5c453" strokeWidth="1.2"/>
              <path d="M18 22 L42 22 L50 48 L10 48 Z" fill="url(#lanternL1)" stroke="#f5c453" strokeWidth="1.5"/>
              <path d="M10 48 L50 48 L42 74 L18 74 Z" fill="url(#lanternL2)" stroke="#f5c453" strokeWidth="1.5"/>
              <polygon points="30,28 44,48 30,68 16,48" fill="#fef08a" opacity="0.85" filter="drop-shadow(0 0 8px #f59e0b)"/>
              <path d="M22 74 L38 74 L35 80 L25 80 Z" fill="#9a3412" stroke="#f5c453" strokeWidth="1.2"/>
              <line x1="25" y1="80" x2="22" y2="108" stroke="#f5c453" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="28" y1="80" x2="27" y2="102" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="30" y1="80" x2="30" y2="110" stroke="#fef08a" strokeWidth="2" strokeLinecap="round"/>
              <line x1="32" y1="80" x2="33" y2="102" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="35" y1="80" x2="38" y2="108" stroke="#f5c453" strokeWidth="1.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="lanternL1" x1="10" y1="22" x2="50" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#b91c1c"/>
                  <stop offset="50%" stopColor="#dc2626"/>
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
              <circle cx="30" cy="8" r="5" stroke="#f5c453" strokeWidth="2" fill="none"/>
              <path d="M22 13 L38 13 L42 22 L18 22 Z" fill="#9a3412" stroke="#f5c453" strokeWidth="1.2"/>
              <path d="M18 22 L42 22 L50 48 L10 48 Z" fill="url(#lanternR1)" stroke="#f5c453" strokeWidth="1.5"/>
              <path d="M10 48 L50 48 L42 74 L18 74 Z" fill="url(#lanternR2)" stroke="#f5c453" strokeWidth="1.5"/>
              <polygon points="30,28 44,48 30,68 16,48" fill="#fef08a" opacity="0.85" filter="drop-shadow(0 0 8px #f59e0b)"/>
              <path d="M22 74 L38 74 L35 80 L25 80 Z" fill="#9a3412" stroke="#f5c453" strokeWidth="1.2"/>
              <line x1="25" y1="80" x2="22" y2="108" stroke="#f5c453" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="28" y1="80" x2="27" y2="102" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="30" y1="80" x2="30" y2="110" stroke="#fef08a" strokeWidth="2" strokeLinecap="round"/>
              <line x1="32" y1="80" x2="33" y2="102" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="35" y1="80" x2="38" y2="108" stroke="#f5c453" strokeWidth="1.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="lanternR1" x1="10" y1="22" x2="50" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#4c1d95"/>
                  <stop offset="50%" stopColor="#7c3aed"/>
                  <stop offset="100%" stopColor="#5b21b6"/>
                </linearGradient>
                <linearGradient id="lanternR2" x1="10" y1="48" x2="50" y2="74" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#831843"/>
                  <stop offset="50%" stopColor="#db2777"/>
                  <stop offset="100%" stopColor="#9d174d"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </>
      )}

      <div className="container">
        <div className="hero-grid">
          {/* LEFT COLUMN: Editorial Atelier Typography & Actions */}
          <div className="hero-left">
            {/* Interactive Earthen Clay Diya Badge for Diwali Theme */}
            {showDiwaliDecor ? (
              <div
                className={`traditional-diya-hero ${celebrated ? 'celebrating' : ''}`}
                id="traditional-diya-hero"
                onClick={handleDiyaClick}
                title="Click me to celebrate Shubh Deepawali!"
                style={{ cursor: 'pointer' }}
              >
                <svg className="clay-diya-svg" viewBox="0 0 50 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="25" cy="14" rx="18" ry="12" fill="url(#haloGlowHero)" />
                  <path d="M7 26 C8 34 16 38 25 38 C34 38 42 34 43 26 C43 23 37 21 25 21 C13 21 7 23 7 26 Z" fill="url(#clayGradHero)" stroke="#7c2d12" strokeWidth="1"/>
                  <ellipse cx="25" cy="22" rx="18" ry="4" fill="url(#oilGradHero)" stroke="#f5c453" strokeWidth="0.8"/>
                  <path d="M22 21 C24 19 26 19 28 21 Z" fill="#9a3412"/>
                  <g className="diya-animated-flame">
                    <path d="M25 7 C21 14 20 18 25 21 C30 18 29 14 25 7 Z" fill="#ea580c"/>
                    <path d="M25 10 C22.5 15 22 17.5 25 20 C28 17.5 27.5 15 25 10 Z" fill="#fbbf24"/>
                    <path d="M25 13 C23.8 16 23.5 17.5 25 19 C26.5 17.5 26.2 16 25 13 Z" fill="#ffffff"/>
                  </g>
                  <defs>
                    <linearGradient id="clayGradHero" x1="7" y1="21" x2="43" y2="38" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#c2410c"/>
                      <stop offset="50%" stopColor="#9a3412"/>
                      <stop offset="100%" stopColor="#7c2d12"/>
                    </linearGradient>
                    <radialGradient id="oilGradHero" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#d97706"/>
                      <stop offset="70%" stopColor="#78350f"/>
                      <stop offset="100%" stopColor="#451a03"/>
                    </radialGradient>
                    <radialGradient id="haloGlowHero" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(254, 240, 138, 0.5)"/>
                      <stop offset="60%" stopColor="rgba(245, 196, 83, 0.2)"/>
                      <stop offset="100%" stopColor="transparent"/>
                    </radialGradient>
                  </defs>
                </svg>
                <div className="diya-badge-text">
                  <span className="diya-badge-main">
                    <span className="sparkle-star">✦</span> Shubh Deepavali 2026
                  </span>
                  <span className="diya-badge-sub">
                    {celebrated ? '✨ Shubh Deepawali ki Shubhkamnayein! ✨' : 'Kanpur ki Vishesh Festive Laundry Seva • Tap to Light ✨'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="reference-kicker">
                <span className="kicker-dot"></span>
                Kanpur's Trusted Laundry Atelier
              </div>
            )}

            {/* Editorial Serif Headline (Inspired by Reference: "Your clothes, our care, at your doorstep.") */}
            <h1 className="hero-headline">
              {isDiwali ? (
                <>
                  Celebrate Diwali,<br />
                  <em>we'll take care</em><br />
                  of your laundry.
                </>
              ) : (
                <>
                  Your clothes,<br />
                  <em>our care,</em><br />
                  at your doorstep.
                </>
              )}
            </h1>

            {/* Subtitle Pill with Icon (Matching Reference Image) */}
            <div className="subtitle-pill-wrapper">
              <div className="subtitle-icon-box" aria-hidden="true">
                <i className={isDiwali ? 'fa-solid fa-sparkles' : 'fa-regular fa-folder-closed'}></i>
              </div>
              <p className="subtitle-text">
                {isDiwali
                  ? 'Enjoy the festivities while we take care of your laundry needs. Free doorstep pickup & prompt delivery across Kanpur.'
                  : 'Convenient, reliable, and fabric-safe laundry services, delivered with quiet craftsmanship across Kanpur.'}
              </p>
            </div>

            {/* Action CTAs (Reference Pill Button + Secondary WhatsApp Action) */}
            <div className="hero-ctas-row">
              <a href="#booking" className="btn-pill" id="hero-schedule-btn">
                <span>{isDiwali ? 'Book a Pickup' : 'Schedule your pickup'}</span>
                <span className="arrow-icon">↗</span>
              </a>

              <a
                href={`https://wa.me/${ownerPhone}?text=${encodeURIComponent('Hello Diwakar Ji Laundry, I would like to inquire about laundry pickup in Kanpur.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pill"
                id="hero-wa-btn"
                style={{ borderColor: '#25D366', color: '#25D366' }}
              >
                <i className="fa-brands fa-whatsapp"></i>
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Kanpur Trusted Coverage Strip */}
            <div className="hero-areas-strip">
              <span>Trusted across Kanpur:</span>
              <span className="hero-area-tag">Kalyanpur</span>
              <span className="hero-area-tag">IIT Kanpur Gate</span>
              <span className="hero-area-tag">Kakadeo</span>
              <span className="hero-area-tag">Swaroop Nagar</span>
              <span className="hero-area-tag">Civil Lines</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Framed Showcase Card (Reference Composition) */}
          <div className="hero-right">
            <div className="hero-showcase-container">
              <img
                src="/hero_laundry.png"
                alt="Diwakar Ji Laundry Atelier — Clean laundry folded in modern laundry room"
                className="hero-showcase-image"
                loading="eager"
              />
              <div className="hero-image-overlay-badge">
                <i className="fa-solid fa-star" style={{ color: '#f5c453' }}></i>
                <span>4.9 / 5 • 500+ Kanpur Families</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

