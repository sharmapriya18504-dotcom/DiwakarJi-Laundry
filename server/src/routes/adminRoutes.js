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

// Bookings Management
router.get('/bookings', adminController.getBookings);
router.patch('/bookings/:id/status', adminController.updateBookingStatus);

// Services & Pricing Management
router.get('/services', adminController.getAdminServices);
router.post('/services', adminController.createService);
router.patch('/services/:id', adminController.updateService);

// Website Settings & Dynamic Theme Engine
router.get('/settings', adminController.getSettings);
router.patch('/settings', adminController.updateSettings);

// Security
router.post('/change-password', adminController.changePassword);

module.exports = router;
