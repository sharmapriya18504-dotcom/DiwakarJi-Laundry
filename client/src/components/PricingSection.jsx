import React from 'react';
import { useConfig } from '../context/ConfigContext';

export default function PricingSection({ onSelectService }) {
  const { config } = useConfig();
  const services = config?.services || [];

  const handleSelect = (serviceName) => {
    if (onSelectService) {
      onSelectService(serviceName);
    }
    const bookingEl = document.getElementById('booking');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getServiceIcon = (serviceId) => {
    switch (serviceId) {
      case 'wash_fold': return 'fa-solid fa-shirt';
      case 'wash_iron': return 'fa-solid fa-wand-magic-sparkles';
      case 'dry_cleaning': return 'fa-solid fa-vest-patches';
      case 'steam_iron': return 'fa-solid fa-temperature-high';
      case 'blankets': return 'fa-solid fa-bed';
      case 'express': return 'fa-solid fa-bolt-lightning';
      default: return 'fa-solid fa-shirt';
    }
  };

  const getServiceHighlights = (serviceId) => {
    switch (serviceId) {
      case 'wash_fold':
        return ['100% Individual Batch Wash', 'Fresh Fragrance Softeners', 'Precision Neatly Folded'];
      case 'wash_iron':
        return ['Steam Press on Hangers', 'Starch / Crisp Finish', 'Zero Fabric Shrinkage'];
      case 'dry_cleaning':
        return ['Gentle Hydrocarbon Tech', 'Stain Extraction Protocol', 'Breathable Suit Cover'];
      case 'steam_iron':
        return ['High-Pressure Vacuum Table', 'Collar & Cuff Precision', 'Ready to Wear on Hangers'];
      case 'blankets':
        return ['Deep Anti-Allergen Cleaning', 'Thermal Sanitization', 'Heavy Sealed Storage Pack'];
      case 'express':
        return ['Priority 12-Hour Return', 'Dedicated Express Batch', 'Real-Time Dispatch Alerts'];
      default:
        return ['Doorstep Pickup & Return', 'Separate Batch Wash', 'Certified Digital Weighing'];
    }
  };

  return (
    <section className="pricing section-pad" id="pricing">
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '38px' }}>
          <span className="section-tag">TRANSPARENT LAUNDRY RATES</span>
          <h2 className="section-title">Clear, Fair &amp; Simple Pricing</h2>
          <p className="section-desc">
            No hidden costs. Accurate digital scale weighing at your doorstep. Free delivery on orders above ₹299.
          </p>
        </div>

        <div className="pricing-executive-grid">
          {services.map((svc) => {
            const isFeatured = svc.service_id === 'wash_iron';
            const highlights = getServiceHighlights(svc.service_id);

            return (
              <div
                key={svc.id || svc.service_id}
                className={`pricing-executive-card ${isFeatured ? 'featured' : ''}`}
                id={`price-${svc.service_id}`}
              >
                {isFeatured && (
                  <div className="pricing-popular-pill">
                    <i className="fa-solid fa-star"></i> MOST POPULAR
                  </div>
                )}

                <div className="pricing-card-top">
                  <div className="pricing-card-icon-circle">
                    <i className={getServiceIcon(svc.service_id)}></i>
                  </div>
                  <h3 className="pricing-card-title">{svc.name}</h3>
                  <p className="pricing-card-sub">{svc.description || 'Premium fabric care at your doorstep'}</p>
                </div>

                <div className="pricing-rate-wrap">
                  <div className="pricing-main-price">
                    <span className="currency-symbol">₹</span>
                    <span className="price-number">{svc.price}</span>
                    <span className="price-unit">/{svc.unit || 'kg'}</span>
                  </div>
                  <div className="pricing-min-badge">
                    <span>Min: {svc.min_order || '2'} {svc.unit || 'kg'} • {svc.turnaround || '24–48h'}</span>
                  </div>
                </div>

                <ul className="pricing-feature-list">
                  {highlights.map((item, idx) => (
                    <li key={idx}>
                      <i className="fa-solid fa-circle-check"></i>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={`btn-select-price-tier ${isFeatured ? 'btn-tier-featured' : 'btn-tier-standard'}`}
                  onClick={() => handleSelect(svc.name)}
                >
                  <span>Select Service</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            );
          })}
        </div>

        {/* Minimal Transparent Guarantees Footer Bar */}
        <div className="pricing-guarantees-bar">
          <div className="p-guarantee-item">
            <i className="fa-solid fa-scale-balanced"></i>
            <span>Certified Digital Scales at Doorstep</span>
          </div>
          <div className="p-guarantee-item">
            <i className="fa-solid fa-shield-halved"></i>
            <span>Zero Color Bleed &amp; Fabric Loss Guarantee</span>
          </div>
          <div className="p-guarantee-item">
            <i className="fa-solid fa-truck-fast"></i>
            <span>Free Doorstep Pickup Across Kanpur</span>
          </div>
        </div>
      </div>
    </section>
  );
}
