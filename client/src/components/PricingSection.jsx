import React from 'react';
import { useConfig } from '../context/ConfigContext';

export default function PricingSection({ onSelectService }) {
  const { config } = useConfig();
  const services = config?.services || [];

  const handleSelect = (serviceName) => {
    if (onSelectService) onSelectService(serviceName);
  };

  const getServiceIcon = (serviceId) => {
    switch (serviceId) {
      case 'wash_fold': return 'fa-shirt';
      case 'wash_iron': return 'fa-wand-magic-sparkles';
      case 'dry_cleaning': return 'fa-vest';
      case 'steam_iron': return 'fa-temperature-high';
      case 'blankets': return 'fa-bed';
      case 'express': return 'fa-bolt';
      default: return 'fa-shirt';
    }
  };

  return (
    <section className="pricing section-pad" id="pricing">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Transparent Pricing</span>
          <h2 className="section-title">Starting Price List</h2>
          <p className="section-desc">No hidden charges. Final price confirmed at pickup based on actual weight &amp; items.</p>
        </div>

        <div className="pricing-grid">
          {services.map((svc) => {
            const isFeatured = svc.service_id === 'wash_iron';
            return (
              <div
                key={svc.id || svc.service_id}
                className={`price-card ${isFeatured ? 'featured' : ''}`}
                id={`price-${svc.service_id}`}
              >
                {isFeatured && <div className="price-popular">Most Popular</div>}
                <div className="price-icon">
                  <i className={`fa-solid ${getServiceIcon(svc.service_id)}`}></i>
                </div>
                <h3 className="price-service">{svc.name}</h3>
                <div className="price-amount">
                  ₹{svc.price}<span>{svc.unit}</span>
                </div>
                <p className="price-note">Starting from</p>
                <a
                  href="#booking"
                  className={`btn ${isFeatured ? 'btn-primary-sm' : 'btn-outline-sm'}`}
                  onClick={() => handleSelect(svc.name)}
                >
                  Book Now
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
