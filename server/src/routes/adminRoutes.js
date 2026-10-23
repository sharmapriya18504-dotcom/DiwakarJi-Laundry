const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');

// Public Admin Auth
router.post('/login', loginLimiter, adminController.login);
router.post('/logout', adminController.logout);

// Protected Admin Endpoints
router.use(authMiddleware);

// Session Verification & KPIs
router.get('/me', adminController.getMe);
router.get('/auth-check', adminController.getMe);
router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/dashboard', adminController.getDashboardStats);

// Bookings & Orders Management
router.get('/bookings', adminController.getBookings);
router.patch('/bookings/:id/status', adminController.updateBookingStatus);
router.patch('/bookings/:id/details', adminController.updateBookingDetails);

// Services & Pricing Management
router.get('/services', adminController.getAdminServices);
router.post('/services', adminController.createService);
router.patch('/services/:id', adminController.updateService);
router.delete('/services/:id', adminController.deleteService);

// Offers & Dynamic Campaigns Management
router.get('/offers', adminController.getOffers);
router.get('/campaigns', adminController.getOffers);
router.get('/offers/:id', adminController.getOfferById);
router.post('/offers', adminController.createOffer);
router.post('/campaigns', adminController.createOffer);
router.put('/offers/:id', adminController.updateOffer);
router.patch('/campaigns/:id', adminController.updateOffer);
router.patch('/offers/:id/status', adminController.updateOfferStatus);
router.post('/campaigns/:id/publish', (req, res, next) => {
  req.body.is_active = 1;
  return adminController.updateOfferStatus(req, res, next);
});
router.post('/campaigns/:id/disable', (req, res, next) => {
  req.body.is_active = 0;
  return adminController.updateOfferStatus(req, res, next);
});
router.post('/campaigns/:id/duplicate', adminController.duplicateCampaign);
router.delete('/offers/:id', adminController.deleteOffer);
router.delete('/campaigns/:id', adminController.deleteOffer);

// Theme Configuration & Scheduling
router.get('/theme', adminController.getTheme);
router.put('/theme', adminController.updateTheme);
router.patch('/theme', adminController.updateTheme);

// Website Settings & CMS Configuration
router.get('/settings', adminController.getSettings);
router.get('/site-config', adminController.getSettings);
router.patch('/settings', adminController.updateSettings);
router.patch('/site-config', adminController.updateSettings);
router.post('/site-config/publish', adminController.publishSiteConfig);

// CMS Sections Manager
router.get('/sections', adminController.getSections);
router.patch('/sections/:key', adminController.updateSection);

// Media Assets Library
router.get('/media', adminController.getMedia);
router.post('/media', adminController.addMedia);
router.delete('/media/:id', adminController.deleteMedia);

// Coupons Management
router.get('/coupons', adminController.getCoupons);
router.post('/coupons', adminController.createCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

// Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

// Security: Change Admin Password
router.post('/change-password', adminController.changePassword);

module.exports = router;
