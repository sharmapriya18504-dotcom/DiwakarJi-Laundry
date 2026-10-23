const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const { bookingLimiter } = require('../middleware/rateLimiter');

// System Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Diwakar Ji Laundry API v2.0'
  });
});

// Website Public Configuration & Services (both /public/config and /public/site-config)
router.get('/public/config', publicController.getPublicConfig);
router.get('/public/site-config', publicController.getPublicConfig);
router.get('/public/services', publicController.getActiveServices);
router.get('/services', publicController.getActiveServices);
router.get('/public/campaign', publicController.getActiveOffer);
router.get('/offers/active', publicController.getActiveOffer);
router.get('/public/faqs', publicController.getFaqs);
router.get('/theme', publicController.getThemeSettings);

// Public Coupon Code Validation
router.post('/public/validate-coupon', publicController.validateCoupon);
router.post('/validate-coupon', publicController.validateCoupon);

// Customer Booking Submission (Rate Limited)
router.post('/bookings', bookingLimiter, publicController.createBooking);

// Public Order Tracking
router.post('/orders/track', publicController.trackOrder);
router.get('/public/track/:ref', publicController.trackOrder);

// Track Owner WhatsApp Notification Trigger
router.patch('/bookings/:ref/notification', publicController.updateNotificationStatus);

module.exports = router;
