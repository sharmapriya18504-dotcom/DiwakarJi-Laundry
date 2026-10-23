const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAuthHeader() {
  const token = localStorage.getItem('diwakar_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Public API
export async function fetchPublicConfig() {
  const res = await fetch(`${API_BASE}/public/config`);
  if (!res.ok) throw new Error('Failed to fetch public config');
  return res.json();
}

export async function submitBooking(bookingData) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to submit booking');
  }
  return data;
}

export async function markWhatsAppNotified(ref) {
  try {
    await fetch(`${API_BASE}/bookings/${ref}/notification`, { method: 'PATCH' });
  } catch (e) {
    console.warn('Failed to update notification state:', e);
  }
}

export async function trackOrder(bookingRef, mobile = '') {
  const res = await fetch(`${API_BASE}/orders/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_ref: bookingRef, mobile })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to track order');
  return data;
}

export async function validateCoupon(code, subtotal = 0, serviceName = '') {
  const res = await fetch(`${API_BASE}/public/validate-coupon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, subtotal, service_name: serviceName })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Invalid coupon code');
  return data;
}

// Admin Auth
export async function adminLogin(username, password) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

export async function adminLogout() {
  try {
    await fetch(`${API_BASE}/admin/logout`, { method: 'POST' });
  } catch (e) {
    // Ignore error
  }
  localStorage.removeItem('diwakar_admin_token');
}

export async function fetchAdminMe() {
  const res = await fetch(`${API_BASE}/admin/me`, {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

// Dashboard KPIs
export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE}/admin/dashboard-stats`, {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('Failed to load dashboard metrics');
  return res.json();
}

// Bookings & Orders
export async function fetchAdminBookings(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.date) params.append('date', filters.date);

  const res = await fetch(`${API_BASE}/admin/bookings?${params.toString()}`, {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('Failed to load bookings');
  return res.json();
}

export async function updateBookingStatus(id, status, reason = '') {
  const res = await fetch(`${API_BASE}/admin/bookings/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ status, reason })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update status');
  return data;
}

export async function updateBookingDetails(id, details) {
  const res = await fetch(`${API_BASE}/admin/bookings/${id}/details`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(details)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update booking details');
  return data;
}

// Services
export async function fetchAdminServices() {
  const res = await fetch(`${API_BASE}/admin/services`, {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('Failed to load services');
  return res.json();
}

export async function createAdminService(serviceData) {
  const res = await fetch(`${API_BASE}/admin/services`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(serviceData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create service');
  return data;
}

export async function updateAdminService(id, serviceData) {
  const res = await fetch(`${API_BASE}/admin/services/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(serviceData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update service');
  return data;
}

export async function deleteAdminService(id) {
  const res = await fetch(`${API_BASE}/admin/services/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete service');
  return data;
}

// Settings & CMS
export async function fetchAdminSettings() {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
}

export async function updateAdminSettings(settingsObj) {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(settingsObj)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to save settings');
  return data;
}

export async function publishSiteConfig() {
  const res = await fetch(`${API_BASE}/admin/site-config/publish`, {
    method: 'POST',
    headers: { ...getAuthHeader() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to publish config');
  return data;
}

// Media Assets
export async function fetchAdminMedia() {
  const res = await fetch(`${API_BASE}/admin/media`, {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('Failed to load media assets');
  return res.json();
}

export async function addAdminMedia(mediaData) {
  const res = await fetch(`${API_BASE}/admin/media`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(mediaData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add media');
  return data;
}

export async function deleteAdminMedia(id) {
  const res = await fetch(`${API_BASE}/admin/media/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete media');
  return data;
}

// Offers & Campaigns
export async function fetchAdminOffers() {
  const res = await fetch(`${API_BASE}/admin/offers`, {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('Failed to load offers');
  return res.json();
}

export async function createAdminOffer(offerData) {
  const res = await fetch(`${API_BASE}/admin/offers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(offerData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create offer');
  return data;
}

export async function updateAdminOffer(id, offerData) {
  const res = await fetch(`${API_BASE}/admin/offers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(offerData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update offer');
  return data;
}

export async function updateAdminOfferStatus(id, isActive) {
  const res = await fetch(`${API_BASE}/admin/offers/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ is_active: isActive })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to toggle offer status');
  return data;
}

export async function duplicateAdminCampaign(id) {
  const res = await fetch(`${API_BASE}/admin/campaigns/${id}/duplicate`, {
    method: 'POST',
    headers: { ...getAuthHeader() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to duplicate campaign');
  return data;
}

export async function deleteAdminOffer(id) {
  const res = await fetch(`${API_BASE}/admin/offers/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete offer');
  return data;
}

// Coupons
export async function fetchAdminCoupons() {
  const res = await fetch(`${API_BASE}/admin/coupons`, {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('Failed to load coupons');
  return res.json();
}

export async function createAdminCoupon(couponData) {
  const res = await fetch(`${API_BASE}/admin/coupons`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(couponData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create coupon');
  return data;
}

export async function deleteAdminCoupon(id) {
  const res = await fetch(`${API_BASE}/admin/coupons/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete coupon');
  return data;
}

// CMS Sections
export async function fetchAdminSections() {
  const res = await fetch(`${API_BASE}/admin/sections`, {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('Failed to load sections');
  return res.json();
}

export async function updateAdminSection(key, data) {
  const res = await fetch(`${API_BASE}/admin/sections/${key}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(data)
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.message || 'Failed to update section');
  return resData;
}

// Theme
export async function fetchAdminTheme() {
  const res = await fetch(`${API_BASE}/admin/theme`, {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('Failed to load theme configuration');
  return res.json();
}

export async function updateAdminTheme(themeData) {
  const res = await fetch(`${API_BASE}/admin/theme`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(themeData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update theme');
  return data;
}

// Audit Logs
export async function fetchAdminAuditLogs() {
  const res = await fetch(`${API_BASE}/admin/audit-logs`, {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('Failed to load audit logs');
  return res.json();
}

// Security: Change Admin Password
export async function changeAdminPassword(currentPassword, newPassword) {
  const res = await fetch(`${API_BASE}/admin/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to change password');
  return data;
}
