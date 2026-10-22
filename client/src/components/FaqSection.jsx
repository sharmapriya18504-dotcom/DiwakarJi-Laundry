import React, { useState } from 'react';
import { useConfig } from '../context/ConfigContext';

export default function FaqSection() {
  const { config } = useConfig();
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = config?.faqs && config.faqs.length > 0 ? config.faqs : [
    { question: 'How do I book a laundry pickup?', answer: 'Simply fill the booking form on this website or tap the WhatsApp button. You will receive an instant booking reference and Diwakar Ji will confirm your pickup slot on WhatsApp.' },
    { question: 'Is pickup and delivery really free?', answer: 'Yes! Doorstep pickup and delivery are 100% free across our covered service areas in Kanpur.' },
    { question: 'How is the final price calculated?', answer: 'Prices shown on the website are transparent base estimates. When our delivery partner arrives, your clothes are digitally weighed in front of you for exact billing.' },
    { question: 'How much time does delivery take?', answer: 'Standard Wash & Fold / Wash & Iron takes 24 to 48 hours. Express laundry orders can be delivered on the same day or within 24 hours upon request.' },
    { question: 'Are my clothes washed separately?', answer: 'Absolutely. We strictly maintain 100% individual wash batches per customer for highest hygiene. Your clothes are never mixed with anyone else\'s.' }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="faq section-pad" id="faq">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Got Questions?</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-desc">Everything you need to know about our Kanpur laundry service &amp; pickup process.</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="faq-item">
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <span className="faq-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </span>
                </button>
                <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
