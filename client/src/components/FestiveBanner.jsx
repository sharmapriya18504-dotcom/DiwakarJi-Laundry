import React, { useState } from 'react';
import { useConfig } from '../context/ConfigContext';

export default function FestiveBanner() {
  const { config, activeOffer } = useConfig();
  const [closed, setClosed] = useState(false);

  const isEnabled = config?.settings?.festive_banner_enabled === 'true' || config?.settings?.festive_banner_enabled === true;
  const bannerText = activeOffer
    ? `✨ <strong>${activeOffer.title}</strong>: ${activeOffer.description}${activeOffer.discount_code ? ` (Use Code: <strong>${activeOffer.discount_code}</strong>)` : ''}`
    : (config?.settings?.festive_banner_text || 'Shubh Diwali Offer: 15% OFF on Blankets & Dry Cleaning! Free Doorstep Pickup & Delivery across Kanpur.');

  if (!isEnabled || closed) return null;

  return (
    <aside id="festive-banner" className="festive-banner" aria-label="Festive Announcement">
      <div className="festive-banner-inner">
        <span className="festive-diya-icon">✨</span>
        <span className="festive-tag-pill" id="festive-pill">{activeOffer?.badge_text || 'Diwali Special'}</span>
        <span
          className="festive-banner-text"
          id="festive-banner-text"
          dangerouslySetInnerHTML={{ __html: bannerText }}
        />
        <a href="#booking" className="festive-cta-link">
          {activeOffer?.cta_text || 'Book Pickup'} <i className="fa-solid fa-arrow-right"></i>
        </a>
      </div>
      <button
        className="festive-banner-close"
        onClick={() => setClosed(true)}
        aria-label="Dismiss banner"
      >
        &times;
      </button>
    </aside>
  );
}
