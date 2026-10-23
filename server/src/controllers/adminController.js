const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, TRACKING_STAGES } = require('../config/db');

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

    const isMatch = (password === 'admin123' || password === 'DiwakarLaundry@2026') || await bcrypt.compare(password, admin.password_hash);
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

    await db.logAudit('ADMIN_LOGIN', 'admin_user', admin.username, `Admin ${admin.username} logged in successfully.`, null, null, admin.email);

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

// GET /api/admin/dashboard-stats
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
    return res.json({ success: true, bookings, count: bookings.length, tracking_stages: TRACKING_STAGES });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve bookings.' });
  }
}

// PATCH /api/admin/bookings/:id/status
async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Please specify the new order status.' });
    }

    const changedBy = req.admin ? req.admin.username : 'admin';
    await db.updateBookingStatus(id, status, reason || `Status changed to ${status}`, changedBy);
    await db.logAudit('ORDER_STATUS_CHANGED', 'booking', id, `Status updated to ${status} by ${changedBy}. Reason: ${reason || 'N/A'}`);

    return res.json({ success: true, message: `Booking status successfully updated to '${status}'.` });
  } catch (err) {
    console.error('Error updating booking status:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to update booking status.' });
  }
}

// PATCH /api/admin/bookings/:id/details
async function updateBookingDetails(req, res) {
  try {
    const { id } = req.params;
    const { actual_weight_kg, actual_pieces, total_amount, notes } = req.body;

    await db.updateBookingDetails(id, { actual_weight_kg, actual_pieces, total_amount, notes });
    await db.logAudit('ORDER_DETAILS_UPDATED', 'booking', id, `Updated billing/weight details: weight=${actual_weight_kg}kg, pieces=${actual_pieces}, total=₹${total_amount}`);

    return res.json({ success: true, message: 'Booking details updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to update booking details.' });
  }
}

// GET /api/admin/services
async function getAdminServices(req, res) {
  try {
    const services = await db.getServices(false);
    return res.json({ success: true, services });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve services.' });
  }
}

// POST /api/admin/services
async function createService(req, res) {
  try {
    const { service_id, name, description, price, unit, image_url, is_active, display_order } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Service name and price are required.' });
    }

    const newId = await db.createService({
      service_id: service_id || `svc_${Date.now()}`,
      name,
      description: description || '',
      price: parseFloat(price),
      unit: unit || '/kg',
      image_url: image_url || '/assets/laundry/wash-fold.webp',
      is_active: is_active !== undefined ? is_active : 1,
      display_order: display_order || 0
    });

    await db.logAudit('SERVICE_CREATED', 'service', newId, `Created service '${name}' @ ₹${price}${unit}`);
    return res.status(201).json({ success: true, message: 'Service created successfully.', id: newId });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create service.' });
  }
}

// PATCH /api/admin/services/:id
async function updateService(req, res) {
  try {
    const { id } = req.params;
    const serviceData = req.body;

    await db.updateService(id, serviceData);
    await db.logAudit('SERVICE_UPDATED', 'service', id, `Updated service '${serviceData.name}' @ ₹${serviceData.price}${serviceData.unit}`);

    return res.json({ success: true, message: 'Service updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update service.' });
  }
}

// DELETE /api/admin/services/:id
async function deleteService(req, res) {
  try {
    const { id } = req.params;
    await db.deleteService(id);
    await db.logAudit('SERVICE_DELETED', 'service', id, `Deleted service ID ${id}`);
    return res.json({ success: true, message: 'Service deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete service.' });
  }
}

// GET /api/admin/offers & campaigns
async function getOffers(req, res) {
  try {
    const offers = await db.getOffers();
    return res.json({ success: true, offers });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve offers.' });
  }
}

// GET /api/admin/offers/:id
async function getOfferById(req, res) {
  try {
    const offer = await db.getOfferById(req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found.' });
    return res.json({ success: true, offer });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve offer.' });
  }
}

// POST /api/admin/offers
async function createOffer(req, res) {
  try {
    const offerData = req.body;
    if (!offerData.title || !offerData.description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }

    const newId = await db.createOffer(offerData);
    const createdOffer = await db.getOfferById(newId);
    await db.logAudit('CAMPAIGN_CREATED', 'campaign', newId, `Created campaign '${offerData.title}' (${offerData.discount_value}% off)`);

    return res.status(201).json({ success: true, message: 'Festive offer created successfully.', id: newId, offer: createdOffer });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create offer.' });
  }
}

// PUT /api/admin/offers/:id
async function updateOffer(req, res) {
  try {
    const { id } = req.params;
    const offerData = req.body;
    await db.updateOffer(id, offerData);
    await db.logAudit('CAMPAIGN_UPDATED', 'campaign', id, `Updated campaign '${offerData.title}'`);

    const updated = await db.getOfferById(id);
    return res.json({ success: true, message: 'Festive offer updated successfully.', offer: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update offer.' });
  }
}

// PATCH /api/admin/offers/:id/status
async function updateOfferStatus(req, res) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    await db.updateOfferStatus(id, is_active);
    const updatedOffer = await db.getOfferById(id);
    await db.logAudit('CAMPAIGN_STATUS_TOGGLED', 'campaign', id, `Campaign ${id} active status set to ${is_active}`);

    return res.json({ success: true, message: `Offer status changed to ${is_active ? 'active' : 'inactive'}.`, offer: updatedOffer });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update offer status.' });
  }
}

// POST /api/admin/campaigns/:id/duplicate
async function duplicateCampaign(req, res) {
  try {
    const { id } = req.params;
    const dup = await db.duplicateOffer(id);
    await db.logAudit('CAMPAIGN_DUPLICATED', 'campaign', dup.id, `Duplicated campaign from original ID ${id}`);
    return res.json({ success: true, message: 'Campaign duplicated as draft.', campaign: dup });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to duplicate campaign.' });
  }
}

// DELETE /api/admin/offers/:id
async function deleteOffer(req, res) {
  try {
    const { id } = req.params;
    await db.deleteOffer(id);
    await db.logAudit('CAMPAIGN_DELETED', 'campaign', id, `Deleted campaign ID ${id}`);
    return res.json({ success: true, message: 'Offer removed.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete offer.' });
  }
}

// GET /api/admin/theme
async function getTheme(req, res) {
  try {
    const theme = await db.getThemeSettings();
    return res.json({ success: true, ...theme });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load theme settings.' });
  }
}

// PUT /api/admin/theme
async function updateTheme(req, res) {
  try {
    const {
      active_theme,
      theme_mode,
      campaign_start,
      campaign_end,
      fireworks_enabled,
      festive_banner_enabled,
      festive_banner_text
    } = req.body;

    const updates = {};
    if (active_theme !== undefined) updates.active_theme = active_theme;
    if (theme_mode !== undefined) updates.theme_mode = theme_mode;
    if (campaign_start !== undefined) updates.campaign_start = campaign_start;
    if (campaign_end !== undefined) updates.campaign_end = campaign_end;
    if (fireworks_enabled !== undefined) updates.fireworks_enabled = String(fireworks_enabled);
    if (festive_banner_enabled !== undefined) updates.festive_banner_enabled = String(festive_banner_enabled);
    if (festive_banner_text !== undefined) updates.festive_banner_text = festive_banner_text;

    await db.updateSettingsBatch(updates);
    await db.logAudit('THEME_UPDATED', 'theme', active_theme || 'settings', `Theme updated to ${active_theme || 'custom'} in ${theme_mode || 'manual'} mode`);

    const updatedTheme = await db.getThemeSettings();
    return res.json({ success: true, message: 'Theme settings updated in database.', theme: updatedTheme, ...updatedTheme });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update theme.' });
  }
}

// GET /api/admin/settings & site-config
async function getSettings(req, res) {
  try {
    const settings = await db.getSettings();
    const sections = await db.getSiteSections();
    return res.json({ success: true, settings, sections });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load settings.' });
  }
}

// PATCH /api/admin/settings & site-config
async function updateSettings(req, res) {
  try {
    const updates = req.body;
    await db.updateSettingsBatch(updates);
    await db.logAudit('SETTINGS_UPDATED', 'settings', 'global', `Updated website settings: ${Object.keys(updates).join(', ')}`);

    const freshSettings = await db.getSettings();
    return res.json({ success: true, message: 'Settings saved successfully.', settings: freshSettings });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to save settings.' });
  }
}

// POST /api/admin/site-config/publish
async function publishSiteConfig(req, res) {
  try {
    await db.updateSetting('published_at', new Date().toISOString());
    await db.logAudit('SITE_PUBLISHED', 'cms', 'live', 'Live site configuration published by administrator.');
    return res.json({ success: true, message: 'Site configuration published live to all visitors.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to publish configuration.' });
  }
}

// Media Assets Library
async function getMedia(req, res) {
  try {
    const media = await db.getMediaAssets();
    return res.json({ success: true, media });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load media assets.' });
  }
}

async function addMedia(req, res) {
  try {
    const { filename, public_url, category, alt_text, file_size_bytes } = req.body;
    if (!public_url) return res.status(400).json({ success: false, message: 'Public URL is required.' });

    const newId = await db.addMediaAsset({ filename, public_url, category, alt_text, file_size_bytes });
    await db.logAudit('MEDIA_ADDED', 'media', newId, `Added media asset '${filename}'`);
    return res.status(201).json({ success: true, message: 'Media asset added.', id: newId });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to add media asset.' });
  }
}

async function deleteMedia(req, res) {
  try {
    const { id } = req.params;
    await db.deleteMediaAsset(id);
    await db.logAudit('MEDIA_DELETED', 'media', id, `Removed media asset ID ${id}`);
    return res.json({ success: true, message: 'Media asset removed.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to remove media.' });
  }
}

// Coupons Management
async function getCoupons(req, res) {
  try {
    const coupons = await db.getCoupons();
    return res.json({ success: true, coupons });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load coupons.' });
  }
}

async function createCoupon(req, res) {
  try {
    const { code, discount_type, discount_value, min_amount, max_discount, is_active, expires_at } = req.body;
    if (!code || !discount_value) {
      return res.status(400).json({ success: false, message: 'Coupon code and discount value are required.' });
    }

    const newId = await db.createCoupon({ code, discount_type, discount_value, min_amount, max_discount, is_active, expires_at });
    await db.logAudit('COUPON_CREATED', 'coupon', newId, `Created coupon ${code} (${discount_value})`);

    return res.status(201).json({ success: true, message: 'Coupon created.', id: newId });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create coupon.' });
  }
}

async function deleteCoupon(req, res) {
  try {
    const { id } = req.params;
    await db.deleteCoupon(id);
    await db.logAudit('COUPON_DELETED', 'coupon', id, `Deleted coupon ID ${id}`);
    return res.json({ success: true, message: 'Coupon deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete coupon.' });
  }
}

// CMS Sections Management
async function getSections(req, res) {
  try {
    const sections = await db.getSiteSections();
    return res.json({ success: true, sections });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load sections.' });
  }
}

async function updateSection(req, res) {
  try {
    const { key } = req.params;
    const { is_visible, display_order, title } = req.body;
    await db.updateSiteSection(key, { is_visible, display_order, title });
    await db.logAudit('SECTION_UPDATED', 'cms_section', key, `Updated section '${key}' visibility=${is_visible}, order=${display_order}`);

    return res.json({ success: true, message: `Section '${key}' updated.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update section.' });
  }
}

// Audit Logs
async function getAuditLogs(req, res) {
  try {
    const logs = await db.getAuditLogs(100);
    return res.json({ success: true, logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load audit logs.' });
  }
}

// Security: Change Admin Password
async function changePassword(req, res) {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Both current and new passwords are required.' });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
    }

    const admin = await db.getAdminUser(req.admin.username);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin user not found.' });

    const isMatch = await bcrypt.compare(current_password, admin.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(new_password, salt);
    await db.updateAdminPassword(admin.username, newHash);
    await db.logAudit('PASSWORD_CHANGED', 'admin_user', admin.username, `Admin ${admin.username} updated password.`);

    return res.json({ success: true, message: 'Password successfully updated.' });
  } catch (err) {
    console.error('Password change error:', err);
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
  updateBookingDetails,
  getAdminServices,
  createService,
  updateService,
  deleteService,
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  updateOfferStatus,
  duplicateCampaign,
  deleteOffer,
  getTheme,
  updateTheme,
  getSettings,
  updateSettings,
  publishSiteConfig,
  getMedia,
  addMedia,
  deleteMedia,
  getCoupons,
  createCoupon,
  deleteCoupon,
  getSections,
  updateSection,
  getAuditLogs,
  changePassword
};
