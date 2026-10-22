const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAuthHeader() {
  const token = localStorage.getItem('diwakar_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE}/admin/dashboard-stats`, {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('Failed to load dashboard metrics');
  return res.json();
}

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

export async function fetchAdminServices() {
  const res = await fetch(`${API_BASE}/admin/services`, {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('Failed to load services');
  return res.json();
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

export async function fetchAdminSettings() {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
}

export async function updateAdminSettings(settings) {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(settings)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update settings');
  return data;
}

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

export async function fetchActiveOffer() {
  const res = await fetch(`${API_BASE}/offers/active`);
  if (!res.ok) throw new Error('Failed to fetch active offer');
  return res.json();
}

export async function fetchThemeSettings() {
  const res = await fetch(`${API_BASE}/theme`);
  if (!res.ok) throw new Error('Failed to fetch theme settings');
  return res.json();
}

export async function fetchAdminOffers() {
  const res = await fetch(`${API_BASE}/admin/offers`, {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('Failed to fetch offers');
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

export async function updateAdminOfferStatus(id, is_active) {
  const res = await fetch(`${API_BASE}/admin/offers/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ is_active })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update offer status');
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

export async function fetchAdminTheme() {
  const res = await fetch(`${API_BASE}/admin/theme`, {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('Failed to fetch theme configuration');
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
  if (!res.ok) throw new Error(data.message || 'Failed to update theme configuration');
  return data;
}
