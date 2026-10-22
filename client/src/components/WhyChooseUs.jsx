import React from 'react';

export default function WhyChooseUs() {
  return (
    <section className="why-us section-pad" id="about">
      <div className="container">
        <div className="why-inner">
          <div className="why-content">
            <span className="section-tag light">Why Choose Us</span>
            <h2 className="section-title white">Why Choose Diwakar Ji?</h2>
            <p className="section-desc light">
              We use modern machines, premium detergents and expert care to give your clothes the best cleaning and fresh look — every single time.
            </p>

            <div className="why-features">
              <div className="why-feature" id="why-1">
                <div className="why-feature-icon">
                  <i className="fa-solid fa-users"></i>
                </div>
                <div>
                  <h4>Expert Team</h4>
                  <p>Trained &amp; professional staff with years of experience in fabric care.</p>
                </div>
              </div>

              <div className="why-feature" id="why-2">
                <div className="why-feature-icon">
                  <i className="fa-solid fa-flask-vial"></i>
                </div>
                <div>
                  <h4>Premium Detergents</h4>
                  <p>Safe for all fabrics. No damage, no shrinkage — guaranteed.</p>
                </div>
              </div>

              <div className="why-feature" id="why-3">
                <div className="why-feature-icon">
                  <i className="fa-solid fa-clock"></i>
                </div>
                <div>
                  <h4>On-Time Delivery</h4>
                  <p>We respect your time. Pickup &amp; delivery always on schedule.</p>
                </div>
              </div>

              <div className="why-feature" id="why-4">
                <div className="why-feature-icon">
                  <i className="fa-solid fa-hand-sparkles"></i>
                </div>
                <div>
                  <h4>Hygienic Process</h4>
                  <p>Clean, germ-free individual washing batches — 100% separate wash.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="why-visual">
            <div className="why-img-card">
              <img src="/blankets.png" alt="Professional laundry care Diwakar Ji" loading="lazy" />
            </div>
            <div className="why-stat-cards">
              <div className="mini-stat-card">
                <span className="mini-num">500+</span>
                <span className="mini-label">Orders Done</span>
              </div>
              <div className="mini-stat-card">
                <span className="mini-num">4.9★</span>
                <span className="mini-label">Avg Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
