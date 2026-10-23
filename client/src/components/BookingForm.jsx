import React, { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';
import { submitBooking, validateCoupon } from '../services/api';
import BookingModal from './BookingModal';

export default function BookingForm({ selectedServiceFromParent, onOpenTracking }) {
  const { config, activeOffer } = useConfig();
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

  // Coupon management
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (selectedServiceFromParent) {
      setFormData(prev => ({ ...prev, service: selectedServiceFromParent }));
    }
  }, [selectedServiceFromParent]);

  // Live Price Calculation with coupon discount
  const calculateEstimate = () => {
    if (!formData.service) return null;
    const svc = services.find(s => s.name.toLowerCase() === formData.service.toLowerCase())
      || services.find(s => formData.service.toLowerCase().includes(s.name.toLowerCase()));
    if (!svc) return null;

    const price = svc.price;
    const unit = svc.unit;

    if (!formData.quantity || formData.quantity.includes('Not sure')) {
      return {
        rawSubtotal: price,
        subtotal: price,
        discount: 0,
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

    const rawSubtotal = Math.round(price * mult);
    let discount = 0;
    if (appliedCoupon && appliedCoupon.valid) {
      discount = appliedCoupon.discount_amount || 0;
    }
    const finalEst = Math.max(0, rawSubtotal - discount);

    return {
      rawSubtotal,
      subtotal: rawSubtotal,
      discount,
      finalTotal: finalEst,
      amount: discount > 0 ? `~₹${finalEst} (₹${discount} saved)` : `~₹${finalEst}`,
      note: discount > 0
        ? `Applied coupon ${appliedCoupon.coupon_code}! Base estimate ~₹${rawSubtotal} minus ₹${discount} discount. Final amount confirmed upon weighing at pickup.`
        : `Estimated for ${formData.quantity} @ ₹${price}${unit}. Final amount confirmed upon weighing at pickup. No advance needed.`
    };
  };

  const estimate = calculateEstimate();

  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!couponInput || !couponInput.trim()) {
      setCouponMsg({ type: 'error', text: 'Please enter a coupon code.' });
      return;
    }

    setCouponLoading(true);
    setCouponMsg({ type: '', text: '' });
    try {
      const subtotalToValidate = estimate ? estimate.rawSubtotal : 150;
      const res = await validateCoupon(couponInput.trim().toUpperCase(), subtotalToValidate, formData.service);
      if (res.valid) {
        setAppliedCoupon(res);
        setCouponMsg({ type: 'success', text: res.message || `Coupon ${res.coupon_code} applied successfully!` });
      } else {
        setAppliedCoupon(null);
        setCouponMsg({ type: 'error', text: res.message || 'Invalid coupon code.' });
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponMsg({ type: 'error', text: err.message || 'Coupon code is invalid or expired.' });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleQuickApplyDiwaliCoupon = async (codeToApply) => {
    const code = (codeToApply || 'SHUBHDIWALI').trim().toUpperCase();
    setCouponInput(code);
    setCouponLoading(true);
    setCouponMsg({ type: '', text: '' });
    try {
      const subtotalToValidate = estimate ? estimate.rawSubtotal : 300;
      const res = await validateCoupon(code, subtotalToValidate, formData.service);
      if (res.valid) {
        setAppliedCoupon(res);
        setCouponMsg({ type: 'success', text: res.message || `Festive offer ${res.coupon_code} applied: 15% discount!` });
      } else {
        setAppliedCoupon(null);
        setCouponMsg({ type: 'error', text: res.message || 'Invalid coupon code.' });
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponMsg({ type: 'error', text: err.message || 'Coupon code could not be verified.' });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponMsg({ type: '', text: '' });
  };

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
      const payload = {
        ...formData,
        coupon_code: appliedCoupon ? appliedCoupon.coupon_code : null
      };
      const res = await submitBooking(payload);
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
          {/* Left Column: Equal-Height Process & Trust Card */}
          <div className="booking-info">
            <div className="booking-info-top">
              <div className="booking-process-badge">
                <i className="fa-solid fa-clock-rotate-left"></i>
                <span>EFFORTLESS LAUNDRY PROCESS</span>
              </div>
              <h3 className="booking-info-headline">What happens next?</h3>
              <p className="booking-info-sub">
                Transparent 4-step care cycle with live 9-stage order tracking.
              </p>

              <div className="booking-steps">
                <div className="b-step">
                  <div className="b-step-num">1</div>
                  <div className="b-step-text">
                    <strong>Submit Online Request</strong>
                    <p>Select service, approximate load &amp; your preferred pickup slot.</p>
                  </div>
                </div>
                <div className="b-step">
                  <div className="b-step-num">2</div>
                  <div className="b-step-text">
                    <strong>Digital Confirmation</strong>
                    <p>System generates your unique reference code (DWK-XXXX) instantly.</p>
                  </div>
                </div>
                <div className="b-step">
                  <div className="b-step-num">3</div>
                  <div className="b-step-text">
                    <strong>Doorstep Pickup &amp; Weighing</strong>
                    <p>Our rider arrives with a certified digital weighing scale at your address.</p>
                  </div>
                </div>
                <div className="b-step">
                  <div className="b-step-num">4</div>
                  <div className="b-step-text">
                    <strong>Express Return Delivery</strong>
                    <p>Clean, crisp, sanitized and steam ironed clothes delivered in 24–48h.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality & Trust Highlights */}
            <div className="booking-trust-pills-wrap">
              <div className="b-trust-pill">
                <i className="fa-solid fa-circle-check"></i>
                <span>100% Separate Batch Wash — Zero Mixing</span>
              </div>
              <div className="b-trust-pill">
                <i className="fa-solid fa-circle-check"></i>
                <span>Eco-Friendly Softeners &amp; Zero Color Bleed</span>
              </div>
              <div className="b-trust-pill">
                <i className="fa-solid fa-circle-check"></i>
                <span>Free Doorstep Pickup Across Covered Kanpur Zones</span>
              </div>
            </div>

            {/* Verified Owner Direct WhatsApp Contact Box */}
            <div className="booking-contact-card">
              <div className="b-contact-icon">
                <i className="fa-brands fa-whatsapp"></i>
              </div>
              <div className="b-contact-details">
                <span className="b-contact-label">Direct Owner Helpline (Diwakar Sharma)</span>
                <a href="tel:+917860462268" className="b-contact-phone">+91 7860462268</a>
                <span className="b-contact-sub">Available Mon–Sun: 8:00 AM – 9:00 PM</span>
              </div>
            </div>
          </div>

          <div className="booking-form-wrap">
            {/* Special Diwali Campaign Offer Card with 1-Click Coupon Apply */}
            <div className="booking-festive-offer-card" id="booking-festive-offer-card">
              <div className="festive-offer-badge">
                <i className="fa-solid fa-sparkles"></i> ✦ DIWALI SPECIAL FESTIVE OFFER ✦
              </div>
              <div className="festive-offer-content">
                <div className="festive-offer-info">
                  <h4>{activeOffer?.title || 'Diwali Special 2026'} — {activeOffer?.discount_value || '15'}% OFF</h4>
                  <p>{activeOffer?.description || 'Get 15% instant festive discount on all laundry & dry cleaning orders across Kanpur!'}</p>
                </div>
                <div className="festive-coupon-box">
                  <div className="coupon-code-pill" title="Coupon code for 15% off">
                    <span>CODE:</span>
                    <strong>{activeOffer?.coupon_code || 'SHUBHDIWALI'}</strong>
                  </div>
                  <button
                    type="button"
                    className={`btn-apply-festive-coupon ${appliedCoupon && (appliedCoupon.coupon_code === (activeOffer?.coupon_code || 'SHUBHDIWALI')) ? 'applied' : ''}`}
                    onClick={() => handleQuickApplyDiwaliCoupon(activeOffer?.coupon_code || 'SHUBHDIWALI')}
                    disabled={couponLoading}
                  >
                    {appliedCoupon && (appliedCoupon.coupon_code === (activeOffer?.coupon_code || 'SHUBHDIWALI'))
                      ? '✓ 15% Applied'
                      : (couponLoading ? 'Applying...' : 'Apply Coupon')}
                  </button>
                </div>
              </div>
            </div>

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
                        {isSelected && (
                          <span
                            style={{
                              position: 'absolute',
                              top: '5px',
                              left: '6px',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: '#38bdf8',
                              color: '#06090e',
                              fontSize: '11px',
                              fontWeight: 900,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              lineHeight: 1
                            }}
                          >
                            ✓
                          </span>
                        )}
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

              {/* Pickup Date & Time Selector */}
              <div className="form-row two-col">
                <div className={`form-group ${errors.pickup_date ? 'error' : ''}`}>
                  <label htmlFor="pickup-date">Pickup Date <span className="required">*</span></label>
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

              {/* Optional Coupon Code Bar */}
              <div className="form-group coupon-input-group" style={{ marginBottom: '16px' }}>
                <div className="coupon-row" style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    id="coupon-code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon Code (e.g. SHUBHDIWALI)"
                    disabled={appliedCoupon !== null}
                    style={{ textTransform: 'uppercase', flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-medium)', background: 'var(--bg-card)', color: 'var(--text-headline)', fontSize: '0.85rem' }}
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      className="btn-remove-coupon"
                      onClick={handleRemoveCoupon}
                      style={{ padding: '0 14px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-apply-coupon"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      style={{ padding: '0 16px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}
                    >
                      {couponLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Apply'}
                    </button>
                  )}
                </div>
                {couponMsg.text && (
                  <div
                    className={`coupon-feedback-msg ${couponMsg.type}`}
                    style={{
                      marginTop: '6px',
                      fontSize: '0.82rem',
                      fontWeight: '500',
                      color: couponMsg.type === 'success' ? '#10b981' : '#ef4444'
                    }}
                  >
                    {couponMsg.type === 'success' ? <i className="fa-solid fa-circle-check"></i> : <i className="fa-solid fa-circle-exclamation"></i>}{' '}
                    {couponMsg.text}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-whatsapp btn-submit"
                disabled={submitting}
                style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700 }}
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

              <div style={{ textAlign: 'center', margin: '14px 0 6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Already booked with us?{' '}
                <button
                  type="button"
                  onClick={() => onOpenTracking && onOpenTracking()}
                  style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: '600', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                >
                  Track Order Status
                </button>
              </div>

              <p className="form-note" style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-shield-halved" style={{ color: '#10b981', marginRight: '6px' }}></i>
                Instant confirmation code (DWK-XXXX) issued upon submission.
              </p>
            </form>
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
