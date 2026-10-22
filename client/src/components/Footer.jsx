import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useConfig } from '../context/ConfigContext';

export default function Footer() {
  const { theme } = useTheme();
  const { config } = useConfig();
  const phone = config?.settings?.contact_phone || '+91 7860462268';
  const whatsapp = config?.settings?.whatsapp_number || '917860462268';
  const isDiwali = theme === 'diwali';

  return (
    <footer className="footer-screenshot" id="contact">
      <div className="container footer-grid-screenshot">
        {/* Col 1: Brand & Tagline */}
        <div className="footer-col-brand">
          <div className="footer-logo-row">
            <div className="logo-badge-icon" aria-hidden="true">
              <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                <circle cx="22" cy="22" r="21" fill="#0A2547" stroke="#F6C64A" strokeWidth="1.2" />
                <path d="M22 11 C22 11 22 9 23.8 8 C25.5 7 27 8.5 27 10.2 C27 11.5 25.8 12.5 24.5 12.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                <line x1="22" y1="11" x2="22" y2="17" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                <path d="M22 17 C17 19 12 23 10 27" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                <path d="M22 17 C27 19 32 23 34 27" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                <path d="M10 27 Q22 30.5 34 27" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            <div className="footer-brand-text">
              <span className="footer-brand-title">Diwakar Ji</span>
              <span className="footer-brand-sub">Laundry</span>
            </div>
          </div>
          <p className="footer-tagline-text">Fresh Clothes. Fresh Feel.</p>
        </div>

        {/* Col 2: Quick Links */}
        <div className="footer-links-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-list">
            <li><a href="#home">Home</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        {/* Col 3: Our Services */}
        <div className="footer-links-col">
          <h4 className="footer-heading">Our Services</h4>
          <ul className="footer-list">
            <li><a href="#booking">Wash &amp; Fold</a></li>
            <li><a href="#booking">Wash &amp; Iron</a></li>
            <li><a href="#booking">Dry Cleaning</a></li>
            <li><a href="#booking">Steam Ironing</a></li>
            <li><a href="#booking">Bedding &amp; Home Linen</a></li>
            <li><a href="#booking">Express Laundry</a></li>
          </ul>
        </div>

        {/* Col 4: Contact Us */}
        <div className="footer-links-col">
          <h4 className="footer-heading">Contact Us</h4>
          <ul className="footer-contact-list">
            <li>
              <a href={`tel:${phone.replace(/\s+/g, '')}`}>
                <i className="fa-solid fa-phone"></i> {phone}
              </a>
            </li>
            <li>
              <a href="mailto:diwakarjilaundry@gmail.com">
                <i className="fa-solid fa-envelope"></i> diwakarjilaundry@gmail.com
              </a>
            </li>
            <li>
              <span>
                <i className="fa-solid fa-location-dot"></i> Kanpur, Uttar Pradesh
              </span>
            </li>
          </ul>

          <div className="footer-social-row">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <i className="fa-brands fa-whatsapp"></i>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <i className="fa-brands fa-youtube"></i>
            </a>
          </div>
        </div>

        {/* Col 5: Right Festive Blessing (Diwali Theme) / Owner Portal */}
        <div className="footer-festive-col">
          {isDiwali ? (
            <div className="diwali-blessing-box">
              <p className="blessing-calligraphy">
                “May this Diwali bring happiness, prosperity and freshness to your life.”
              </p>
              <div className="blessing-diyas-row">
                <span className="blessing-diya">🪔</span>
                <span className="blessing-diya central-diya">🪔</span>
                <span className="blessing-diya">🪔</span>
              </div>
            </div>
          ) : (
            <div className="normal-trust-box">
              <p className="trust-atelier-text">
                Kanpur's Premier Fabric Atelier • Modern Hygienic Washing • Transparent Per-Kg Pricing
              </p>
            </div>
          )}

          <div style={{ marginTop: '16px' }}>
            <Link to="/admin" className="admin-portal-link" style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <i className="fa-solid fa-lock"></i> Owner Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright on Left, Legal Links on Right */}
      <div className="footer-bottom-screenshot">
        <div className="container footer-bottom-flex">
          <p>&copy; 2024–2026 Diwakar Ji Laundry. All Rights Reserved.</p>
          <div className="footer-legal-links">
            <a href="#home">Privacy Policy</a>
            <span>|</span>
            <a href="#home">Terms &amp; Conditions</a>
            <span>|</span>
            <a href="#home">Cancellation Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

