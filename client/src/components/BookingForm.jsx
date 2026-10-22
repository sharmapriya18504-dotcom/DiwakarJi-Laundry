import React, { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';
import { submitBooking } from '../services/api';
import BookingModal from './BookingModal';

export default function BookingForm({ selectedServiceFromParent }) {
  const { config } = useConfig();
  const services = config?.services || [];

  const getTodayStr = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };

  const [formData, setFormData] = useState({
    full_name: '',
    mobile: '',
    address: '',
    area: '',
    service: selectedServiceFromParent || 'Wash & Iron',
    quantity: '4–6 kg (Medium load)',
    pickup_date: getTodayStr(0),
    pickup_time: '9:00 AM – 11:00 AM',
    instructions: ''
  });

  const [dateOffset, setDateOffset] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (selectedServiceFromParent) {
      setFormData(prev => ({ ...prev, service: selectedServiceFromParent }));
    }
  }, [selectedServiceFromParent]);

  // Live Price Calculation
  const calculateEstimate = () => {
    if (!formData.service) return null;
    const svc = services.find(s => s.name.toLowerCase() === formData.service.toLowerCase())
      || services.find(s => formData.service.toLowerCase().includes(s.name.toLowerCase()));
    if (!svc) return null;

    const price = svc.price;
    const unit = svc.unit;

    if (!formData.quantity || formData.quantity.includes('Not sure')) {
      return {
        amount: `Starting from ₹${price}${unit}`,
        note: `Rate is ₹${price}${unit}. Final weight & amount will be confirmed at doorstep pickup.`
      };
    }

    let mult = 1;
    const q = formData.quantity.toLowerCase();
    if (q.includes('1–3') || q.includes('1-3')) mult = 2;
    else if (q.includes('4–6') || q.includes('4-6')) mult = 5;
    else if (q.includes('7–10') || q.includes('7-10')) mult = 8;
    else if (q.includes('10+')) mult = 12;

    const est = Math.round(price * mult);
    return {
      amount: `~₹${est}`,
      note: `Estimated for ${formData.quantity} @ ₹${price}${unit}. Final amount confirmed upon weighing at pickup. No advance needed.`
    };
  };

  const estimate = calculateEstimate();

  const handleQuickDate = (offset) => {
    setDateOffset(offset);
    setFormData(prev => ({ ...prev, pickup_date: getTodayStr(offset) }));
    if (errors.pickup_date) setErrors(prev => ({ ...prev, pickup_date: null }));
  };

  const handleQuickArea = (areaName) => {
    setFormData(prev => ({ ...prev, area: areaName }));
    if (errors.area) setErrors(prev => ({ ...prev, area: null }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.full_name || formData.full_name.trim().length < 2) {
      errs.full_name = 'Please enter your full name.';
    }

    const cleanMobile = formData.mobile.replace(/[\s\-+]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      errs.mobile = 'Please enter a valid 10-digit Indian mobile number.';
    }

    if (!formData.address || formData.address.trim().length < 5) {
      errs.address = 'Please enter your complete pickup address.';
    }

    if (!formData.area || formData.area.trim().length < 2) {
      errs.area = 'Please specify your area or PIN code.';
    }

    if (!formData.service) {
      errs.service = 'Please select a laundry service.';
    }

    if (!formData.quantity) {
      errs.quantity = 'Please select an estimated clothes quantity.';
    }

    if (!formData.pickup_date) {
      errs.pickup_date = 'Please select a pickup date.';
    }

    if (!formData.pickup_time) {
      errs.pickup_time = 'Please select a preferred pickup time.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitBooking(formData);
      setConfirmedBooking(res.booking || {
        booking_ref: res.booking_ref,
        customer_name: formData.full_name,
        mobile_number: formData.mobile,
        pickup_address: formData.address,
        area: formData.area,
        service_name: formData.service,
        quantity: formData.quantity,
        pickup_date: formData.pickup_date,
        pickup_time: formData.pickup_time,
        estimated_price: estimate?.amount || '',
        special_instructions: formData.instructions
      });
      setWhatsappUrl(res.whatsapp_url);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit booking. Please try again or WhatsApp Diwakar Ji directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const kanpurAreas = [
    'Kakadeo, Kanpur',
    'Swaroop Nagar, Kanpur',
    'Kidwai Nagar, Kanpur',
    'Kalyanpur, Kanpur',
    'Civil Lines, Kanpur',
    'Govind Nagar, Kanpur',
    'Barra, Kanpur',
    'IIT Kanpur Campus'
  ];

  const timeSlots = [
    '7:00 AM – 9:00 AM',
    '9:00 AM – 11:00 AM',
    '11:00 AM – 1:00 PM',
    '2:00 PM – 4:00 PM',
    '4:00 PM – 6:00 PM',
    '6:00 PM – 8:00 PM'
  ];

  return (
    <section className="booking section-pad" id="booking">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Easy Booking</span>
          <h2 className="section-title">Book a Laundry Pickup</h2>
          <p className="section-desc">
            Fill the form below — your booking is instantly saved to our database and pre-filled for Diwakar Ji on WhatsApp.
          </p>
        </div>

        <div className="booking-wrapper">
          <div className="booking-info">
            <h3>What happens next?</h3>
            <div className="booking-steps">
              <div className="b-step">
                <div className="b-step-num">1</div>
                <div className="b-step-text">
                  <strong>Submit the form</strong>
                  <p>Choose your service, Kanpur area, and pickup slot.</p>
                </div>
              </div>
              <div className="b-step">
                <div className="b-step-num">2</div>
                <div className="b-step-text">
                  <strong>Database confirmation</strong>
                  <p>System issues your unique booking reference (DWK-XXXX).</p>
                </div>
              </div>
              <div className="b-step">
                <div className="b-step-num">3</div>
                <div className="b-step-text">
                  <strong>WhatsApp opens</strong>
                  <p>Pre-filled order dispatch with exact details for Diwakar Ji.</p>
                </div>
              </div>
              <div className="b-step">
                <div className="b-step-num">4</div>
                <div className="b-step-text">
                  <strong>Free doorstep pickup</strong>
                  <p>Delivery partner arrives on time for digital weighing.</p>
                </div>
              </div>
            </div>

            <div className="booking-contact">
              <p className="contact-label">Have questions? Call or WhatsApp directly:</p>
              <a href="tel:+917860462268" className="contact-num">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.39 2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                +91 7860462268
              </a>
            </div>
          </div>

          <div className="booking-form-wrap">
            {errorMessage && (
              <div className="form-error-banner" style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
                <i className="fa-solid fa-triangle-exclamation"></i> {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* 1. Visual Service Selector Chips */}
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label>
                  Select Laundry Service <span className="required">*</span>
                </label>
                <div className="service-selector-grid">
                  {services.map(svc => {
                    const isSelected = formData.service === svc.name;
                    const isPopular = svc.service_id === 'wash_iron';
                    const iconEmoji = svc.service_id === 'wash_fold' ? '👕'
                      : svc.service_id === 'wash_iron' ? '✨'
                      : svc.service_id === 'dry_cleaning' ? '👔'
                      : svc.service_id === 'steam_iron' ? '💨'
                      : svc.service_id === 'blankets' ? '🛏️' : '⚡';

                    return (
                      <button
                        type="button"
                        key={svc.service_id}
                        className={`service-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, service: svc.name }));
                          if (errors.service) setErrors(prev => ({ ...prev, service: null }));
                        }}
                      >
                        {isPopular && <span className="chip-badge">Popular</span>}
                        <span className="chip-icon">{iconEmoji}</span>
                        <span className="chip-name">{svc.name}</span>
                        <span className="chip-rate">₹{svc.price}{svc.unit}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.service && <span className="field-error" style={{ display: 'block' }}>{errors.service}</span>}
              </div>

              <div className="form-row two-col">
                <div className={`form-group ${errors.full_name ? 'error' : ''}`}>
                  <label htmlFor="full-name">Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    id="full-name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                  />
                  {errors.full_name && <span className="field-error">{errors.full_name}</span>}
                </div>

                <div className={`form-group ${errors.mobile ? 'error' : ''}`}>
                  <label htmlFor="mobile">Mobile Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="98765 43210"
                    maxLength={15}
                    required
                  />
                  {errors.mobile && <span className="field-error">{errors.mobile}</span>}
                </div>
              </div>

              <div className={`form-group ${errors.address ? 'error' : ''}`}>
                <label htmlFor="address">Pickup Address <span className="required">*</span></label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="House No., Street, Landmark, Colony"
                  rows={2}
                  required
                />
                {errors.address && <span className="field-error">{errors.address}</span>}
              </div>

              <div className="form-row two-col">
                <div className={`form-group ${errors.area ? 'error' : ''}`}>
                  <label htmlFor="area">Area / PIN Code <span className="required">*</span></label>
                  <input
                    type="text"
                    id="area"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="e.g. Kidwai Nagar - 208011"
                    required
                  />
                  {errors.area && <span className="field-error">{errors.area}</span>}

                  {/* Fast Area Chips */}
                  <div className="area-fast-chips">
                    <span className="area-fast-label">
                      <i className="fa-solid fa-location-dot"></i> Quick:
                    </span>
                    {kanpurAreas.map(a => (
                      <button
                        type="button"
                        key={a}
                        className="area-chip"
                        onClick={() => handleQuickArea(a)}
                      >
                        {a.split(',')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`form-group ${errors.quantity ? 'error' : ''}`}>
                  <label htmlFor="quantity">Approx. Clothes Quantity <span className="required">*</span></label>
                  <div className="select-wrap">
                    <select
                      id="quantity"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    >
                      <option value="1–3 kg (Small load)">1–3 kg (Small load)</option>
                      <option value="4–6 kg (Medium load)">4–6 kg (Medium load)</option>
                      <option value="7–10 kg (Large load)">7–10 kg (Large load)</option>
                      <option value="10+ kg (Bulk load)">10+ kg (Bulk load)</option>
                      <option value="Not sure yet (Weigh at pickup)">Not sure yet (Weigh at pickup)</option>
                    </select>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                  {errors.quantity && <span className="field-error">{errors.quantity}</span>}
                </div>
              </div>

              {/* Quick Date Selector */}
              <div className="form-row two-col">
                <div className={`form-group ${errors.pickup_date ? 'error' : ''}`}>
                  <label htmlFor="pickup-date">Pickup Date <span className="required">*</span></label>
                  <div className="quick-date-row">
                    <button
                      type="button"
                      className={`date-quick-btn ${dateOffset === 0 ? 'active' : ''}`}
                      onClick={() => handleQuickDate(0)}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      className={`date-quick-btn ${dateOffset === 1 ? 'active' : ''}`}
                      onClick={() => handleQuickDate(1)}
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      className={`date-quick-btn ${dateOffset === 2 ? 'active' : ''}`}
                      onClick={() => handleQuickDate(2)}
                    >
                      Day After
                    </button>
                  </div>
                  <input
                    type="date"
                    id="pickup-date"
                    value={formData.pickup_date}
                    min={getTodayStr(0)}
                    onChange={(e) => {
                      setFormData({ ...formData, pickup_date: e.target.value });
                      setDateOffset(-1);
                    }}
                    required
                  />
                  {errors.pickup_date && <span className="field-error">{errors.pickup_date}</span>}
                </div>

                <div className={`form-group ${errors.pickup_time ? 'error' : ''}`}>
                  <label htmlFor="pickup-time">Preferred Pickup Time <span className="required">*</span></label>
                  <div className="select-wrap">
                    <select
                      id="pickup-time"
                      value={formData.pickup_time}
                      onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
                      required
                    >
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                  {errors.pickup_time && <span className="field-error">{errors.pickup_time}</span>}
                </div>
              </div>

              {/* Live Transparent Price Estimation Box */}
              {estimate && (
                <div id="live-price-estimate" className="price-estimate-box" aria-live="polite">
                  <div className="estimate-header">
                    <span className="estimate-title">
                      <i className="fa-solid fa-calculator"></i> Estimated Pricing
                    </span>
                    <span className="estimate-badge">{formData.service}</span>
                  </div>
                  <div className="estimate-amount-display">{estimate.amount}</div>
                  <p className="estimate-note">{estimate.note}</p>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="instructions">Special Instructions <span className="optional">(Optional)</span></label>
                <textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Any special care instructions, delicate items, or notes for us..."
                  rows={2}
                />
              </div>

              <button
                type="submit"
                className="btn btn-whatsapp btn-submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Saving Booking to Database...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-brands fa-whatsapp" style={{ fontSize: '20px' }}></i>
                    <span>Submit &amp; Continue to WhatsApp</span>
                  </>
                )}
              </button>

              <p className="form-note">
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
                Your booking is securely recorded in the database. Diwakar Ji is directly notified on WhatsApp.
              </p>
            </form>

            {/* Quality Trust Strip */}
            <div className="booking-trust-strip">
              <div className="trust-badge-card">
                <span className="trust-icon">🧼</span>
                <div>
                  <strong>100% Separate Wash</strong>
                  <p>Never mixed with other clothes</p>
                </div>
              </div>
              <div className="trust-badge-card">
                <span className="trust-icon">⚖️</span>
                <div>
                  <strong>Digital Weighing</strong>
                  <p>Accurate digital scale at pickup</p>
                </div>
              </div>
              <div className="trust-badge-card">
                <span className="trust-icon">🚚</span>
                <div>
                  <strong>Free Pickup &amp; Delivery</strong>
                  <p>Direct to your doorstep in Kanpur</p>
                </div>
              </div>
              <div className="trust-badge-card">
                <span className="trust-icon">🛡️</span>
                <div>
                  <strong>Safe Fabric Promise</strong>
                  <p>Zero shrinkage or color bleed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmedBooking && (
        <BookingModal
          booking={confirmedBooking}
          whatsappUrl={whatsappUrl}
          onClose={() => setConfirmedBooking(null)}
        />
      )}
    </section>
  );
}
