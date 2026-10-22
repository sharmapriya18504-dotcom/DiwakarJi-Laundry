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

// Website Public Configuration & Services
router.get('/public/config', publicController.getPublicConfig);
router.get('/services', publicController.getActiveServices);
router.get('/offers/active', publicController.getActiveOffer);
router.get('/theme', publicController.getThemeSettings);

// Customer Booking Submission (Rate Limited)
router.post('/bookings', bookingLimiter, publicController.createBooking);

// Track Owner WhatsApp Notification Trigger
router.patch('/bookings/:ref/notification', publicController.updateNotificationStatus);

module.exports = router;
