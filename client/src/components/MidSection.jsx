import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useConfig } from '../context/ConfigContext';
import { submitBooking } from '../services/api';
import BookingModal from './BookingModal';

export default function MidSection({ selectedServiceFromParent }) {
  const { theme } = useTheme();
  const { config } = useConfig();
  const isDiwali = theme === 'diwali';

  const services = config?.services || [
    { service_id: 'wash_fold', name: 'Wash & Fold', price: 40, unit: '/kg' },
    { service_id: 'wash_iron', name: 'Wash & Iron', price: 60, unit: '/kg' },
    { service_id: 'dry_cleaning', name: 'Dry Cleaning', price: 120, unit: '/item' },
    { service_id: 'steam_iron', name: 'Steam Ironing', price: 30, unit: '/item' },
    { service_id: 'blankets', name: 'Bedding & Home Linen', price: 80, unit: '/item' },
    { service_id: 'express', name: 'Express Laundry', price: 70, unit: '/kg' }
  ];

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
    service: selectedServiceFromParent || 'Wash & Iron',
    pickup_date: getTodayStr(0),
    pickup_time: '9:00 AM – 11:00 AM',
    address: '',
    area: 'Kanpur',
    instructions: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Live price estimate calculation
  const getSelectedPriceEstimate = () => {
    const svc = services.find(s => s.name.toLowerCase() === formData.service.toLowerCase())
      || services.find(s => formData.service.toLowerCase().includes(s.name.toLowerCase()));
    if (!svc) return '₹0';
    return `~₹${svc.price * 4}`; // Average batch estimate (4 kg/items)
  };

  const validate = () => {
    const errs = {};
    if (!formData.full_name || formData.full_name.trim().length < 2) {
      errs.full_name = 'Please enter your full name.';
    }

    const cleanMobile = formData.mobile.replace(/[\s\-+]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      errs.mobile = 'Enter a valid 10-digit Indian mobile number.';
    }

    if (!formData.address || formData.address.trim().length < 5) {
      errs.address = 'Please enter your pickup address.';
    }

    if (!formData.service) {
      errs.service = 'Please select a laundry service.';
    }

    if (!formData.pickup_date) {
      errs.pickup_date = 'Please select a date.';
    }

    if (!formData.pickup_time) {
      errs.pickup_time = 'Please select a time slot.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        full_name: formData.full_name.trim(),
        mobile: formData.mobile.trim(),
        address: formData.address.trim(),
        area: formData.area || 'Kanpur',
        service: formData.service,
        quantity: '4–6 kg (Medium load)',
        pickup_date: formData.pickup_date,
        pickup_time: formData.pickup_time,
        instructions: formData.instructions ? formData.instructions.trim() : ''
      };

      const res = await submitBooking(payload);

      if (res && res.success) {
        setConfirmedBooking(res.booking || {
          booking_ref: res.booking_ref,
          customer_name: payload.full_name,
          mobile_number: payload.mobile,
          service_name: payload.service,
          pickup_date: payload.pickup_date,
          pickup_time: payload.pickup_time,
          pickup_address: payload.address,
          estimated_price: getSelectedPriceEstimate(),
          special_instructions: payload.instructions
        });

        if (res.whatsapp_url) {
          setWhatsappUrl(res.whatsapp_url);
        } else {
          const ownerNum = '917860462268';
          const msg = `🧺 *New Laundry Booking — Diwakar Ji*\n\nRef: ${res.booking_ref}\nName: ${payload.full_name}\nMobile: ${payload.mobile}\nService: ${payload.service}\nPickup Date: ${payload.pickup_date}\nTime: ${payload.pickup_time}\nAddress: ${payload.address}\n\nPlease confirm availability. Thank you! 🙏`;
          setWhatsappUrl(`https://wa.me/${ownerNum}?text=${encodeURIComponent(msg)}`);
        }
      } else {
        setErrorMessage(res?.message || 'Could not process booking. Please try again.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Network error occurred while submitting booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mid-feature-section section-pad" id="about">
      <div className="container">
        <div className="mid-three-column-grid">
          {/* COLUMN 1: Why Choose Us? (Matches Screenshot) */}
          <div className="mid-col-why-us">
            <div className="why-us-header-wrap">
              <span className="gold-crest-icon">🪔</span>
              <h2 className="why-us-title">Why Choose Us?</h2>
            </div>

            <div className="why-us-image-container">
              <img
                src="/why_us_woman.jpg"
                alt="Smiling Indian woman holding freshly folded laundry"
                className="why-us-photo"
                loading="lazy"
              />
            </div>

            <div className="why-us-features-list">
              <div className="why-feature-row">
                <div className="why-gold-icon-circle">
                  <i className="fa-solid fa-medal"></i>
                </div>
                <div className="why-feature-text">
                  <h4 className="why-feature-heading">Experienced &amp; Trusted</h4>
                  <p className="why-feature-sub">Quality service since 2010</p>
                </div>
              </div>

              <div className="why-feature-row">
                <div className="why-gold-icon-circle">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div className="why-feature-text">
                  <h4 className="why-feature-heading">Safe &amp; Hygienic</h4>
                  <p className="why-feature-sub">Advanced cleaning methods</p>
                </div>
              </div>

              <div className="why-feature-row">
                <div className="why-gold-icon-circle">
                  <i className="fa-solid fa-clock"></i>
                </div>
                <div className="why-feature-text">
                  <h4 className="why-feature-heading">On-Time Delivery</h4>
                  <p className="why-feature-sub">Your time matters to us</p>
                </div>
              </div>

              <div className="why-feature-row">
                <div className="why-gold-icon-circle">
                  <i className="fa-solid fa-headset"></i>
                </div>
                <div className="why-feature-text">
                  <h4 className="why-feature-heading">Customer Support</h4>
                  <p className="why-feature-sub">Always here to help</p>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: This Diwali Festive Card (Matches Screenshot) */}
          <div className="mid-col-festive-banner">
            {isDiwali ? (
              <div className="diwali-promo-card-screenshot">
                <div className="diwali-corner-rangoli top-left" aria-hidden="true"></div>
                <div className="diwali-corner-rangoli top-right" aria-hidden="true"></div>

                <div className="promo-lantern-ornament left" aria-hidden="true">🪔</div>
                <div className="promo-lantern-ornament right" aria-hidden="true">🪔</div>

                <span className="diwali-promo-tag">This Diwali</span>
                <h3 className="diwali-promo-headline">
                  Keep Your Clothes Fresh and Your Moments Bright
                </h3>
                <p className="diwali-promo-desc">
                  Special festive offers on selected services. Book now and enjoy the festive care!
                </p>

                <div className="diwali-promo-diya-glow">
                  <div className="flame-halo"></div>
                  <svg className="diya-glow-svg" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="38" stroke="#F6C64A" strokeWidth="1" strokeDasharray="3 3"/>
                    <circle cx="50" cy="50" r="28" stroke="#F6C64A" strokeWidth="0.8"/>
                    <path d="M20 48 C22 60 36 65 50 65 C64 65 78 60 80 48 C80 42 70 38 50 38 C30 38 20 42 20 48 Z" fill="#9a3412" stroke="#F6C64A" strokeWidth="1"/>
                    <ellipse cx="50" cy="42" rx="30" ry="7" fill="#d97706" stroke="#F6C64A" strokeWidth="0.8"/>
                    <g className="diya-flame-animation">
                      <path d="M50 14 C43 26 42 33 50 38 C58 33 57 26 50 14 Z" fill="#ea580c"/>
                      <path d="M50 18 C45 28 44 32 50 36 C56 32 55 28 50 18 Z" fill="#fbbf24"/>
                      <path d="M50 22 C48 30 47 32 50 34 C53 32 52 30 50 22 Z" fill="#ffffff"/>
                    </g>
                  </svg>
                </div>
              </div>
            ) : (
              <div className="normal-quality-card">
                <span className="normal-card-tag">Our Promise</span>
                <h3 className="normal-card-headline">
                  Fabric-Safe, Hygienic &amp; On-Time Delivery
                </h3>
                <p className="normal-card-desc">
                  Every order is washed individually in fresh softened water with eco-friendly sanitizing detergents.
                </p>
                <div className="normal-card-features">
                  <div className="normal-feature-pill">
                    <i className="fa-solid fa-check-circle"></i> 100% Separate Wash
                  </div>
                  <div className="normal-feature-pill">
                    <i className="fa-solid fa-check-circle"></i> Zero Color Bleed Guarantee
                  </div>
                  <div className="normal-feature-pill">
                    <i className="fa-solid fa-check-circle"></i> Digital Doorstep Weighing
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 3: Book Your Pickup Form (Matches Screenshot) */}
          <div className="mid-col-booking-form" id="booking">
            <div className="booking-card-screenshot">
              <div className="booking-card-header">
                <div className="booking-title-row">
                  <span className="gold-crest-icon">🪔</span>
                  <h3 className="booking-main-title">Book Your Pickup</h3>
                </div>
                <p className="booking-sub-title">
                  Fill in the details and we'll take care of the rest!
                </p>
              </div>

              {errorMessage && (
                <div className="booking-form-alert error">
                  <i className="fa-solid fa-circle-exclamation"></i> {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="screenshot-booking-form">
                {/* Full Name */}
                <div className="form-field-group">
                  <label htmlFor="form-full-name">Full Name <span className="req">*</span></label>
                  <input
                    type="text"
                    id="form-full-name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter your name"
                    required
                  />
                  {errors.full_name && <span className="field-err-msg">{errors.full_name}</span>}
                </div>

                {/* Mobile Number with +91 prefix */}
                <div className="form-field-group">
                  <label htmlFor="form-mobile">Mobile Number <span className="req">*</span></label>
                  <div className="phone-input-wrap">
                    <span className="phone-prefix">+91</span>
                    <input
                      type="tel"
                      id="form-mobile"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="Enter mobile number"
                      maxLength={14}
                      required
                    />
                  </div>
                  {errors.mobile && <span className="field-err-msg">{errors.mobile}</span>}
                </div>

                {/* Service Selection */}
                <div className="form-field-group">
                  <label htmlFor="form-service">Service <span className="req">*</span></label>
                  <select
                    id="form-service"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    required
                  >
                    {services.map((s) => (
                      <option key={s.service_id} value={s.name}>
                        {s.name} (from ₹{s.price}{s.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Split Row: Pickup Date & Time */}
                <div className="form-field-row-split">
                  <div className="form-field-group">
                    <label htmlFor="form-date">Pickup Date <span className="req">*</span></label>
                    <input
                      type="date"
                      id="form-date"
                      value={formData.pickup_date}
                      onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
                      min={getTodayStr(0)}
                      required
                    />
                    {errors.pickup_date && <span className="field-err-msg">{errors.pickup_date}</span>}
                  </div>

                  <div className="form-field-group">
                    <label htmlFor="form-time">Pickup Time <span className="req">*</span></label>
                    <select
                      id="form-time"
                      value={formData.pickup_time}
                      onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
                      required
                    >
                      <option value="9:00 AM – 11:00 AM">9:00 AM – 11:00 AM</option>
                      <option value="11:00 AM – 1:00 PM">11:00 AM – 1:00 PM</option>
                      <option value="2:00 PM – 4:00 PM">2:00 PM – 4:00 PM</option>
                      <option value="4:00 PM – 6:00 PM">4:00 PM – 6:00 PM</option>
                      <option value="6:00 PM – 8:00 PM">6:00 PM – 8:00 PM</option>
                    </select>
                  </div>
                </div>

                {/* Pickup Address */}
                <div className="form-field-group">
                  <label htmlFor="form-address">Pickup Address <span className="req">*</span></label>
                  <input
                    type="text"
                    id="form-address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter your address"
                    required
                  />
                  {errors.address && <span className="field-err-msg">{errors.address}</span>}
                </div>

                {/* Additional Instructions */}
                <div className="form-field-group">
                  <label htmlFor="form-instructions">Additional Instructions (Optional)</label>
                  <textarea
                    id="form-instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Any special instructions..."
                    rows={2}
                  />
                </div>

                {/* Live Estimated Price Strip matching screenshot */}
                <div className="estimated-price-strip">
                  <div className="estimate-row-top">
                    <span className="estimate-label">
                      <i className="fa-brands fa-whatsapp" style={{ color: '#25D366' }}></i> Estimated Price
                    </span>
                    <span className="estimate-value">{getSelectedPriceEstimate()}</span>
                  </div>
                  <p className="estimate-disclaimer">
                    Final price may vary based on actual weight.
                  </p>
                </div>

                {/* Submit Button: Royal Blue with WhatsApp Icon matching screenshot */}
                <button
                  type="submit"
                  className="btn-send-whatsapp"
                  disabled={submitting}
                  id="submit-booking-btn"
                >
                  <i className="fa-brands fa-whatsapp"></i>
                  <span>{submitting ? 'Recording Booking...' : 'Send on WhatsApp'}</span>
                </button>
              </form>
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
