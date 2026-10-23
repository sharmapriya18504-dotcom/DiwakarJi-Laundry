import React, { useState } from 'react';

export default function ReviewsSection() {
  const reviews = [
    {
      id: 1,
      author: 'Pooja Sharma',
      text: 'Excellent service! My clothes came back fresh, clean and perfectly folded. On-time delivery and very professional team.',
      rating: 5
    },
    {
      id: 2,
      author: 'Rohit Verma',
      text: 'Best dry cleaning service in Kanpur! My heavy festive sherwani and blankets were cleaned with extraordinary care.',
      rating: 5
    },
    {
      id: 3,
      author: 'Dr. Amit Tiwari',
      text: 'Prompt doorstep pickup and delivery near IIT Kanpur. Very reasonable prices and great hygienic packaging.',
      rating: 5
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const nextReview = () => setActiveIndex((prev) => (prev + 1) % reviews.length);
  const prevReview = () => setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

  const current = reviews[activeIndex];

  return (
    <section className="customer-trust-section section-pad" id="reviews">
      <div className="container">
        {/* Section Header with Clean Star Icon (No Diya) */}
        <div className="trust-header-wrap">
          <div className="trust-title-row">
            <span className="gold-crest-icon" style={{ color: '#f6c64a' }}>
              <i className="fa-solid fa-star"></i>
            </span>
            <h2 className="trust-main-heading">Trusted by 500+ Happy Customers</h2>
          </div>
          <p className="trust-sub-heading">We're proud to be a part of your everyday life across Kanpur.</p>
        </div>

        {/* 2-Column Layout matching screenshot: Stats on Left, Testimonial on Right */}
        <div className="trust-content-grid">
          {/* 4 Stat Badges on Left */}
          <div className="trust-stats-quad">
            <div className="trust-stat-box">
              <div className="stat-icon-crimson">
                <i className="fa-solid fa-users"></i>
              </div>
              <span className="stat-number-bold">500+</span>
              <span className="stat-label-muted">Happy Customers</span>
            </div>

            <div className="trust-stat-box">
              <div className="stat-icon-crimson">
                <i className="fa-solid fa-ribbon"></i>
              </div>
              <span className="stat-number-bold">14+</span>
              <span className="stat-label-muted">Years of Service</span>
            </div>

            <div className="trust-stat-box">
              <div className="stat-icon-crimson">
                <i className="fa-solid fa-heart"></i>
              </div>
              <span className="stat-number-bold">4.9★</span>
              <span className="stat-label-muted">Average Rating</span>
            </div>

            <div className="trust-stat-box">
              <div className="stat-icon-crimson">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <span className="stat-number-bold">100%</span>
              <span className="stat-label-muted">Satisfaction</span>
            </div>
          </div>

          {/* Testimonial Quote Card on Right matching screenshot */}
          <div className="trust-testimonial-col">
            <div className="testimonial-card-screenshot">
              <div className="quote-mark-icon">
                <i className="fa-solid fa-quote-left"></i>
              </div>

              <blockquote className="testimonial-quote-text">
                "{current.text}"
              </blockquote>

              <div className="testimonial-footer-row">
                <div className="author-meta-block">
                  <span className="author-name-tag">— {current.author}</span>
                  <div className="author-gold-stars">
                    {'★'.repeat(current.rating)}
                  </div>
                </div>

                <div className="testimonial-nav-arrows">
                  <button
                    type="button"
                    className="review-arrow-btn"
                    onClick={prevReview}
                    aria-label="Previous review"
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <button
                    type="button"
                    className="review-arrow-btn"
                    onClick={nextReview}
                    aria-label="Next review"
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>

              {/* Carousel indicator dots */}
              <div className="carousel-dots-row">
                {reviews.map((_, idx) => (
                  <span
                    key={idx}
                    className={`carousel-dot ${idx === activeIndex ? 'active' : ''}`}
                    onClick={() => setActiveIndex(idx)}
                    role="button"
                    tabIndex={0}
                  ></span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

