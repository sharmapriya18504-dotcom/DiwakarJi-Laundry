const { db } = require('../config/db');
const { generateBookingReference } = require('../utils/refGenerator');
const { buildOwnerWhatsAppMessage, getOwnerWhatsAppUrl } = require('../utils/whatsappHelper');

// 1. GET /api/public/config
async function getPublicConfig(req, res) {
  try {
    const settings = await db.getSettings();
    const services = await db.getServices(true);
    const faqs = await db.getFaqs(true);
    const reviews = await db.getReviews();
    const offers = await db.getOffers(true);

    return res.json({
      success: true,
      settings,
      services,
      faqs,
      reviews,
      offers
    });
  } catch (err) {
    console.error('Error fetching public config:', err);
    return res.status(500).json({ success: false, message: 'Failed to load website configuration' });
  }
}

// 2. GET /api/services
async function getActiveServices(req, res) {
  try {
    const services = await db.getServices(true);
    return res.json({ success: true, services });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
}

// 3. POST /api/bookings
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
      instructions
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
      return res.status(400).json({ success: false, message: 'Please select a valid pickup date.' });
    }

    // Date range validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(pickup_date + 'T00:00:00');
    if (isNaN(selectedDate.getTime()) || selectedDate < today) {
      return res.status(400).json({ success: false, message: 'Pickup date cannot be in the past.' });
    }

    if (!pickup_time || !pickup_time.trim()) {
      return res.status(400).json({ success: false, message: 'Please select a preferred pickup time slot.' });
    }

    // Duplicate Prevention Check (same mobile & service in past 10 minutes)
    const duplicate = await db.checkRecentDuplicate(cleanMobile, service.trim());
    if (duplicate) {
      const settings = await db.getSettings();
      const ownerPhone = settings.whatsapp_number || '917860462268';
      const ownerName = settings.owner_name || 'Diwakar Ji';
      const waMsg = buildOwnerWhatsAppMessage({
        customer_name: duplicate.customer_name,
        mobile_number: duplicate.mobile_number,
        pickup_address: duplicate.pickup_address,
        area: duplicate.area,
        service_name: duplicate.service_name,
        quantity: duplicate.quantity,
        estimated_price: duplicate.estimated_price,
        pickup_date: duplicate.pickup_date,
        pickup_time: duplicate.pickup_time,
        special_instructions: duplicate.special_instructions
      }, duplicate.booking_ref, ownerName);

      return res.status(200).json({
        success: true,
        is_duplicate: true,
        booking_ref: duplicate.booking_ref,
        message: 'A booking with these details was already recorded a few moments ago.',
        whatsapp_url: getOwnerWhatsAppUrl(waMsg, ownerPhone),
        whatsapp_message: waMsg,
        booking: duplicate
      });
    }

    // Retrieve active service for pricing snapshot
    const allServices = await db.getServices(false);
    const matchedService = allServices.find(s => s.name.toLowerCase() === service.trim().toLowerCase())
      || allServices.find(s => service.trim().toLowerCase().includes(s.name.toLowerCase()));

    const unitPrice = matchedService ? matchedService.price : 0;
    const serviceId = matchedService ? matchedService.service_id : null;

    // Calculate Estimated Price snapshot
    let estimatedPriceStr = `From ₹${unitPrice}${matchedService ? matchedService.unit : ''}`;
    if (quantity && !quantity.includes('Not sure')) {
      let mult = 1;
      const q = quantity.toLowerCase();
      if (q.includes('1–3') || q.includes('1-3')) mult = 2;
      else if (q.includes('4–6') || q.includes('4-6')) mult = 5;
      else if (q.includes('7–10') || q.includes('7-10')) mult = 8;
      else if (q.includes('10+')) mult = 12;
      estimatedPriceStr = `~₹${Math.round(unitPrice * mult)}`;
    }

    const bookingRef = generateBookingReference();

    const newBookingData = {
      booking_ref: bookingRef,
      customer_name: full_name.trim(),
      mobile_number: cleanMobile,
      pickup_address: address.trim(),
      area: area.trim(),
      service_name: service.trim(),
      service_id: serviceId,
      unit_price: unitPrice,
      quantity: quantity.trim(),
      estimated_price: estimatedPriceStr,
      pickup_date,
      pickup_time: pickup_time.trim(),
      special_instructions: instructions ? instructions.trim() : ''
    };

    const savedResult = await db.createBooking(newBookingData);

    // Build the Preserved Owner WhatsApp Message
    const settings = await db.getSettings();
    const ownerPhone = settings.whatsapp_number || '917860462268';
    const ownerName = settings.owner_name || 'Diwakar Ji';

    const waMsg = buildOwnerWhatsAppMessage(newBookingData, bookingRef, ownerName);
    const waUrl = getOwnerWhatsAppUrl(waMsg, ownerPhone);

    return res.status(201).json({
      success: true,
      booking_ref: bookingRef,
      booking_id: savedResult.id,
      message: 'Booking successfully saved to database.',
      whatsapp_url: waUrl,
      whatsapp_message: waMsg,
      booking: { ...newBookingData, id: savedResult.id }
    });
  } catch (err) {
    console.error('Booking submission error:', err);
    return res.status(500).json({ success: false, message: 'Server error processing your booking. Please try again.' });
  }
}

// 4. PATCH /api/bookings/:ref/notification
async function updateNotificationStatus(req, res) {
  try {
    const { ref } = req.params;
    if (!ref) return res.status(400).json({ success: false, message: 'Booking reference is required.' });

    await db.markWhatsAppNotified(ref);
    return res.json({ success: true, message: 'WhatsApp notification recorded.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update notification status' });
  }
}

module.exports = {
  getPublicConfig,
  getActiveServices,
  createBooking,
  updateNotificationStatus
};
