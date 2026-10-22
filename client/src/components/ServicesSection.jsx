import React from 'react';
import { useConfig } from '../context/ConfigContext';

export default function ServicesSection({ onSelectService }) {
  const { config } = useConfig();
  const services = config?.services || [
    { service_id: 'wash_fold', name: 'Wash & Fold', description: 'Clean, fresh and neatly folded clothes.', price: 40, unit: '/kg' },
    { service_id: 'wash_iron', name: 'Wash & Iron', description: 'Clean and perfectly ironed clothes.', price: 60, unit: '/kg' },
    { service_id: 'dry_cleaning', name: 'Dry Cleaning', description: 'Special care for premium fabrics.', price: 120, unit: '/item' },
    { service_id: 'steam_iron', name: 'Steam Ironing', description: 'Wrinkle-free and fresh look.', price: 30, unit: '/item' },
    { service_id: 'blankets', name: 'Bedding & Home Linen', description: 'Bedsheets, curtains, comforters & more.', price: 80, unit: '/item' },
    { service_id: 'express', name: 'Express Laundry', description: 'When you need it faster.', price: 70, unit: '/kg' }
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

  return (
    <section className="services section-pad" id="services">
      <div className="container">
        {/* Section Header Row with Gold Crest matching screenshot */}
        <div className="services-header-row">
          <div className="services-title-col">
            <div className="services-title-wrap">
              <span className="gold-crest-icon">🪔</span>
              <h2 className="services-section-title">Our Services</h2>
            </div>
            <p className="services-section-sub">
              Complete care for your clothes, home and lifestyle.
            </p>
          </div>
          <a href="#booking" className="services-view-all-link">
            <span>View All Services</span>
            <i className="fa-solid fa-arrow-right"></i>
          </a>
        </div>

        {/* 6 Services Grid matching screenshot */}
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
              <div className="svc-icon-box">
                <i className={`fa-solid ${getServiceIcon(svc.service_id)}`}></i>
              </div>

              <h3 className="svc-card-name">{svc.name}</h3>
              <p className="svc-card-desc">{svc.description}</p>

              <div className="svc-price-pill">
                Starting from ₹{svc.price}{svc.unit}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

