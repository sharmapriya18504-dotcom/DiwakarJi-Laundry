import React from 'react';

const STEPS = [
  {
    num: '01',
    title: 'Book Online',
    desc: 'Select your laundry service and choose your preferred pickup date & time slot in 30 seconds.',
    icon: 'fa-solid fa-calendar-check',
    badge: 'Step 1'
  },
  {
    num: '02',
    title: 'Doorstep Pickup',
    desc: 'Our courteous rider arrives at your doorstep across Kanpur to collect your garments safely.',
    icon: 'fa-solid fa-truck-ramp-box',
    badge: 'Step 2'
  },
  {
    num: '03',
    title: 'Expert Care & Press',
    desc: 'Garments are weighed, stain-treated, washed with eco-friendly detergents, and vacuum steam ironed.',
    icon: 'fa-solid fa-shirt',
    badge: 'Step 3'
  },
  {
    num: '04',
    title: 'Express Delivery',
    desc: 'Fresh, crisp, fragrant, and sanitized clothes delivered back to your home within 24-48 hours.',
    icon: 'fa-solid fa-house-chimney-check',
    badge: 'Step 4'
  }
];

export default function HowItWorks() {
  return (
    <section className="how-it-works section-pad" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Simple 4-Step Process</span>
          <h2 className="section-title">How It Works</h2>
          <p className="section-desc">Experience effortless laundry care in four seamless sequential steps.</p>
        </div>

        {/* Linear Horizontal Sequence Pipeline */}
        <div className="hiw-sequence-container">
          <div className="hiw-sequence-track" aria-hidden="true"></div>

          <div className="hiw-sequence-grid">
            {STEPS.map((step, index) => (
              <div key={index} className="hiw-sequence-card" id={`step-${index + 1}`}>
                <div className="hiw-sequence-header">
                  <div className="hiw-sequence-badge">{step.badge}</div>
                  <div className="hiw-sequence-num">{step.num}</div>
                </div>

                <div className="hiw-sequence-icon-wrap">
                  <i className={step.icon}></i>
                </div>

                <h3 className="hiw-sequence-title">{step.title}</h3>
                <p className="hiw-sequence-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
