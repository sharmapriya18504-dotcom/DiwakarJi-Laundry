import React from 'react';
import { useConfig } from '../context/ConfigContext';

export default function ServicesSection({ onSelectService }) {
  const { config } = useConfig();
  const services = config?.services || [
    { service_id: 'wash_fold', name: 'Wash & Fold', description: 'Clean, fresh and neatly folded clothes.', price: 40, unit: '/kg', image_url: '/assets/laundry/wash-fold.webp' },
    { service_id: 'wash_iron', name: 'Wash & Iron', description: 'Clean and perfectly ironed clothes.', price: 60, unit: '/kg', image_url: '/assets/laundry/wash-iron.webp' },
    { service_id: 'dry_cleaning', name: 'Dry Cleaning', description: 'Special care for premium fabrics.', price: 120, unit: '/item', image_url: '/assets/laundry/dry-cleaning.webp' },
    { service_id: 'steam_iron', name: 'Steam Ironing', description: 'Wrinkle-free and fresh look.', price: 30, unit: '/item', image_url: '/assets/laundry/steam-iron.webp' },
    { service_id: 'blankets', name: 'Bedding & Home Linen', description: 'Bedsheets, curtains, comforters & more.', price: 80, unit: '/item', image_url: '/assets/laundry/blankets.webp' },
    { service_id: 'express', name: 'Express Laundry', description: 'When you need it faster.', price: 70, unit: '/kg', image_url: '/assets/laundry/express-laundry.webp' }
  ];

  const handleSelect = (serviceName) => {
    if (onSelectService) {
      onSelectService(serviceName);
    }
  };

  const getServiceIcon = (serviceId) => {
    switch (serviceId) {
      case 'wash_fold': return 'fa-soap';
      case 'wash_iron': return 'fa-vest';
      case 'dry_cleaning': return 'fa-user-tie';
      case 'steam_iron': return 'fa-temperature-high';
      case 'blankets': return 'fa-bed';
      case 'express': return 'fa-bolt';
      default: return 'fa-shirt';
    }
  };

  const getShortDesc = (svc) => {
    switch (svc.service_id) {
      case 'wash_fold': return 'Fresh wash, dried & neatly folded.';
      case 'wash_iron': return 'Hygienic wash & sharp steam press.';
      case 'dry_cleaning': return 'Specialist care for suits & sarees.';
      case 'steam_iron': return 'Wrinkle-free high-pressure steam.';
      case 'blankets': return 'Deep antibacterial sanitize for quilts.';
      case 'express': return 'Guaranteed priority 24h turnaround.';
      default: return svc.description || 'Professional fabric care.';
    }
  };

  return (
    <section className="services section-pad" id="services">
      <div className="container">
        {/* Section Header Row with Clean Laundry Icon (No Diya) */}
        <div className="services-header-row">
          <div className="services-title-col">
            <div className="services-title-wrap">
              <span className="gold-crest-icon" style={{ color: '#0ea5e9' }}>
                <i className="fa-solid fa-shirt"></i>
              </span>
              <h2 className="services-section-title">Our Services</h2>
            </div>
            <p className="services-section-sub">
              Complete care for your clothes, home and lifestyle across Kanpur.
            </p>
          </div>
          <a href="#booking" className="services-view-all-link">
            <span>Book a Service</span>
            <i className="fa-solid fa-arrow-right"></i>
          </a>
        </div>

        {/* 6 Services Grid with Premium Commercial Photography */}
        <div className="services-grid-screenshot">
          {services.map((svc) => (
            <div
              key={svc.id || svc.service_id}
              className="service-card-screenshot"
              id={`service-${svc.service_id}`}
              onClick={() => handleSelect(svc.name)}
              role="button"
              tabIndex={0}
            >
              <div className="service-card-img-wrap" style={{ width: '100%', height: '170px', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px', background: '#0f172a' }}>
                <img
                  src={svc.image_url || ((svc.service_id === 'express' || (svc.slug && svc.slug.includes('express'))) ? '/assets/laundry/express-laundry.webp' : '/assets/laundry/wash-fold.webp')}
                  alt={svc.name}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    const key = `${svc.service_id || ''} ${svc.slug || ''} ${svc.name || ''}`.toLowerCase();
                    if (key.includes('express')) {
                      e.target.src = '/assets/laundry/express-laundry.webp';
                    } else if (key.includes('dry')) {
                      e.target.src = '/assets/laundry/dry-cleaning.webp';
                    } else if (key.includes('steam')) {
                      e.target.src = '/assets/laundry/steam-iron.webp';
                    } else if (key.includes('blanket') || key.includes('bed')) {
                      e.target.src = '/assets/laundry/blankets.webp';
                    } else if (key.includes('iron')) {
                      e.target.src = '/assets/laundry/wash-iron.webp';
                    } else {
                      e.target.src = '/assets/laundry/wash-fold.webp';
                    }
                  }}
                />
              </div>

              <div className="svc-icon-box">
                <i className={`fa-solid ${getServiceIcon(svc.service_id)}`}></i>
              </div>

              <h3 className="svc-card-name">{svc.name}</h3>
              <p className="svc-card-desc">{getShortDesc(svc)}</p>

              <div className="svc-price-pill">
                Starting ₹{svc.price}{svc.unit}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
