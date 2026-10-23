import React, { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useTheme } from '../context/ThemeContext';

export default function FestiveBanner() {
  const { config, activeOffer } = useConfig();
  const { theme } = useTheme();
  const [closed, setClosed] = useState(false);

  const isEnabled =
    config?.settings?.festive_banner_enabled === 'true' ||
    config?.settings?.festive_banner_enabled === true ||
    theme === 'diwali';

  if (!isEnabled || closed) return null;

  const title = activeOffer?.title || 'Diwali Festive Fabric Care Special';
  const desc =
    activeOffer?.description ||
    activeOffer?.subtitle ||
    'Flat 15% OFF on all Dry Cleaning & Steam Ironing across Kanpur';
  const code = activeOffer?.discount_code || 'SHUBHDIWALI';
  const badge = activeOffer?.badge_text || 'Festival Special';
  const cta = activeOffer?.cta_text || 'Book Pickup';

  const renderTickerGroup = (groupId) => (
    <div className="festive-marquee-group" key={groupId}>
      <div className="festive-ticker-item">
        <span className="festive-diya-icon" aria-hidden="true">✨</span>
        <span className="festive-tag-pill">{badge}</span>
        <span className="festive-ticker-text">
          <strong>{title}:</strong> {desc}
          {code && (
            <span className="festive-coupon-tag">
              {' '}(Use Code: <strong>{code}</strong>)
            </span>
          )}
        </span>
        <a href="#booking" className="festive-cta-link">
          {cta} <i className="fa-solid fa-arrow-right"></i>
        </a>
        <span className="festive-sep" aria-hidden="true">✦</span>
      </div>

      <div className="festive-ticker-item">
        <span className="festive-diya-icon" aria-hidden="true">🪔</span>
        <span className="festive-tag-pill">Free Doorstep Pickup</span>
        <span className="festive-ticker-text">
          <strong>Kanpur Doorstep Service:</strong> Free Express Pickup &amp; Delivery across Kidwai Nagar, Kalyanpur &amp; IIT Area
        </span>
        <a href="#booking" className="festive-cta-link">
          Book Now <i className="fa-solid fa-arrow-right"></i>
        </a>
        <span className="festive-sep" aria-hidden="true">✦</span>
      </div>

      <div className="festive-ticker-item">
        <span className="festive-diya-icon" aria-hidden="true">✨</span>
        <span className="festive-tag-pill">Quality Guaranteed</span>
        <span className="festive-ticker-text">
          <strong>Pristine Garment Care:</strong> Eco-friendly detergent wash &amp; wrinkle-free steam pressing
        </span>
        <a href="#services" className="festive-cta-link">
          Explore Services <i className="fa-solid fa-arrow-right"></i>
        </a>
        <span className="festive-sep" aria-hidden="true">✦</span>
      </div>
    </div>
  );

  return (
    <aside id="festive-banner" className="festive-banner" aria-label="Festive Announcement Ticker">
      <div className="festive-marquee-viewport">
        <div className="festive-marquee-track">
          {renderTickerGroup('group-1')}
          {renderTickerGroup('group-2')}
        </div>
      </div>
      <button
        className="festive-banner-close"
        onClick={() => setClosed(true)}
        aria-label="Dismiss festive announcement"
        title="Dismiss announcement"
      >
        &times;
      </button>
    </aside>
  );
}
