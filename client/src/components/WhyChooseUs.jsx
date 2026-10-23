import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function WhyChooseUs() {
  const { t } = useLanguage();

  return (
    <section className="why-us-section section-pad" id="about">
      <div className="container">
        {/* Section Header */}
        <div className="why-us-header-centered">
          <div className="why-badge-pill">
            <i className="fa-solid fa-award"></i>
            <span>{t('whyChooseUsTitle')}</span>
          </div>
          <h2 className="why-headline-main">
            Kanpur's Most Trusted Laundry Care
          </h2>
          <p className="why-subtitle-main">
            Serving Kidwai Nagar, Kalyanpur, Kakadeo, Swaroop Nagar &amp; IIT Kanpur since 2010.
          </p>
        </div>

        {/* 2-Column Balanced Horizontal Grid */}
        <div className="why-us-balanced-grid">
          {/* Left Column: Smiling Indian Woman with Fresh Laundry */}
          <div className="why-visual-col">
            <div className="why-photo-wrapper">
              <img
                src="/why_us_woman.jpg"
                alt="Smiling Indian woman holding pristine folded laundry"
                className="why-photo-img"
                loading="lazy"
                onError={(e) => {
                  e.target.src = '/blankets.png';
                }}
              />
              <div className="why-floating-trust-tag">
                <div className="trust-tag-icon">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <div className="trust-tag-text">
                  <strong>14+ Years Serving Kanpur</strong>
                  <span>500+ Happy Families &amp; Students</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Core Features */}
          <div className="why-features-col">
            <div className="why-feature-card">
              <div className="why-feature-icon-box">
                <i className="fa-solid fa-medal"></i>
              </div>
              <div className="why-feature-details">
                <h3 className="why-feature-title">{t('experiencedTrusted')}</h3>
                <p className="why-feature-desc">{t('experiencedSub')}</p>
              </div>
            </div>

            <div className="why-feature-card">
              <div className="why-feature-icon-box">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div className="why-feature-details">
                <h3 className="why-feature-title">{t('safeHygienic')}</h3>
                <p className="why-feature-desc">{t('safeSub')}</p>
              </div>
            </div>

            <div className="why-feature-card">
              <div className="why-feature-icon-box">
                <i className="fa-solid fa-truck-fast"></i>
              </div>
              <div className="why-feature-details">
                <h3 className="why-feature-title">{t('onTimeDelivery')}</h3>
                <p className="why-feature-desc">{t('onTimeSub')}</p>
              </div>
            </div>

            <div className="why-feature-card">
              <div className="why-feature-icon-box">
                <i className="fa-solid fa-headset"></i>
              </div>
              <div className="why-feature-details">
                <h3 className="why-feature-title">{t('customerSupport')}</h3>
                <p className="why-feature-desc">{t('supportSub')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
