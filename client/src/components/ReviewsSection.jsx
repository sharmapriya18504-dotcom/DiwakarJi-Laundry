import React from 'react';
import { useConfig } from '../context/ConfigContext';

export default function ReviewsSection() {
  const { config } = useConfig();
  const reviews = config?.reviews || [
    { id: 1, author_name: 'Rohit Singh', location: 'IIT Kanpur Area', rating: 5, review_text: 'Excellent service! Clothes came back fresh, clean and really neatly pressed. Highly recommended for Kanpur residents.' },
    { id: 2, author_name: 'Neha Verma', location: 'Kidwai Nagar, Kanpur', rating: 5, review_text: 'Very professional and on-time doorstep delivery. Now I only trust Diwakar Ji for all our family laundry needs.' },
    { id: 3, author_name: 'Amit Tiwari', location: 'Kalyanpur, Kanpur', rating: 5, review_text: 'The best laundry service in Kanpur. Quality is top-notch and rates are reasonable. My heavy winter blankets look brand new!' }
  ];

  return (
    <section className="reviews section-pad" id="reviews">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Customer Love</span>
          <h2 className="section-title">Happy Customers</h2>
          <p className="section-desc">Real people, genuine Kanpur experiences. See what our customers say about us.</p>
        </div>

        <div className="reviews-note">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
          Verified reviews from our Kanpur household &amp; campus customers.
        </div>

        <div className="reviews-grid">
          {reviews.map((r, i) => (
            <div key={r.id || i} className="review-card" id={`review-${i + 1}`}>
              <div className="review-stars">
                {'★'.repeat(r.rating || 5)}
              </div>
              <blockquote className="review-text">
                "{r.review_text}"
              </blockquote>
              <div className="reviewer">
                <div className="reviewer-avatar" aria-hidden="true">
                  {r.author_name ? r.author_name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div className="reviewer-info">
                  <strong>{r.author_name}</strong>
                  <span>{r.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
