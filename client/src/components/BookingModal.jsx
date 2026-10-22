import React, { useState } from 'react';
import { markWhatsAppNotified } from '../services/api';

export default function BookingModal({ booking, whatsappUrl, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!booking) return null;

  const handleOpenWhatsApp = () => {
    if (booking.booking_ref) {
      markWhatsAppNotified(booking.booking_ref);
    }
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopy = () => {
    const text = `Diwakar Ji Laundry Booking Ref: ${booking.booking_ref}\nName: ${booking.customer_name}\nMobile: ${booking.mobile_number}\nService: ${booking.service_name}\nSchedule: ${booking.pickup_date} (${booking.pickup_time})\nAddress: ${booking.pickup_address}, ${booking.area}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="modal-backdrop show" role="dialog" aria-modal="true">
      <div className="modal-dialog">
        <div className="modal-header">
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
          <h3 className="modal-title">
            <span>🪔</span> Confirm Your Booking
          </h3>
          <p className="modal-subtitle">
            <span className="diya-flame-mini"></span> Diwakar Ji Laundry • Free Doorstep Pickup Kanpur
          </p>
        </div>

        <div className="modal-body">
          <div className="booking-ref-banner">
            <div>
              <div className="ref-label">Booking Reference</div>
              <div className="ref-code">{booking.booking_ref}</div>
            </div>
            <span className="status-saved-pill">
              <i className="fa-solid fa-circle-check"></i> Saved in System
            </span>
          </div>

          <div className="modal-summary-grid">
            <div className="summary-item">
              <div className="summary-label">Customer Name</div>
              <div className="summary-val">{booking.customer_name}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Mobile Number</div>
              <div className="summary-val">{booking.mobile_number}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Service</div>
              <div className="summary-val">{booking.service_name}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Estimated Quantity</div>
              <div className="summary-val">{booking.quantity}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Pickup Schedule</div>
              <div className="summary-val">{booking.pickup_date} • {booking.pickup_time}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Estimated Price</div>
              <div className="summary-val" style={{ color: '#b45309', fontWeight: '700' }}>
                {booking.estimated_price || 'Confirm at pickup'}
              </div>
            </div>
            <div className="summary-item full-width">
              <div className="summary-label">Pickup Address &amp; Area</div>
              <div className="summary-val">{booking.pickup_address}, {booking.area}</div>
            </div>
            {booking.special_instructions && (
              <div className="summary-item full-width">
                <div className="summary-label">Special Instructions</div>
                <div className="summary-val">{booking.special_instructions}</div>
              </div>
            )}
          </div>

          <div className="modal-notice">
            <strong><i className="fa-solid fa-bell"></i> Preserved Owner Notification Workflow:</strong>
            {' '}Your booking is securely recorded in the database. Tap the green button below to notify Diwakar Ji directly on WhatsApp with all your pickup details pre-filled.
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-modal-wa" onClick={handleOpenWhatsApp}>
              <i className="fa-brands fa-whatsapp" style={{ fontSize: '22px' }}></i>
              <span>Continue to WhatsApp &amp; Notify Owner</span>
            </button>

            <div className="modal-alt-actions">
              <button type="button" className="btn-copy-wa" onClick={handleCopy}>
                <i className="fa-solid fa-copy"></i> {copied ? 'Copied to Clipboard!' : 'Copy Booking Details'}
              </button>
              <a href="tel:+917860462268" className="btn-call-wa">
                <i className="fa-solid fa-phone"></i> Call Diwakar Ji
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
