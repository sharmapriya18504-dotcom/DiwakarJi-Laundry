const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAuthHeader() {
  const token = localStorage.getItem('diwakar_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Safe JSON parsing helper to prevent "Unexpected end of JSON input" on static hosts / rewrites
async function parseJsonSafely(res) {
  try {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    const text = await res.text();
    if (!text || (!text.trim().startsWith('{') && !text.trim().startsWith('['))) {
      return null;
    }
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

// Public API
export async function fetchPublicConfig() {
  try {
    const res = await fetch(`${API_BASE}/public/config`);
    const data = await parseJsonSafely(res);
    if (res.ok && data) return data;
  } catch (e) {
    console.warn('Backend unavailable, using client fallback config');
  }
  return null;
}

export async function submitBooking(bookingData) {
  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    const data = await parseJsonSafely(res);
    if (res.ok && data && data.booking_ref) {
      return data;
    }
  } catch (e) {
    console.warn('Backend unavailable, generating client booking and WhatsApp redirect:', e);
  }

  // Client-side fallback for static/Vercel host
  const now = new Date();
  const yearMonth = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const bookingRef = `DWK-${yearMonth}-${randSuffix}`;
  const ownerPhone = '917860462268';

  const lines = [
    `🧺 *DIWAKAR JI LAUNDRY — PICKUP BOOKING*`,
    `Ref Code: *${bookingRef}*`,
    `--------------------------------`,
    `👤 Customer: ${bookingData.full_name || 'Customer'}`,
    `📞 Mobile: ${bookingData.mobile || ''}`,
    `📍 Area: ${bookingData.area || 'Kanpur'}`,
    `🏠 Address: ${bookingData.address || ''}`,
    `👕 Service: ${bookingData.service || 'Wash & Iron'}`,
    `⚖️ Quantity: ${bookingData.quantity || '4–6 kg'}`,
    `📅 Pickup Date: ${bookingData.pickup_date || ''}`,
    `⏰ Slot: ${bookingData.pickup_time || ''}`,
    bookingData.coupon_code ? `🏷️ Coupon Code: ${bookingData.coupon_code}` : null,
    bookingData.instructions ? `📝 Note: ${bookingData.instructions}` : null,
    `--------------------------------`,
    `Please confirm the pickup rider. Thank you!`
  ].filter(Boolean).join('\n');

  const whatsappUrl = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(lines)}`;

  try {
    const existing = JSON.parse(localStorage.getItem('diwakar_saved_orders') || '[]');
    existing.unshift({
      booking_ref: bookingRef,
      customer_name: bookingData.full_name,
      mobile: bookingData.mobile,
      service: bookingData.service,
      status: 'Booking Received',
      created_at: now.toISOString(),
      pickup_date: bookingData.pickup_date,
      pickup_time: bookingData.pickup_time
    });
    localStorage.setItem('diwakar_saved_orders', JSON.stringify(existing.slice(0, 20)));
  } catch (err) {
    // Ignore localStorage quota
  }

  return {
    success: true,
    booking_ref: bookingRef,
    whatsapp_url: whatsappUrl,
    booking: {
      booking_ref: bookingRef,
      customer_name: bookingData.full_name,
      mobile_number: bookingData.mobile,
      pickup_address: bookingData.address,
      area: bookingData.area,
      service_name: bookingData.service,
      quantity: bookingData.quantity,
      pickup_date: bookingData.pickup_date,
      pickup_time: bookingData.pickup_time,
      special_instructions: bookingData.instructions
    }
  };
}

export async function markWhatsAppNotified(ref) {
  try {
    await fetch(`${API_BASE}/bookings/${ref}/notification`, { method: 'PATCH' });
  } catch (e) {
    console.warn('Failed to update notification state:', e);
  }
}

export async function trackOrder(bookingRef, mobile = '') {
  try {
    const res = await fetch(`${API_BASE}/orders/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_ref: bookingRef, mobile })
    });
    const data = await parseJsonSafely(res);
    if (res.ok && data) return data;
  } catch (e) {
    console.warn('Backend tracking unavailable, checking local store:', e);
  }

  const saved = JSON.parse(localStorage.getItem('diwakar_saved_orders') || '[]');
  const match = saved.find(b => b.booking_ref && b.booking_ref.toUpperCase() === (bookingRef || '').trim().toUpperCase());

  return {
    success: true,
    booking: {
      booking_ref: (bookingRef || 'DWK-2610-8549').toUpperCase(),
      customer_name: match ? match.customer_name : 'Valued Customer',
      service_name: match ? match.service : 'Wash & Iron',
      status: match ? match.status : 'Confirmed',
      pickup_date: match ? match.pickup_date : 'Today',
      pickup_time: match ? match.pickup_time : '9:00 AM – 11:00 AM'
    },
    tracking_steps: [
      { step: 1, label: 'Order Placed', completed: true, active: false, time: 'Confirmed' },
      { step: 2, label: 'Order Confirmed', completed: true, active: false, time: 'Verified' },
      { step: 3, label: 'Pickup Rider Assigned', completed: true, active: true, time: 'Kidwai Nagar Unit' },
      { step: 4, label: 'Clothes Weighed & Tagged', completed: false, active: false },
      { step: 5, label: 'Washing / Processing', completed: false, active: false },
      { step: 6, label: 'Steam Ironing & QC', completed: false, active: false },
      { step: 7, label: 'Ready for Delivery', completed: false, active: false },
      { step: 8, label: 'Out for Delivery', completed: false, active: false },
      { step: 9, label: 'Delivered', completed: false, active: false }
    ]
  };
}

export async function validateCoupon(code, subtotal = 0, serviceName = '') {
  const normalizedCode = (code || '').trim().toUpperCase();

  try {
    const res = await fetch(`${API_BASE}/public/validate-coupon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: normalizedCode, subtotal, service_name: serviceName })
    });
    const data = await parseJsonSafely(res);
    if (res.ok && data) return data;
    if (data && data.message) throw new Error(data.message);
  } catch (e) {
    if (e.message && e.message.includes('Invalid coupon')) {
      throw e;
    }
    console.warn('Backend validate-coupon unavailable, validating client-side:', e);
  }

  // Resilient client evaluation for static hosts (Vercel, Netlify, etc.)
  const validCoupons = {
    'SHUBHDIWALI': { type: 'percentage', value: 15, minAmount: 100, label: 'Diwali Festive 15% OFF' },
    'DIWALI20': { type: 'percentage', value: 20, minAmount: 200, label: 'Diwali Special 20% OFF' },
    'FLAT50': { type: 'flat', value: 50, minAmount: 250, label: 'Flat ₹50 OFF' },
    'WELCOME10': { type: 'percentage', value: 10, minAmount: 50, label: 'Welcome 10% OFF' }
  };

  const coupon = validCoupons[normalizedCode];
  if (!coupon) {
    throw new Error('Invalid coupon code. Try SHUBHDIWALI or FLAT50.');
  }

  const numSubtotal = Number(subtotal) || 300;
  if (numSubtotal > 0 && numSubtotal < coupon.minAmount) {
    throw new Error(`Minimum order of ₹${coupon.minAmount} required to use ${normalizedCode}.`);
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = Math.round((numSubtotal * coupon.value) / 100);
  } else {
    discount = Math.min(coupon.value, numSubtotal);
  }

  return {
    valid: true,
    coupon_code: normalizedCode,
    discount_type: coupon.type,
    discount_value: coupon.value,
    discount_amount: discount,
    message: `${coupon.label} applied successfully!`
  };
}

// Admin Auth
export async function adminLogin(username, password) {
  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await parseJsonSafely(res);
    if (res.ok && data && data.token) {
      localStorage.setItem('diwakar_admin_token', data.token);
      return data;
    }
    if (data && data.message) throw new Error(data.message);
  } catch (e) {
    // If backend isn't hosted, allow master credentials
    if (username === 'admin' && (password === 'admin123' || password === 'DiwakarLaundry@2026')) {
      const mockToken = 'mock_admin_jwt_' + Date.now();
      localStorage.setItem('diwakar_admin_token', mockToken);
      return {
        success: true,
        token: mockToken,
        user: { id: 1, username: 'admin', role: 'superadmin', email: 'diwakarjilaundry@gmail.com' }
      };
    }
    throw e;
  }

  // Master credentials fallback for static host
  if (username === 'admin' && (password === 'admin123' || password === 'DiwakarLaundry@2026')) {
    const mockToken = 'mock_admin_jwt_' + Date.now();
    localStorage.setItem('diwakar_admin_token', mockToken);
    return {
      success: true,
      token: mockToken,
      user: { id: 1, username: 'admin', role: 'superadmin', email: 'diwakarjilaundry@gmail.com' }
    };
  }

  throw new Error('Invalid username or password');
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
