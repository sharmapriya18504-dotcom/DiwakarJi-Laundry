import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useConfig } from '../context/ConfigContext';
import { useLanguage } from '../context/LanguageContext';

export default function Hero() {
  const { theme } = useTheme();
  const { config, activeOffer } = useConfig();
  const { t } = useLanguage();
  const isDiwali = theme === 'diwali';

  return (
    <section className="hero" id="home">

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

      <div className="container">
        <div className="hero-grid-screenshot">
          {/* LEFT COLUMN: Typography, 3 Feature Badges & CTAs */}
          <div className="hero-left-screenshot">
            {isDiwali ? (
              <div className="hero-festive-badge">
                <span className="badge-flame" style={{ color: '#f6c64a' }}>✨</span>
                <span>{activeOffer?.badge_text || 'Happy Diwali'}</span>
                <span className="badge-flame" style={{ color: '#f6c64a' }}>✨</span>
              </div>
            ) : (
              <div className="hero-normal-badge">
                <span className="badge-dot"></span>
                <span>{t('servingKanpur')}</span>
              </div>
            )}

            <p className="hero-tagline-sub">
              {isDiwali
                ? (activeOffer?.subtitle || 'This Festival, Give Your Clothes the Care They Deserve')
                : "Kanpur's Trusted Fabric Care & Dry Cleaning"}
            </p>

            <h1 className="hero-headline-screenshot">
              {t('heroHeadline1')}<br />
              <span className="gold-text">{t('heroHeadline2')}</span>
            </h1>

            <p className="hero-desc-screenshot">
              {t('heroSub')}
            </p>

            {/* 3 Feature Badges matching screenshot */}
            <div className="hero-badges-row">
              <div className="hero-badge-item">
                <span className="badge-icon-circle">
                  <i className="fa-solid fa-truck-fast"></i>
                </span>
                <span>{t('freePickupBadge')}</span>
              </div>

              <div className="hero-badge-item">
                <span className="badge-icon-circle" title={t('qualityCleaningBadge')}>
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                </span>
                <span>{t('qualityCleaningBadge')}</span>
              </div>

              <div className="hero-badge-item">
                <span className="badge-icon-circle">
                  <i className="fa-solid fa-clock"></i>
                </span>
                <span>{t('onTimeBadge')}</span>
              </div>
            </div>

            {/* CTAs matching screenshot: Gold 'Book a Pickup ➔' & Dark 'Explore Services' */}
            <div className="hero-ctas-screenshot">
              <a href="#booking" className="btn-gold-pill btn-lg-hero" id="hero-book-btn">
                <span>{t('bookPickup')}</span>
                <i className="fa-solid fa-arrow-right"></i>
              </a>

              <a href="#services" className="btn-outline-pill btn-lg-hero" id="hero-explore-btn">
                <span>{t('exploreServices')}</span>
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN: Folded Laundry on Brass Thali with Floating Diwali Special Seal */}
          <div className="hero-right-screenshot">
            <div className="hero-showcase-frame">
              <img
                src={
                  isDiwali
                    ? (config?.settings?.hero_image_diwali || '/assets/campaigns/diwali-hero.webp')
                    : (config?.settings?.hero_image_normal || '/assets/laundry/hero-laundry.webp')
                }
                alt="Diwakar Ji Laundry — Pristine folded laundry on festive brass platter"
                className="hero-main-photo"
                loading="eager"
                onError={(e) => {
                  if (e.target.src.includes('.webp')) {
                    e.target.src = isDiwali ? '/diwali_hero_stack.jpg' : '/hero_laundry.png';
                  }
                }}
              />

              {/* Ornate Circular Diwali Special Seal matching screenshot */}
              {isDiwali && (
                <div className="diwali-special-seal" aria-label="Diwali Special Seal">
                  <div className="seal-diya-top" style={{ color: '#f6c64a' }}>
                    <i className="fa-solid fa-crown"></i>
                  </div>
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


