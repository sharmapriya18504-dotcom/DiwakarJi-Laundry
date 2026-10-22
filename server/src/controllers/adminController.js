const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'diwakar_ji_laundry_secure_jwt_secret_kanpur_2026_festive';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/admin/login
async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const admin = await db.getAdminUser(username.trim());
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Access denied.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Access denied.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        email: admin.email
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ success: false, message: 'Login processing failed.' });
  }
}

// POST /api/admin/logout
async function logout(req, res) {
  res.clearCookie('admin_token');
  return res.json({ success: true, message: 'Successfully logged out.' });
}

// GET /api/admin/me
async function getMe(req, res) {
  try {
    const admin = await db.getAdminUser(req.admin.username);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found.' });

    return res.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        email: admin.email
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to verify session.' });
  }
}

// GET /api/admin/dashboard
async function getDashboardStats(req, res) {
  try {
    const stats = await db.getDashboardStats();
    return res.json({ success: true, stats });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load dashboard metrics.' });
  }
}

// GET /api/admin/bookings
async function getBookings(req, res) {
  try {
    const { status, search, date } = req.query;
    const bookings = await db.getBookings({ status, search, date });
    return res.json({ success: true, bookings, count: bookings.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve bookings.' });
  }
}

// PATCH /api/admin/bookings/:id/status
async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    await db.updateBookingStatus(id, status, reason || '', req.admin.username || 'admin');
    return res.json({ success: true, message: `Booking status updated to ${status}.` });
  } catch (err) {
    console.error('Update status error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to update booking status.' });
  }
}

// GET /api/admin/services
async function getAdminServices(req, res) {
  try {
    const services = await db.getServices(false);
    return res.json({ success: true, services });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch services.' });
  }
}

// PATCH /api/admin/services/:id
async function updateService(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, unit, is_active, display_order } = req.body;

    if (!name || isNaN(price)) {
      return res.status(400).json({ success: false, message: 'Valid name and price are required.' });
    }

    await db.updateService(id, {
      name,
      description: description || '',
      price: parseFloat(price),
      unit: unit || '/kg',
      is_active: is_active ? 1 : 0,
      display_order: parseInt(display_order || 0, 10)
    });

    return res.json({ success: true, message: 'Service updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update service.' });
  }
}

// POST /api/admin/services
async function createService(req, res) {
  try {
    const { service_id, name, description, price, unit, image_url, is_active, display_order } = req.body;

    if (!service_id || !name || isNaN(price)) {
      return res.status(400).json({ success: false, message: 'service_id, name and price are required.' });
    }

    const newId = await db.createService({
      service_id: service_id.toLowerCase().replace(/\s+/g, '_'),
      name,
      description: description || '',
      price: parseFloat(price),
      unit: unit || '/kg',
      image_url: image_url || '/wash_fold.png',
      is_active: is_active !== false ? 1 : 0,
      display_order: parseInt(display_order || 0, 10)
    });

    return res.status(201).json({ success: true, message: 'Service created successfully.', id: newId });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create service.' });
  }
}

// GET /api/admin/settings
async function getSettings(req, res) {
  try {
    const settings = await db.getSettings();
    return res.json({ success: true, settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load website settings.' });
  }
}

// PATCH /api/admin/settings
async function updateSettings(req, res) {
  try {
    const settings = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Settings object is required.' });
    }

    await db.updateSettingsBatch(settings);
    const updated = await db.getSettings();
    return res.json({ success: true, message: 'Website settings updated successfully.', settings: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to save settings.' });
  }
}

// POST /api/admin/change-password
async function changePassword(req, res) {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password || new_password.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
    }

    const admin = await db.getAdminUser(req.admin.username);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin user not found.' });

    const isMatch = await bcrypt.compare(current_password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password does not match.' });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await db.updateAdminPassword(admin.username, newHash);

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
}

module.exports = {
  login,
  logout,
  getMe,
  getDashboardStats,
  getBookings,
  updateBookingStatus,
  getAdminServices,
  updateService,
  createService,
  getSettings,
  updateSettings,
  changePassword
};
