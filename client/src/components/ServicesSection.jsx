import React from 'react';
import { useConfig } from '../context/ConfigContext';

export default function ServicesSection({ onSelectService }) {
  const { config } = useConfig();
  const services = config?.services || [];

  const handleSelect = (serviceName) => {
    if (onSelectService) {
      onSelectService(serviceName);
    }
  };

  const getServiceIcon = (serviceId) => {
    switch (serviceId) {
      case 'wash_fold': return 'fa-shirt';
      case 'wash_iron': return 'fa-wand-magic-sparkles';
      case 'dry_cleaning': return 'fa-vest';
      case 'steam_iron': return 'fa-temperature-high';
      case 'blankets': return 'fa-bed';
      case 'express': return 'fa-bolt';
      default: return 'fa-soap';
    }
  };

  return (
    <section className="services section-pad" id="services">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">What We Do</span>
          <h2 className="section-title">Our Laundry Services</h2>
          <p className="section-desc">From daily clothes to delicate dry cleaning, we handle every garment with expert fabric care.</p>
        </div>

        <div className="services-grid">
          {services.map((svc) => (
            <div key={svc.id || svc.service_id} className="service-card" id={`service-${svc.service_id}`}>
              <div className="service-img-wrap">
                <img
                  src={svc.image_url || '/wash_fold.png'}
                  alt={`${svc.name} service Kanpur`}
                  loading="lazy"
                />
                <div className="service-overlay">
                  <a
                    href="#booking"
                    className="btn btn-white-sm"
                    onClick={() => handleSelect(svc.name)}
                  >
                    Book Now
                  </a>
                </div>
              </div>
              <div className="service-body">
                <div className={`service-icon ${svc.service_id === 'express' ? 'express-icon' : ''}`}>
                  <i className={`fa-solid ${getServiceIcon(svc.service_id)}`}></i>
                </div>
                <h3 className="service-name">{svc.name}</h3>
                <p className="service-desc">{svc.description}</p>
                <div className="service-footer">
                  <span className="service-price">
                    From ₹{svc.price}<small>{svc.unit}</small>
                  </span>
                  <a
                    href="#booking"
                    className="service-cta"
                    onClick={() => handleSelect(svc.name)}
                  >
                    Book Now <i className="fa-solid fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
