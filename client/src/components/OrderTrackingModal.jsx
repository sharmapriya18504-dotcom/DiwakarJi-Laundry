import React, { useState } from 'react';
import { trackOrder } from '../services/api';
import { useConfig } from '../context/ConfigContext';

export default function OrderTrackingModal({ isOpen, onClose, initialRef = '' }) {
  const { config } = useConfig();
  const [bookingRef, setBookingRef] = useState(initialRef);
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingData, setTrackingData] = useState(null);

  if (!isOpen) return null;

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    if (!bookingRef || !bookingRef.trim()) {
      setError('Please enter your Booking Reference code (e.g. DWK-202610-0001).');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await trackOrder(bookingRef.trim().toUpperCase(), mobile.trim());
      if (res.tracking) {
        setTrackingData(res.tracking);
      }
    } catch (err) {
      setError(err.message || 'No booking found. Please verify your reference number and mobile number.');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  const whatsappPhone = config?.settings?.whatsapp_number || '917860462268';
  const supportUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    `Hello Diwakar Ji, I am checking the status of my laundry booking ${bookingRef || ''}. Could you please provide an update?`
  )}`;

  return (
    <div className="tracking-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tracking-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="tracking-modal-header">
          <div className="tracking-header-title">
            <span className="tracking-icon-badge">
              <i className="fa-solid fa-truck-ramp-box"></i>
            </span>
            <div>
              <h3>Track Your Laundry Order</h3>
              <p>Real-time doorstep pickup &amp; delivery updates</p>
            </div>
          </div>
          <button type="button" className="tracking-close-btn" onClick={onClose} aria-label="Close">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleTrack} className="tracking-search-form">
          <div className="tracking-inputs-row">
            <div className="tracking-field-wrap">
              <label htmlFor="track-ref-input">Booking Reference</label>
              <div className="input-with-icon">
                <i className="fa-solid fa-receipt"></i>
                <input
                  id="track-ref-input"
                  type="text"
                  placeholder="e.g. DWK-202610-0001"
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="tracking-field-wrap">
              <label htmlFor="track-mobile-input">Registered Mobile (Optional)</label>
              <div className="input-with-icon">
                <i className="fa-solid fa-phone"></i>
                <input
                  id="track-mobile-input"
                  type="tel"
                  placeholder="10-digit number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn-track-submit" disabled={loading}>
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Checking...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-magnifying-glass"></i> Track Order
                </>
              )}
            </button>
          </div>
          {error && <div className="tracking-error-alert"><i className="fa-solid fa-circle-exclamation"></i> {error}</div>}
        </form>

        {/* Tracking Details & Stepper */}
        {trackingData && (
          <div className="tracking-results-wrap">
            {/* Summary Ribbon */}
            <div className="tracking-summary-ribbon">
              <div className="summary-item">
                <span className="summary-label">Order Ref</span>
                <strong className="summary-val ref-code">{trackingData.booking_ref}</strong>
              </div>
              <div className="summary-item">
                <span className="summary-label">Customer</span>
                <strong className="summary-val">{trackingData.customer_masked_name}</strong>
              </div>
              <div className="summary-item">
                <span className="summary-label">Service &amp; Load</span>
                <strong className="summary-val">{trackingData.service_name} ({trackingData.quantity})</strong>
              </div>
              <div className="summary-item">
                <span className="summary-label">Pickup Slot</span>
                <strong className="summary-val">{trackingData.pickup_date} • {trackingData.pickup_time}</strong>
              </div>
              <div className="summary-item status-badge-item">
                <span className="summary-label">Current Status</span>
                <span className="active-status-pill">{trackingData.current_status}</span>
              </div>
            </div>

            {/* 9-Stage Stepper Progression */}
            <div className="stages-timeline">
              {trackingData.stages.map((stage, idx) => {
                const isPassed = idx <= trackingData.current_stage_index;
                const isCurrent = idx === trackingData.current_stage_index;

                // Match any timestamp in history
                const historyEntry = (trackingData.history || []).find(
                  (h) => h.status.toLowerCase() === stage.id.toLowerCase()
                );

                return (
                  <div
                    key={stage.id}
                    className={`timeline-step ${isPassed ? 'completed' : 'pending'} ${isCurrent ? 'current' : ''}`}
                  >
                    <div className="step-marker">
                      <div className="step-circle">
                        {isPassed ? (
                          <i className={`fa-solid ${stage.icon || 'fa-check'}`}></i>
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      {idx < trackingData.stages.length - 1 && <div className="step-connector"></div>}
                    </div>
                    <div className="step-content">
                      <h5 className="step-title">{stage.label}</h5>
                      <p className="step-desc">{stage.desc}</p>
                      {historyEntry && (
                        <span className="step-time">
                          <i className="fa-regular fa-clock"></i>{' '}
                          {new Date(historyEntry.timestamp).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Support Call to Action */}
            <div className="tracking-footer-actions">
              <a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-query"
              >
                <i className="fa-brands fa-whatsapp"></i> Chat with Diwakar Ji on WhatsApp
              </a>
              <button type="button" className="btn-close-tracking" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
