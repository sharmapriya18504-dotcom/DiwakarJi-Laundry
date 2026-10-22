const rateLimit = require('express-rate-limit');

// Rate limiter for customer booking submissions
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 booking attempts per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many booking requests from this network. Please wait a few minutes before trying again or contact Diwakar Ji directly on WhatsApp.'
  }
});

// Strict rate limiter for admin login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 failed login attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes before retrying.'
  }
});

module.exports = { bookingLimiter, loginLimiter };
