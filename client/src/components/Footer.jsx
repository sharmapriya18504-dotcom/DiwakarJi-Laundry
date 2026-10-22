import React from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';

export default function Footer() {
  const { config } = useConfig();
  const phone = config?.settings?.contact_phone || '+91 7860462268';
  const whatsapp = config?.settings?.whatsapp_number || '917860462268';
  const address = config?.settings?.address || 'Kidwai Nagar & IIT Kanpur Area, Kanpur, Uttar Pradesh 208011';
  const serviceAreas = config?.settings?.service_areas || 'Kakadeo, Swaroop Nagar, Kidwai Nagar, Kalyanpur, Civil Lines, Govind Nagar, Barra, IIT Kanpur Campus';

  return (
    <footer className="footer" id="contact">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="logo footer-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" width="46" height="46">
                <circle cx="26" cy="26" r="26" fill="url(#footerLogoGrad)"/>
                <path d="M26 10 C26 10 26 8 28 7 C30 6 32 7.5 32 9.5 C32 11 30.5 12 29 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                <line x1="26" y1="10" x2="26" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M26 18 C20 20 12 25 10 30" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M26 18 C32 20 40 25 42 30" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M10 30 Q26 34 42 30" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M29 12 C31 10 35 10 35 13 C35 16 31 17 29 15 C27 13 29 12 29 12Z" fill="#4ade80"/>
                <defs>
                  <linearGradient id="footerLogoGrad" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1a3a5c"/>
                    <stop offset="100%" stopColor="#10243A"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-name">Diwakar Ji</span>
              <span className="logo-sub">LAUNDRY</span>
            </div>
          </div>
          <p className="footer-tagline">
            Kanpur's trusted laundry &amp; dry cleaning service with free doorstep pickup &amp; delivery.
          </p>
          <div className="footer-contact-items">
            <a href={`tel:${phone.replace(/\s+/g, '')}`} className="footer-contact-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.39 2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              {phone}
            </a>
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="footer-contact-link">
              <i className="fa-brands fa-whatsapp"></i>
              WhatsApp: +{whatsapp}
            </a>
            <span className="footer-contact-link address-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
              {address}
            </span>
          </div>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Services</h4>
          <ul className="footer-links">
            <li><a href="#booking">Wash &amp; Fold</a></li>
            <li><a href="#booking">Wash &amp; Iron</a></li>
            <li><a href="#booking">Dry Cleaning</a></li>
            <li><a href="#booking">Steam Ironing</a></li>
            <li><a href="#booking">Blankets &amp; Bedsheets</a></li>
            <li><a href="#booking">Express Laundry</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Kanpur Service Areas</h4>
          <p className="footer-areas-text">
            {serviceAreas}
          </p>
          <div style={{ marginTop: '20px' }}>
            <Link to="/admin" className="admin-portal-link" style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <i className="fa-solid fa-lock"></i> Owner Admin Portal
            </Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>&copy; {new Date().getFullYear()} Diwakar Ji Laundry Service. All rights reserved. • Kanpur, Uttar Pradesh</p>
          <p className="footer-festive-tag">
            <span>🪔</span> Shubh Deepawali &amp; Happy Festive Season!
          </p>
        </div>
      </div>
    </footer>
  );
}
