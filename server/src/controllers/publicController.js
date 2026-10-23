const { db } = require('../config/db');
const { generateBookingReference } = require('../utils/refGenerator');
const { buildOwnerWhatsAppMessage, getOwnerWhatsAppUrl } = require('../utils/whatsappHelper');

// 1. GET /api/public/config or /api/public/site-config
async function getPublicConfig(req, res) {
  try {
    const settings = await db.getSettings();
    const services = await db.getServices(true);
    const faqs = await db.getFaqs(true);
    const reviews = await db.getReviews();
    const offers = await db.getOffers(true);
    const active_offer = await db.getActiveOffer();
    const theme_settings = await db.getThemeSettings();
    const sections = await db.getSiteSections();

    return res.json({
      success: true,
      settings,
      services,
      faqs,
      reviews,
      offers,
      active_offer,
      theme_settings,
      sections
    });
  } catch (err) {
    console.error('Error fetching public config:', err);
    return res.status(500).json({ success: false, message: 'Failed to load website configuration' });
  }
}

// 2. GET /api/offers/active or /api/public/campaign
async function getActiveOffer(req, res) {
  try {
    const offer = await db.getActiveOffer();
    return res.json({ success: true, offer });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve active offer.' });
  }
}

// 3. GET /api/theme
async function getThemeSettings(req, res) {
  try {
    const theme = await db.getThemeSettings();
    return res.json({ success: true, ...theme });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve theme settings.' });
  }
}

// 4. GET /api/services or /api/public/services
async function getActiveServices(req, res) {
  try {
    const services = await db.getServices(true);
    return res.json({ success: true, services });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
}

// 5. GET /api/public/faqs
async function getFaqs(req, res) {
  try {
    const faqs = await db.getFaqs(true);
    return res.json({ success: true, faqs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch FAQs' });
  }
}

// 6. POST /api/bookings
async function createBooking(req, res) {
  try {
    const {
      full_name,
      mobile,
      address,
      area,
      service,
      quantity,
      pickup_date,
      pickup_time,
      instructions,
      coupon_code
    } = req.body;

    // Field Validations
    if (!full_name || full_name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide a valid customer full name.' });
    }

    const cleanMobile = String(mobile || '').replace(/[\s\-+]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit Indian mobile number.' });
    }

    if (!address || address.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Please provide a valid pickup address.' });
    }

    if (!area || area.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please specify your area or PIN code in Kanpur.' });
    }

    if (!service || !service.trim()) {
      return res.status(400).json({ success: false, message: 'Please select a laundry service.' });
    }

    if (!quantity || !quantity.trim()) {
      return res.status(400).json({ success: false, message: 'Please select an estimated quantity.' });
    }

    if (!pickup_date) {
      return res.status(400).json({ success: false, message: 'Please select a pickup date.' });
    }

    if (!pickup_time) {
      return res.status(400).json({ success: false, message: 'Please select a pickup time window.' });
    }

    // Duplicate Check: Return existing booking if placed within last 10 minutes
    const duplicate = await db.findRecentDuplicateBooking(cleanMobile, service.trim(), 10);
    if (duplicate) {
      const whatsappMessage = buildOwnerWhatsAppMessage({
        customer_name: duplicate.customer_name,
        mobile_number: duplicate.mobile_number,
        pickup_address: duplicate.pickup_address,
        area: duplicate.area,
        service_name: duplicate.service_name,
        quantity: duplicate.quantity,
        pickup_date: duplicate.pickup_date,
        pickup_time: duplicate.pickup_time,
        special_instructions: duplicate.special_instructions
      }, duplicate.booking_ref);
      const whatsappUrl = getOwnerWhatsAppUrl(whatsappMessage);

      return res.status(200).json({
        success: true,
        is_duplicate: true,
        booking: duplicate,
        booking_ref: duplicate.booking_ref,
        whatsapp_url: whatsappUrl,
        whatsapp_message: whatsappMessage,
        message: 'A recent booking for this service is already active.'
      });
    }

    // Lookup service details
    const allServices = await db.getServices();
    const matchedService = allServices.find(s => s.name.toLowerCase() === service.trim().toLowerCase());
    const unitPrice = matchedService ? matchedService.price : 40.0;
    const serviceId = matchedService ? matchedService.service_id : 'custom';

    // Calculate initial estimated subtotal
    let mult = 1;
    const qLower = quantity.toLowerCase();
    if (qLower.includes('1–3') || qLower.includes('1-3')) mult = 2;
    else if (qLower.includes('4–6') || qLower.includes('4-6')) mult = 5;
    else if (qLower.includes('7–10') || qLower.includes('7-10')) mult = 8;
    else if (qLower.includes('10+')) mult = 12;

    const subtotal = Math.round(unitPrice * mult);
    let discountAmount = 0;
    let validatedCoupon = null;

    if (coupon_code) {
      const couponCheck = await db.validateCoupon(coupon_code, subtotal, service);
      if (couponCheck.valid) {
        discountAmount = couponCheck.discount_amount;
        validatedCoupon = couponCheck.coupon_code;
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);
    const estimatedPrice = `~₹${totalAmount}`;

    // Generate canonical reference code
    const bookingRef = generateBookingReference();

    // Persist Booking
    const newBookingId = await db.createBooking({
      booking_ref: bookingRef,
      customer_name: full_name.trim(),
      mobile_number: cleanMobile,
      pickup_address: address.trim(),
      area: area.trim(),
      service_name: service.trim(),
      service_id: serviceId,
      unit_price: unitPrice,
      quantity: quantity.trim(),
      estimated_price: estimatedPrice,
      subtotal,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      coupon_code: validatedCoupon,
      pickup_date,
      pickup_time,
      special_instructions: instructions ? instructions.trim() : null
    });

    // Build prefilled WhatsApp URL for Diwakar Ji
    const whatsappMessage = buildOwnerWhatsAppMessage({
      customer_name: full_name.trim(),
      mobile_number: cleanMobile,
      pickup_address: address.trim(),
      area: area.trim(),
      service_name: service.trim(),
      quantity: quantity.trim(),
      estimated_price: estimatedPrice,
      pickup_date: pickup_date,
      pickup_time: pickup_time,
      special_instructions: instructions
    }, bookingRef);
    const whatsappUrl = getOwnerWhatsAppUrl(whatsappMessage);

    // Audit log
    await db.logAudit('BOOKING_CREATED', 'booking', bookingRef, `Customer ${full_name.trim()} (${cleanMobile}) created booking ${bookingRef}.`);

    return res.status(201).json({
      success: true,
      booking_id: newBookingId,
      booking_ref: bookingRef,
      whatsapp_url: whatsappUrl,
      whatsapp_message: whatsappMessage,
      estimated_total: totalAmount,
      discount_applied: discountAmount,
      message: 'Booking created successfully! Please tap Send on WhatsApp to confirm with Diwakar Ji.'
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    return res.status(500).json({ success: false, message: 'Internal server error while processing booking.' });
  }
}

// 7. POST /api/orders/track or GET /api/public/track/:ref
async function trackOrder(req, res) {
  try {
    const bookingRef = req.params.ref || req.body.booking_ref || req.query.ref;
    const mobileNumber = req.body.mobile || req.query.mobile;

    if (!bookingRef) {
      return res.status(400).json({ success: false, message: 'Please provide a valid Booking Reference (e.g. DWK-202610-0001).' });
    }

    const trackingData = await db.trackBooking(bookingRef, mobileNumber);
    if (!trackingData) {
      return res.status(404).json({
        success: false,
        message: 'No active booking found matching this reference code and phone number. Please check and try again.'
      });
    }

    return res.json({
      success: true,
      tracking: trackingData
    });
  } catch (err) {
    console.error('Error tracking order:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve order tracking information.' });
  }
}

// 8. POST /api/public/validate-coupon
async function validateCoupon(req, res) {
  try {
    const { code, subtotal, service_name } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
    }

    const result = await db.validateCoupon(code, subtotal, service_name);
    if (!result.valid) {
      return res.status(400).json({ success: false, valid: false, message: result.message });
    }

    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('Error validating coupon:', err);
    return res.status(500).json({ success: false, message: 'Error checking coupon code.' });
  }
}

// 9. PATCH /api/bookings/:ref/notification
async function updateNotificationStatus(req, res) {
  try {
    const { ref } = req.params;
    await db.setBookingWhatsAppNotified(ref);
    return res.json({ success: true, message: 'WhatsApp notification marked as dispatched.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update notification state.' });
  }
}

module.exports = {
  getPublicConfig,
  getActiveOffer,
  getThemeSettings,
  getActiveServices,
  getFaqs,
  createBooking,
  trackOrder,
  validateCoupon,
  updateNotificationStatus
};
