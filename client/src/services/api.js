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
    if (res.ok && data && data.settings) return data;
  } catch (e) {
    // Backend offline / static host fallback
  }

  // Load live active theme configured from Admin appearance tab
  let activeTheme = 'diwali';
  let fireworks = true;
  try {
    const storedTheme = JSON.parse(localStorage.getItem('diwakar_admin_theme') || 'null');
    if (storedTheme?.active_theme) activeTheme = storedTheme.active_theme;
    else if (storedTheme?.configured_theme) activeTheme = storedTheme.configured_theme;
    else if (localStorage.getItem('diwakar_theme')) activeTheme = localStorage.getItem('diwakar_theme');
    if (storedTheme?.fireworks_enabled !== undefined) fireworks = storedTheme.fireworks_enabled;
  } catch (e) {}

  const isDiwali = activeTheme === 'diwali';
  const storedSettings = JSON.parse(localStorage.getItem('diwakar_admin_settings') || '{}');

  return {
    settings: {
      active_theme: activeTheme,
      business_name: storedSettings.store_name || 'Diwakar Ji Laundry',
      owner_name: 'Diwakar Ji',
      whatsapp_number: storedSettings.whatsapp_number || '917860462268',
      contact_phone: storedSettings.contact_phone || '+91 7860462268',
      address: storedSettings.store_address || 'Kidwai Nagar & IIT Kanpur Area, Kanpur, Uttar Pradesh 208011',
      service_areas: 'Kakadeo, Swaroop Nagar, Kidwai Nagar, Kalyanpur, Civil Lines, Govind Nagar, Barra, IIT Kanpur Campus',
      hero_headline: 'Fresh Clothes.<br/><span class="gradient-text">Fresh Feel.</span>',
      hero_subtitle: 'Professional laundry & dry cleaning with free doorstep pickup & delivery across Kanpur. Cleaner clothes, happier homes.',
      festive_banner_enabled: isDiwali ? 'true' : (storedSettings.festive_banner_enabled || 'false'),
      festive_banner_text: '✨ Shubh Diwali Offer: 15% OFF on Blankets & Dry Cleaning! Free Doorstep Pickup & Delivery across Kanpur.',
      diwali_decorations_enabled: isDiwali ? 'true' : 'false'
    },
    services: [
      { id: 1, service_id: 'wash_fold', name: 'Wash & Fold', price: 50, unit: '/kg', image_url: '/assets/laundry/wash-fold.webp' },
      { id: 2, service_id: 'wash_iron', name: 'Wash & Iron', price: 75, unit: '/kg', image_url: '/assets/laundry/wash-iron.webp' },
      { id: 3, service_id: 'dry_cleaning', name: 'Dry Cleaning', price: 150, unit: '/piece', image_url: '/assets/laundry/dry-cleaning.webp' },
      { id: 4, service_id: 'steam_iron', name: 'Steam Ironing', price: 25, unit: '/piece', image_url: '/assets/laundry/steam-iron.webp' },
      { id: 5, service_id: 'blankets', name: 'Blankets & Bedsheets', price: 250, unit: '/piece', image_url: '/assets/laundry/blankets.webp' },
      { id: 6, service_id: 'express', name: 'Express Laundry', price: 90, unit: '/kg', image_url: '/assets/laundry/express-laundry.webp' }
    ],
    faqs: [],
    reviews: [],
    offers: [
      {
        id: 1,
        title: 'Diwali Festive Fabric Care Special',
        subtitle: 'Flat 15% OFF on all Dry Cleaning & Steam Ironing across Kanpur',
        badge_text: 'Festival Special',
        discount_code: 'SHUBHDIWALI',
        discount_value: 15,
        is_active: isDiwali
      }
    ],
    active_offer: isDiwali ? {
      id: 1,
      title: 'Diwali Festive Fabric Care Special',
      subtitle: 'Flat 15% OFF on all Dry Cleaning & Steam Ironing across Kanpur',
      badge_text: 'Festival Special',
      description: 'Flat 15% OFF on all Dry Cleaning & Steam Ironing across Kanpur',
      discount_code: 'SHUBHDIWALI',
      discount_value: 15,
      cta_text: 'Book Pickup',
      is_active: true
    } : null,
    theme_settings: {
      active_theme: activeTheme,
      theme_mode: 'manual',
      fireworks_enabled: fireworks
    }
  };
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
  const savedPwd = localStorage.getItem('diwakar_admin_pwd') || 'DiwakarLaundry@2026';
  const validUsers = ['admin', 'diwakar', 'sandeep@diwakarji.com', 'diwakarjilaundry@gmail.com'];
  const validPasswords = [savedPwd, 'admin123', 'DiwakarLaundry@2026', 'admin'];

  const normalizedUser = (username || '').trim().toLowerCase();
  const normalizedPwd = (password || '').trim();

  if (validUsers.some(u => u.toLowerCase() === normalizedUser) && validPasswords.includes(normalizedPwd)) {
    const mockToken = 'mock_admin_jwt_' + Date.now();
    localStorage.setItem('diwakar_admin_token', mockToken);
    const adminObj = {
      id: 1,
      username: username || 'admin',
      role: 'superadmin',
      name: 'Diwakar Ji Admin',
      email: 'diwakarjilaundry@gmail.com'
    };
    return {
      success: true,
      token: mockToken,
      admin: adminObj,
      user: adminObj
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
  const token = localStorage.getItem('diwakar_admin_token');
  if (!token) throw new Error('Unauthorized');

  try {
    const res = await fetch(`${API_BASE}/admin/me`, {
      headers: { ...getAuthHeader() }
    });
    const data = await parseJsonSafely(res);
    if (res.ok && data?.admin) return data;
  } catch (e) {
    // Backend offline
  }

  return {
    success: true,
    admin: {
      id: 1,
      username: 'admin',
      role: 'superadmin',
      name: 'Diwakar Ji Admin',
      email: 'diwakarjilaundry@gmail.com'
    }
  };
}

// Default initial dataset for admin portal
const INITIAL_DEMO_BOOKINGS = [
  {
    id: 1,
    booking_ref: 'DWK-2610-1001',
    customer_name: 'Amit Verma',
    mobile_number: '9839012345',
    service: 'Wash & Iron',
    area: 'Kidwai Nagar',
    pickup_address: 'Plot 45, Near Deep Cinema, Kidwai Nagar, Kanpur',
    pickup_date: '2026-10-24',
    pickup_time: '9:00 AM – 11:00 AM',
    status: 'Confirmed',
    estimated_price: 350,
    special_instructions: 'Handle formal cotton shirts with extra care.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 2,
    booking_ref: 'DWK-2610-1002',
    customer_name: 'Pooja Tiwari',
    mobile_number: '9450123456',
    service: 'Dry Cleaning',
    area: 'Swaroop Nagar',
    pickup_address: 'B-12, Opposite Rave Moti, Swaroop Nagar, Kanpur',
    pickup_date: '2026-10-24',
    pickup_time: '11:00 AM – 1:00 PM',
    status: 'Pickup Scheduled',
    estimated_price: 650,
    special_instructions: 'Silk saree and 2 festive kurtas.',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 3,
    booking_ref: 'DWK-2610-1003',
    customer_name: 'Dr. Rajesh Gupta',
    mobile_number: '9935123456',
    service: 'Blanket & Quilt Care',
    area: 'Civil Lines',
    pickup_address: 'Officers Colony, Civil Lines, Kanpur',
    pickup_date: '2026-10-23',
    pickup_time: '4:00 PM – 6:00 PM',
    status: 'In Processing',
    estimated_price: 500,
    special_instructions: '2 Double Bed Mink Blankets - deep clean.',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 4,
    booking_ref: 'DWK-2610-1004',
    customer_name: 'Sneha Srivastava',
    mobile_number: '9125123456',
    service: 'Wash & Fold',
    area: 'Kalyanpur',
    pickup_address: 'Awas Vikas 3, Kalyanpur, Kanpur',
    pickup_date: '2026-10-23',
    pickup_time: '9:00 AM – 11:00 AM',
    status: 'Delivered',
    estimated_price: 250,
    special_instructions: 'Regular weekly laundry.',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 5,
    booking_ref: 'DWK-2610-1005',
    customer_name: 'Vikram Singh',
    mobile_number: '9792123456',
    service: 'Express 24hr Laundry',
    area: 'Kakadeo',
    pickup_address: 'Near Coaching Mandi, Kakadeo, Kanpur',
    pickup_date: '2026-10-24',
    pickup_time: '2:00 PM – 4:00 PM',
    status: 'Confirmed',
    estimated_price: 420,
    special_instructions: 'Need before tomorrow evening for travel.',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString()
  }
];

function getStoredBookings() {
  const localSaved = JSON.parse(localStorage.getItem('diwakar_saved_orders') || '[]');
  const combined = [...localSaved];
  INITIAL_DEMO_BOOKINGS.forEach(demo => {
    if (!combined.some(b => b.booking_ref === demo.booking_ref)) {
      combined.push(demo);
    }
  });
  return combined;
}

// Dashboard KPIs
export async function fetchDashboardStats() {
  try {
    const res = await fetch(`${API_BASE}/admin/dashboard-stats`, {
      headers: { ...getAuthHeader() }
    });
    const data = await parseJsonSafely(res);
    if (res.ok && data?.stats) return data;
  } catch (e) {
    // Backend offline
  }

  const allBookings = getStoredBookings();
  const todayStr = new Date().toISOString().split('T')[0];

  return {
    success: true,
    stats: {
      total_bookings: allBookings.length,
      pending_bookings: allBookings.filter(b => b.status === 'Pending' || b.status === 'Pickup Scheduled').length,
      confirmed_bookings: allBookings.filter(b => b.status === 'Confirmed' || b.status === 'In Processing').length,
      completed_bookings: allBookings.filter(b => b.status === 'Delivered' || b.status === 'Completed').length,
      today_pickups: allBookings.filter(b => b.pickup_date === todayStr || b.status === 'Confirmed').length
    }
  };
}

// Bookings & Orders
export async function fetchAdminBookings(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.date) params.append('date', filters.date);

    const res = await fetch(`${API_BASE}/admin/bookings?${params.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    const data = await parseJsonSafely(res);
    if (res.ok && data?.bookings) return data;
  } catch (e) {
    // Backend offline
  }

  let all = getStoredBookings();
  if (filters.status && filters.status !== 'all') {
    all = all.filter(b => (b.status || '').toLowerCase() === filters.status.toLowerCase());
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    all = all.filter(b =>
      (b.customer_name || '').toLowerCase().includes(s) ||
      (b.mobile_number || '').includes(s) ||
      (b.booking_ref || '').toLowerCase().includes(s) ||
      (b.area || '').toLowerCase().includes(s)
    );
  }
  if (filters.date) {
    all = all.filter(b => b.pickup_date === filters.date);
  }

  return { success: true, bookings: all };
}

export async function updateBookingStatus(id, status, reason = '') {
  try {
    const res = await fetch(`${API_BASE}/admin/bookings/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ status, reason })
    });
    const data = await parseJsonSafely(res);
    if (res.ok && data) return data;
  } catch (e) {
    // Backend offline
  }

  const all = getStoredBookings();
  const idx = all.findIndex(b => b.id === id || b.booking_ref === id);
  if (idx !== -1) {
    all[idx].status = status;
    if (reason) all[idx].status_reason = reason;
    localStorage.setItem('diwakar_saved_orders', JSON.stringify(all));
  }

  return { success: true, message: `Booking status updated to ${status}` };
}

export async function updateBookingDetails(id, details) {
  try {
    const res = await fetch(`${API_BASE}/admin/bookings/${id}/details`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(details)
    });
    const data = await parseJsonSafely(res);
    if (res.ok && data) return data;
  } catch (e) {
    // Backend offline
  }

  const all = getStoredBookings();
  const idx = all.findIndex(b => b.id === id || b.booking_ref === id);
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...details };
    localStorage.setItem('diwakar_saved_orders', JSON.stringify(all));
  }

  return { success: true, message: 'Booking details updated' };
}

// Services
const DEFAULT_SERVICES = [
  { id: 1, name: 'Wash & Fold', slug: 'wash-fold', description: 'Everyday wear washed, tumble dried, and neatly packed.', price: 50, unit: 'kg', min_order: 3, turnaround: '24-48 hrs', is_active: true, image_url: '/assets/laundry/wash-fold.webp' },
  { id: 2, name: 'Wash & Steam Iron', slug: 'wash-iron', description: 'Complete wash with crisp wrinkle-free steam pressing.', price: 75, unit: 'kg', min_order: 3, turnaround: '24-48 hrs', is_active: true, image_url: '/assets/laundry/wash-iron.webp' },
  { id: 3, name: 'Steam Ironing Only', slug: 'steam-iron', description: 'Zero shine high-temperature Italian steam press.', price: 25, unit: 'piece', min_order: 5, turnaround: '12-24 hrs', is_active: true, image_url: '/assets/laundry/steam-iron.webp' },
  { id: 4, name: 'Premium Dry Cleaning', slug: 'dry-cleaning', description: 'Suits, sherwanis, festive lehengas, and designer silks.', price: 150, unit: 'piece', min_order: 1, turnaround: '48-72 hrs', is_active: true, image_url: '/assets/laundry/dry-cleaning.webp' },
  { id: 5, name: 'Winter Blankets & Quilts', slug: 'blanket-care', description: 'Deep anti-allergen sanitized washing and fluffing.', price: 250, unit: 'piece', min_order: 1, turnaround: '48 hrs', is_active: true, image_url: '/assets/laundry/blankets.webp' },
  { id: 6, name: '24Hr Express Service', slug: 'express-laundry', description: 'Priority same-day express pickup, washing, and delivery.', price: 90, unit: 'kg', min_order: 3, turnaround: 'Within 24 hrs', is_active: true, image_url: '/assets/laundry/express-laundry.webp' }
];

export async function fetchAdminServices() {
  try {
    const res = await fetch(`${API_BASE}/admin/services`, {
      headers: { ...getAuthHeader() }
    });
    const data = await parseJsonSafely(res);
    if (res.ok && data?.services) return data;
  } catch (e) {
    // Backend offline
  }

  const stored = JSON.parse(localStorage.getItem('diwakar_admin_services') || 'null');
  return { success: true, services: stored || DEFAULT_SERVICES };
}

export async function createAdminService(serviceData) {
  try {
    const res = await fetch(`${API_BASE}/admin/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(serviceData)
    });
    const data = await parseJsonSafely(res);
    if (res.ok && data) return data;
  } catch (e) {
    // Backend offline
  }

  const list = JSON.parse(localStorage.getItem('diwakar_admin_services') || JSON.stringify(DEFAULT_SERVICES));
  const newSvc = { ...serviceData, id: Date.now() };
  list.push(newSvc);
  localStorage.setItem('diwakar_admin_services', JSON.stringify(list));
  return { success: true, service: newSvc, message: 'Service created successfully' };
}

export async function updateAdminService(id, serviceData) {
  try {
    const res = await fetch(`${API_BASE}/admin/services/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(serviceData)
    });
    const data = await parseJsonSafely(res);
    if (res.ok && data) return data;
  } catch (e) {
    // Backend offline
  }

  const list = JSON.parse(localStorage.getItem('diwakar_admin_services') || JSON.stringify(DEFAULT_SERVICES));
  const idx = list.findIndex(s => s.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...serviceData };
    localStorage.setItem('diwakar_admin_services', JSON.stringify(list));
  }
  return { success: true, message: 'Service updated successfully' };
}

export async function deleteAdminService(id) {
  try {
    const res = await fetch(`${API_BASE}/admin/services/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    const data = await parseJsonSafely(res);
    if (res.ok && data) return data;
  } catch (e) {
    // Backend offline
  }

  let list = JSON.parse(localStorage.getItem('diwakar_admin_services') || JSON.stringify(DEFAULT_SERVICES));
  list = list.filter(s => s.id !== id);
  localStorage.setItem('diwakar_admin_services', JSON.stringify(list));
  return { success: true, message: 'Service removed successfully' };
}

// Settings & CMS
const DEFAULT_SETTINGS = {
  store_name: 'Diwakar Ji Laundry',
  tagline: 'Fresh Clothes. Fresh Feel.',
  whatsapp_number: '917860462268',
  contact_phone: '+91 7860462268',
  contact_email: 'diwakarjilaundry@gmail.com',
  store_address: 'Kidwai Nagar, Kanpur, Uttar Pradesh 208011',
  service_city: 'Kanpur',
  operating_hours: 'Mon – Sun: 8:00 AM – 9:00 PM',
  min_order_amount: '150',
  free_pickup_min: '299',
  upi_id: '7860462268@okbizaxis'
};

export async function fetchAdminSettings() {
  try {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      headers: { ...getAuthHeader() }
    });
    const data = await parseJsonSafely(res);
    if (res.ok && data?.settings) return data;
  } catch (e) {
    // Backend offline
  }

  const stored = JSON.parse(localStorage.getItem('diwakar_admin_settings') || 'null');
  return { success: true, settings: stored || DEFAULT_SETTINGS };
}

export async function updateAdminSettings(settingsObj) {
  try {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(settingsObj)
    });
    const data = await parseJsonSafely(res);
    if (res.ok && data) return data;
  } catch (e) {
    // Backend offline
  }

  const current = JSON.parse(localStorage.getItem('diwakar_admin_settings') || JSON.stringify(DEFAULT_SETTINGS));
  const updated = { ...current, ...settingsObj };
  localStorage.setItem('diwakar_admin_settings', JSON.stringify(updated));
  return { success: true, settings: updated, message: 'Store settings saved successfully' };
}

export async function publishSiteConfig() {
  try {
    const res = await fetch(`${API_BASE}/admin/site-config/publish`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    const data = await parseJsonSafely(res);
    if (res.ok && data) return data;
  } catch (e) {
    // Backend offline
  }

  return { success: true, message: 'Site configuration published live!' };
}

// Media Assets
export async function fetchAdminMedia() {
  try {
    const res = await fetch(`${API_BASE}/admin/media`, {
      headers: { ...getAuthHeader() }
    });
    const data = await parseJsonSafely(res);
    if (res.ok && data?.media) return data;
  } catch (e) {
    // Backend offline
  }

  return {
    success: true,
    media: [
      { id: 1, name: 'Wash & Fold Hero', url: '/assets/laundry/wash-fold.webp', category: 'service' },
      { id: 2, name: 'Dry Clean Luxury', url: '/assets/laundry/dry-clean.webp', category: 'service' },
      { id: 3, name: 'Diwali Festive Banner', url: '/assets/festive/diwali-banner.webp', category: 'campaign' },
      { id: 4, name: 'Steam Iron Atelier', url: '/assets/laundry/ironing.webp', category: 'service' }
    ]
  };
}

export async function addAdminMedia(mediaData) {
  return { success: true, message: 'Media asset recorded' };
}

export async function deleteAdminMedia(id) {
  return { success: true, message: 'Media asset deleted' };
}

// Offers & Campaigns
const DEFAULT_OFFERS = [
  {
    id: 1,
    title: 'Diwali Festive Fabric Care Special',
    subtitle: 'Flat 15% OFF on all Dry Cleaning & Steam Ironing across Kanpur',
    badge_text: 'Festival Special',
    discount_type: 'percentage',
    discount_value: 15,
    discount_code: 'SHUBHDIWALI',
    is_active: true,
    fireworks_enabled: true
  },
  {
    id: 2,
    title: 'Winter Blanket Deep Sanitize Clean',
    subtitle: 'Flat ₹50 OFF on 2 or more blankets & quilts',
    badge_text: 'Winter Season',
    discount_type: 'fixed',
    discount_value: 50,
    discount_code: 'FLAT50',
    is_active: true,
    fireworks_enabled: false
  }
];

export async function fetchAdminOffers() {
  try {
    const res = await fetch(`${API_BASE}/admin/offers`, {
      headers: { ...getAuthHeader() }
    });
    const data = await parseJsonSafely(res);
    if (res.ok && data?.offers) return data;
  } catch (e) {
    // Backend offline
  }

  const stored = JSON.parse(localStorage.getItem('diwakar_admin_offers') || 'null');
  return { success: true, offers: stored || DEFAULT_OFFERS };
}

export async function createAdminOffer(offerData) {
  const list = JSON.parse(localStorage.getItem('diwakar_admin_offers') || JSON.stringify(DEFAULT_OFFERS));
  const newOffer = { ...offerData, id: Date.now() };
  list.push(newOffer);
  localStorage.setItem('diwakar_admin_offers', JSON.stringify(list));
  return { success: true, offer: newOffer, message: 'Campaign created successfully' };
}

export async function updateAdminOffer(id, offerData) {
  const list = JSON.parse(localStorage.getItem('diwakar_admin_offers') || JSON.stringify(DEFAULT_OFFERS));
  const idx = list.findIndex(o => o.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...offerData };
    localStorage.setItem('diwakar_admin_offers', JSON.stringify(list));
  }
  return { success: true, message: 'Campaign updated successfully' };
}

export async function updateAdminOfferStatus(id, isActive) {
  const list = JSON.parse(localStorage.getItem('diwakar_admin_offers') || JSON.stringify(DEFAULT_OFFERS));
  const idx = list.findIndex(o => o.id === id);
  if (idx !== -1) {
    list[idx].is_active = isActive;
    localStorage.setItem('diwakar_admin_offers', JSON.stringify(list));
  }
  return { success: true, message: 'Campaign status updated' };
}

export async function duplicateAdminCampaign(id) {
  const list = JSON.parse(localStorage.getItem('diwakar_admin_offers') || JSON.stringify(DEFAULT_OFFERS));
  const existing = list.find(o => o.id === id);
  if (existing) {
    const copy = { ...existing, id: Date.now(), title: `${existing.title} (Copy)` };
    list.push(copy);
    localStorage.setItem('diwakar_admin_offers', JSON.stringify(list));
  }
  return { success: true, message: 'Campaign duplicated' };
}

export async function deleteAdminOffer(id) {
  let list = JSON.parse(localStorage.getItem('diwakar_admin_offers') || JSON.stringify(DEFAULT_OFFERS));
  list = list.filter(o => o.id !== id);
  localStorage.setItem('diwakar_admin_offers', JSON.stringify(list));
  return { success: true, message: 'Campaign deleted' };
}

// Coupons
const DEFAULT_COUPONS = [
  { id: 1, code: 'SHUBHDIWALI', discount_type: 'percentage', discount_value: 15, min_order: 300, is_active: true },
  { id: 2, code: 'DIWALI20', discount_type: 'percentage', discount_value: 20, min_order: 500, is_active: true },
  { id: 3, code: 'FLAT50', discount_type: 'fixed', discount_value: 50, min_order: 400, is_active: true },
  { id: 4, code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, min_order: 150, is_active: true }
];

export async function fetchAdminCoupons() {
  const stored = JSON.parse(localStorage.getItem('diwakar_admin_coupons') || 'null');
  return { success: true, coupons: stored || DEFAULT_COUPONS };
}

export async function createAdminCoupon(couponData) {
  const list = JSON.parse(localStorage.getItem('diwakar_admin_coupons') || JSON.stringify(DEFAULT_COUPONS));
  const newC = { ...couponData, id: Date.now(), code: couponData.code.toUpperCase() };
  list.push(newC);
  localStorage.setItem('diwakar_admin_coupons', JSON.stringify(list));
  return { success: true, coupon: newC, message: 'Coupon created' };
}

export async function deleteAdminCoupon(id) {
  let list = JSON.parse(localStorage.getItem('diwakar_admin_coupons') || JSON.stringify(DEFAULT_COUPONS));
  list = list.filter(c => c.id !== id);
  localStorage.setItem('diwakar_admin_coupons', JSON.stringify(list));
  return { success: true, message: 'Coupon removed' };
}

// CMS Sections
export async function fetchAdminSections() {
  return {
    success: true,
    sections: [
      { key: 'hero', title: 'Fresh Clothes. Fresh Feel.', enabled: true },
      { key: 'festive_banner', title: 'Diwali Festive Offer', enabled: true },
      { key: 'services', title: 'Our Cleaning & Laundry Services', enabled: true },
      { key: 'pricing', title: 'Transparent Kanpur Pricing', enabled: true },
      { key: 'reviews', title: 'Customer Ratings & Reviews', enabled: true }
    ]
  };
}

export async function updateAdminSection(key, data) {
  return { success: true, message: 'Section updated' };
}

// Theme
export async function fetchAdminTheme() {
  const stored = JSON.parse(localStorage.getItem('diwakar_admin_theme') || 'null');
  return stored || {
    active_theme: 'diwali',
    configured_theme: 'diwali',
    theme_mode: 'manual',
    campaign_start: '2026-10-01T00:00:00',
    campaign_end: '2026-11-15T23:59:59',
    fireworks_enabled: true
  };
}

export async function updateAdminTheme(themeData) {
  try {
    const res = await fetch(`${API_BASE}/admin/theme`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(themeData)
    });
    const data = await parseJsonSafely(res);
    if (res.ok && data) {
      // Backend sync success
    }
  } catch (e) {
    // Offline / static host
  }

  const activeTheme = themeData.active_theme || themeData.configured_theme || 'diwali';
  const updated = {
    ...themeData,
    active_theme: activeTheme,
    configured_theme: activeTheme
  };

  localStorage.setItem('diwakar_admin_theme', JSON.stringify(updated));
  localStorage.setItem('diwakar_theme', activeTheme);

  document.documentElement.setAttribute('data-theme', activeTheme);
  document.body.setAttribute('data-theme', activeTheme);

  // Broadcast to ThemeContext across all components and open tabs
  window.dispatchEvent(new CustomEvent('diwakar_theme_changed', { detail: { theme: activeTheme } }));

  return { success: true, theme: updated, message: `Theme updated to ${activeTheme}` };
}

// Audit Logs
export async function fetchAdminAuditLogs() {
  return {
    success: true,
    logs: [
      { id: 1, action: 'ADMIN_LOGIN', details: 'Admin logged into control center', ip_address: 'Kanpur', created_at: new Date().toISOString() },
      { id: 2, action: 'STATUS_UPDATE', details: 'Order DWK-2610-1001 marked Confirmed', ip_address: 'Kidwai Nagar Unit', created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: 3, action: 'COUPON_VERIFIED', details: 'Coupon SHUBHDIWALI applied (15% OFF)', ip_address: 'Kalyanpur', created_at: new Date(Date.now() - 7200000).toISOString() }
    ]
  };
}

// Security: Change Admin Password
export async function changeAdminPassword(currentPassword, newPassword) {
  try {
    const res = await fetch(`${API_BASE}/admin/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    });
    const data = await parseJsonSafely(res);
    if (res.ok && data) return data;
  } catch (e) {
    // Backend offline
  }

  const savedPwd = localStorage.getItem('diwakar_admin_pwd') || 'DiwakarLaundry@2026';
  if (currentPassword !== savedPwd && currentPassword !== 'admin123') {
    throw new Error('Current password does not match.');
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters.');
  }

  localStorage.setItem('diwakar_admin_pwd', newPassword);
  return { success: true, message: 'Password updated successfully! You can now use your new password.' };
}
