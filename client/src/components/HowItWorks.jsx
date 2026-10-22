import React from 'react';

export default function HowItWorks() {
  return (
    <section className="how-it-works section-pad" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Simple Process</span>
          <h2 className="section-title">How It Works</h2>
          <p className="section-desc">Get your laundry done in 4 easy steps without ever leaving your home.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card" id="step-1">
            <div className="step-num">01</div>
            <div className="step-icon">
              <i className="fa-solid fa-calendar-check"></i>
            </div>
            <h3 className="step-title">Book Online</h3>
            <p className="step-desc">Select service, choose your pickup date &amp; time. Submit in seconds.</p>
          </div>

          <div className="step-arrow" aria-hidden="true">
            <svg viewBox="0 0 40 24" fill="none" stroke="#2878F0" strokeWidth="2.5" width="60">
              <path d="M0 12 Q20 4 40 12M35 8l5 4-5 4"/>
            </svg>
          </div>

          <div className="step-card" id="step-2">
            <div className="step-num">02</div>
            <div className="step-icon">
              <i className="fa-solid fa-truck-fast"></i>
            </div>
            <h3 className="step-title">Free Pickup</h3>
            <p className="step-desc">We collect your clothes from your doorstep at the chosen time slot.</p>
          </div>

          <div className="step-arrow" aria-hidden="true">
            <svg viewBox="0 0 40 24" fill="none" stroke="#2878F0" strokeWidth="2.5" width="60">
              <path d="M0 12 Q20 4 40 12M35 8l5 4-5 4"/>
            </svg>
          </div>

          <div className="step-card" id="step-3">
            <div className="step-num">03</div>
            <div className="step-icon">
              <i className="fa-solid fa-soap"></i>
            </div>
            <h3 className="step-title">We Clean</h3>
            <p className="step-desc">Your clothes are professionally cleaned with premium eco-friendly detergents.</p>
          </div>

          <div className="step-arrow" aria-hidden="true">
            <svg viewBox="0 0 40 24" fill="none" stroke="#2878F0" strokeWidth="2.5" width="60">
              <path d="M0 12 Q20 4 40 12M35 8l5 4-5 4"/>
            </svg>
          </div>

          <div className="step-card" id="step-4">
            <div className="step-num">04</div>
            <div className="step-icon">
              <i className="fa-solid fa-house-chimney"></i>
            </div>
            <h3 className="step-title">We Deliver</h3>
            <p className="step-desc">Fresh, crisp &amp; sanitized clothes delivered back to your doorstep.</p>
          </div>
        </div>

        <div className="hiw-cta">
          <a href="#booking" className="btn btn-primary btn-lg" id="hiw-book-btn">
            Book Your Pickup Now
          </a>
        </div>
      </div>
    </section>
  );
}
