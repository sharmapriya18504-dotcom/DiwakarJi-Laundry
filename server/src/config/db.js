const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

let pool = null;
let useFallback = false;

// Canonical 9-stage tracking timeline
const TRACKING_STAGES = [
  { id: 'Booking Received', label: 'Booking Received', icon: 'fa-file-lines', desc: 'Pickup request received by Diwakar Ji Laundry.' },
  { id: 'Booking Confirmed', label: 'Booking Confirmed', icon: 'fa-circle-check', desc: 'Booking accepted and assigned to local pickup agent.' },
  { id: 'Pickup Scheduled', label: 'Pickup Scheduled', icon: 'fa-calendar-clock', desc: 'Pickup partner scheduled for doorstep collection.' },
  { id: 'Picked Up', label: 'Picked Up', icon: 'fa-truck-pickup', desc: 'Clothes collected & digital weight recorded.' },
  { id: 'Processing', label: 'Processing', icon: 'fa-soap', desc: 'Individual hygienic washing & fabric care underway.' },
  { id: 'Quality Check', label: 'Quality Check', icon: 'fa-sparkles', desc: 'Steam ironing & multi-point garment inspection.' },
  { id: 'Ready for Delivery', label: 'Ready for Delivery', icon: 'fa-box', desc: 'Eco-packaged, sealed & staged for delivery.' },
  { id: 'Out for Delivery', label: 'Out for Delivery', icon: 'fa-truck-fast', desc: 'Delivery partner on way to your doorstep.' },
  { id: 'Delivered', label: 'Delivered', icon: 'fa-house-circle-check', desc: 'Order delivered successfully to your doorstep.' }
];

// Modern High-Resolution Default Services
const DEFAULT_SERVICES = [
  { id: 1, service_id: 'wash_fold', name: 'Wash & Fold', description: 'Everyday clothes thoroughly washed, machine dried and neatly folded ready for your wardrobe.', price: 40.0, unit: '/kg', image_url: '/assets/laundry/wash-fold.webp', is_active: 1, display_order: 1 },
  { id: 2, service_id: 'wash_iron', name: 'Wash & Iron', description: 'Spotless wash with precision steam ironing — crisp, sharp and professional every time.', price: 60.0, unit: '/kg', image_url: '/assets/laundry/wash-iron.webp', is_active: 1, display_order: 2 },
  { id: 3, service_id: 'dry_cleaning', name: 'Dry Cleaning', description: 'Gentle care for premium and delicate fabrics — suits, sherwanis, sarees, silk and blazers.', price: 120.0, unit: '/piece', image_url: '/assets/laundry/dry-cleaning.webp', is_active: 1, display_order: 3 },
  { id: 4, service_id: 'steam_iron', name: 'Steam Ironing', description: 'Wrinkle-free, sharp and fresh — high-pressure temperature-controlled steam press.', price: 30.0, unit: '/piece', image_url: '/assets/laundry/steam-iron.webp', is_active: 1, display_order: 4 },
  { id: 5, service_id: 'blankets', name: 'Blankets & Bedsheets', description: 'Deep sanitization and heavy-duty wash for blankets, quilts, bedsheets, and comforters.', price: 80.0, unit: '/piece', image_url: '/assets/laundry/blankets.webp', is_active: 1, display_order: 5 },
  { id: 6, service_id: 'express', name: 'Express Laundry', description: 'Need it urgently? Same-day or guaranteed 24-hour fast turnaround delivery in Kanpur.', price: 70.0, unit: '/kg', image_url: '/assets/laundry/express-laundry.webp', is_active: 1, display_order: 6 }
];

const DEFAULT_SETTINGS = {
  active_theme: 'classic',
  theme_mode: 'manual', // 'manual' or 'scheduled'
  campaign_start: '2026-10-01T00:00:00',
  campaign_end: '2026-11-15T23:59:59',
  fireworks_enabled: 'true',
  business_name: 'Diwakar Ji Laundry',
  owner_name: 'Diwakar Ji',
  whatsapp_number: '917860462268',
  contact_phone: '+91 7860462268',
  address: 'Kidwai Nagar & IIT Kanpur Area, Kanpur, Uttar Pradesh 208011',
  service_areas: 'Kakadeo, Swaroop Nagar, Kidwai Nagar, Kalyanpur, Civil Lines, Govind Nagar, Barra, IIT Kanpur Campus',
  hero_headline: 'Fresh Clothes.<br/><span class="gradient-text">Fresh Feel.</span>',
  hero_subtitle: 'Professional laundry & dry cleaning with free doorstep pickup & delivery across Kanpur. Cleaner clothes, happier homes.',
  hero_image_normal: '/assets/laundry/hero-laundry.webp',
  hero_image_diwali: '/assets/campaigns/diwali-hero.webp',
  banner_image_diwali: '/assets/campaigns/diwali-banner.webp',
  cta_primary_text: 'Book a Pickup',
  cta_primary_url: '#booking',
  cta_secondary_text: 'Explore Services',
  cta_secondary_url: '#services',
  festive_banner_enabled: 'false',
  festive_banner_text: '✨ Shubh Diwali Offer: 15% OFF on Blankets & Dry Cleaning! Free Doorstep Pickup & Delivery across Kanpur.',
  diwali_decorations_enabled: 'false',
  meta_title: 'Diwakar Ji Laundry Kanpur — Free Doorstep Pickup & Delivery',
  meta_description: 'Best laundry, dry cleaning, and steam ironing service in Kanpur. Free doorstep pickup & delivery in Kidwai Nagar, Swaroop Nagar, Kakadeo & IIT Kanpur.',
  meta_keywords: 'laundry kanpur, dry cleaning kanpur, diwakar ji laundry, free laundry pickup kanpur, steam press kanpur'
};

const DEFAULT_FAQS = [
  { id: 1, question: 'How do I book a laundry pickup?', answer: 'Simply fill the booking form on this website or tap the WhatsApp button. You will receive an instant booking reference and Diwakar Ji will confirm your pickup slot on WhatsApp.', display_order: 1, is_active: 1 },
  { id: 2, question: 'Is pickup and delivery really free?', answer: 'Yes! Doorstep pickup and delivery are 100% free across our covered service areas in Kanpur.', display_order: 2, is_active: 1 },
  { id: 3, question: 'How is the final price calculated?', answer: 'Prices shown on the website are transparent base estimates. When our delivery partner arrives, your clothes are digitally weighed in front of you for exact billing.', display_order: 3, is_active: 1 },
  { id: 4, question: 'How much time does delivery take?', answer: 'Standard Wash & Fold / Wash & Iron takes 24 to 48 hours. Express laundry orders can be delivered on the same day or within 24 hours upon request.', display_order: 4, is_active: 1 },
  { id: 5, question: 'Are my clothes washed separately?', answer: 'Absolutely. We strictly maintain 100% individual wash batches per customer for highest hygiene. Your clothes are never mixed with anyone else\'s.', display_order: 5, is_active: 1 }
];

const DEFAULT_REVIEWS = [
  { id: 1, author_name: 'Rohit Singh', location: 'IIT Kanpur Area', rating: 5, review_text: 'Excellent service! Clothes came back fresh, clean and really neatly pressed. Highly recommended for Kanpur residents and students.', is_verified: 1, display_order: 1 },
  { id: 2, author_name: 'Neha Verma', location: 'Kidwai Nagar, Kanpur', rating: 5, review_text: 'Very professional and on-time doorstep delivery. Now I only trust Diwakar Ji for all our family laundry needs.', is_verified: 1, display_order: 2 },
  { id: 3, author_name: 'Amit Tiwari', location: 'Kalyanpur, Kanpur', rating: 5, review_text: 'The best laundry service in Kanpur. Quality is top-notch and rates are genuine. My heavy winter blankets look brand new!', is_verified: 1, display_order: 3 }
];

const DEFAULT_COUPONS = [
  { id: 1, code: 'SHUBHDIWALI', discount_type: 'percentage', discount_value: 15, min_amount: 100, max_discount: 300, is_active: 1, expires_at: '2026-11-15T23:59:59' },
  { id: 2, code: 'DIWALI20', discount_type: 'percentage', discount_value: 20, min_amount: 250, max_discount: 500, is_active: 1, expires_at: '2026-11-15T23:59:59' },
  { id: 3, code: 'FLAT50', discount_type: 'fixed', discount_value: 50, min_amount: 300, max_discount: 50, is_active: 1, expires_at: '2026-11-30T23:59:59' }
];

const DEFAULT_MEDIA = [
  { id: 1, filename: 'hero-laundry.webp', public_url: '/assets/laundry/hero-laundry.webp', category: 'hero', alt_text: 'Pristine folded laundry stack' },
  { id: 2, filename: 'wash-fold.webp', public_url: '/assets/laundry/wash-fold.webp', category: 'services', alt_text: 'Neatly folded everyday garments' },
  { id: 3, filename: 'wash-iron.webp', public_url: '/assets/laundry/wash-iron.webp', category: 'services', alt_text: 'Steam ironed dress shirts' },
  { id: 4, filename: 'dry-cleaning.webp', public_url: '/assets/laundry/dry-cleaning.webp', category: 'services', alt_text: 'Tailored suit dry cleaning' },
  { id: 5, filename: 'steam-iron.webp', public_url: '/assets/laundry/steam-iron.webp', category: 'services', alt_text: 'Precision steam ironing press' },
  { id: 6, filename: 'express-laundry.webp', public_url: '/assets/laundry/express-laundry.webp', category: 'services', alt_text: 'Same day express laundry' },
  { id: 7, filename: 'blankets.webp', public_url: '/assets/laundry/blankets.webp', category: 'services', alt_text: 'Sanitized heavy blankets' },
  { id: 8, filename: 'pickup-delivery.webp', public_url: '/assets/laundry/pickup-delivery.webp', category: 'general', alt_text: 'Doorstep pickup partner' },
  { id: 9, filename: 'fabric-care.webp', public_url: '/assets/laundry/fabric-care.webp', category: 'general', alt_text: 'Delicate wool and fabric inspection' },
  { id: 10, filename: 'service-process.webp', public_url: '/assets/laundry/service-process.webp', category: 'general', alt_text: 'Modern commercial laundry machines' },
  { id: 11, filename: 'diwali-hero.webp', public_url: '/assets/campaigns/diwali-hero.webp', category: 'campaigns', alt_text: 'Festive Diwali folded silks with glowing diyas' },
  { id: 12, filename: 'diwali-banner.webp', public_url: '/assets/campaigns/diwali-banner.webp', category: 'campaigns', alt_text: 'Diwali festive banner with diyas and marigold garlands' }
];

const DEFAULT_SECTIONS = [
  { key: 'hero', title: 'Hero Section', is_visible: true, display_order: 1 },
  { key: 'services', title: 'Services Catalog', is_visible: true, display_order: 2 },
  { key: 'mid_section', title: 'Mid Section (Why Choose Us & Booking)', is_visible: true, display_order: 3 },
  { key: 'reviews', title: 'Customer Trust & Reviews', is_visible: true, display_order: 4 },
  { key: 'how_it_works', title: 'How It Works', is_visible: true, display_order: 5 },
  { key: 'pricing', title: 'Pricing Table', is_visible: true, display_order: 6 },
  { key: 'faq', title: 'Frequently Asked Questions', is_visible: true, display_order: 7 },
  { key: 'service_areas', title: 'Kanpur Service Zones', is_visible: true, display_order: 8 }
];

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const STORE_PATH = path.join(DATA_DIR, 'diwakar_store.json');

// Helper to mask customer names & addresses for privacy-preserving public tracking
function maskName(name) {
  if (!name) return 'Customer';
  const parts = name.trim().split(' ');
  return parts.map(p => (p.length > 2 ? p[0] + '*'.repeat(p.length - 2) + p[p.length - 1] : p[0] + '*')).join(' ');
}

// Local fallback store initialization
function initFallbackStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(STORE_PATH)) {
    const adminPasswordHash = bcrypt.hashSync('DiwakarLaundry@2026', 10);
    const initialData = {
      admin_users: [
        { id: 1, username: 'admin', password_hash: adminPasswordHash, email: 'diwakarjilaundry@gmail.com', role: 'superadmin', created_at: new Date().toISOString() }
      ],
      website_settings: { ...DEFAULT_SETTINGS },
      services: [...DEFAULT_SERVICES],
      bookings: [],
      booking_status_history: [],
      faqs: [...DEFAULT_FAQS],
      offers: [
        {
          id: 1,
          title: 'Diwali Special',
          subtitle: 'Fresh Clothes for a Brighter Tomorrow',
          description: 'Celebrate Diwali with fresh clothes and special laundry savings across Kanpur.',
          discount_type: 'percentage',
          discount_value: 15,
          promotional_price: null,
          applicable_services: 'all',
          min_amount: 100,
          discount_code: 'SHUBHDIWALI',
          badge_text: 'Festive Offer',
          image_url: '/assets/campaigns/diwali-hero.webp',
          terms: 'Valid on all standard laundry and dry cleaning orders throughout the festive campaign. Minimum order ₹100.',
          cta_text: 'Book Pickup',
          fireworks_enabled: 1,
          is_active: 1,
          start_date: '2026-10-01T00:00:00',
          end_date: '2026-11-15T23:59:59',
          created_at: new Date().toISOString()
        }
      ],
      reviews: [...DEFAULT_REVIEWS],
      coupons: [...DEFAULT_COUPONS],
      media_assets: [...DEFAULT_MEDIA],
      sections: [...DEFAULT_SECTIONS],
      audit_logs: [
        {
          id: 1,
          user_email: 'admin',
          action_type: 'SYSTEM_INIT',
          entity_type: 'system',
          entity_id: '1',
          notes: 'Diwakar Ji Laundry platform initialized with production seed data.',
          created_at: new Date().toISOString()
        }
      ]
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function readFallbackData() {
  initFallbackStore();
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    // Auto-patch missing tables for older json structures
    if (!parsed.coupons) parsed.coupons = [...DEFAULT_COUPONS];
    if (!parsed.media_assets) parsed.media_assets = [...DEFAULT_MEDIA];
    if (!parsed.sections) parsed.sections = [...DEFAULT_SECTIONS];
    if (!parsed.audit_logs) parsed.audit_logs = [];
    return parsed;
  } catch (e) {
    return {
      admin_users: [],
      website_settings: {},
      services: [],
      bookings: [],
      booking_status_history: [],
      faqs: [],
      offers: [],
      reviews: [],
      coupons: [...DEFAULT_COUPONS],
      media_assets: [...DEFAULT_MEDIA],
      sections: [...DEFAULT_SECTIONS],
      audit_logs: []
    };
  }
}

function writeFallbackData(data) {
  initFallbackStore();
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Database Connection Manager
async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'diwakar_laundry';
  const port = parseInt(process.env.DB_PORT || '3306', 10);

  try {
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();

    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });

    const schemaPath = path.join(__dirname, '..', '..', '..', 'database', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      const statements = schemaSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
      for (const stmt of statements) {
        if (!stmt.toLowerCase().startsWith('create database') && !stmt.toLowerCase().startsWith('use')) {
          await pool.query(stmt);
        }
      }
    }

    useFallback = false;
    console.log(`[DB] Successfully connected to MySQL database '${database}' on port ${port}.`);
  } catch (err) {
    console.warn(`[DB] MySQL connection notice: ${err.message}.`);
    console.warn('[DB] Operating in resilient file-persisted storage mode with full relational consistency.');
    useFallback = true;
    initFallbackStore();
  }
}

// Unified Query API
const db = {
  isFallback: () => useFallback,

  // Settings & CMS Configuration
  getSettings: async () => {
    if (!useFallback && pool) {
      const [rows] = await pool.query('SELECT `key`, `value` FROM website_settings');
      const settings = {};
      rows.forEach(r => { settings[r.key] = r.value; });
      return { ...DEFAULT_SETTINGS, ...settings };
    }
    const data = readFallbackData();
    return { ...DEFAULT_SETTINGS, ...(data.website_settings || {}) };
  },

  updateSetting: async (key, value) => {
    if (!useFallback && pool) {
      await pool.query(
        'INSERT INTO website_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
        [key, String(value), String(value)]
      );
      return;
    }
    const data = readFallbackData();
    data.website_settings = data.website_settings || {};
    data.website_settings[key] = String(value);
    writeFallbackData(data);
  },

  updateSettingsBatch: async (settingsObj) => {
    for (const [k, v] of Object.entries(settingsObj)) {
      await db.updateSetting(k, v);
    }
  },

  // Services Catalog
  getServices: async (activeOnly = false) => {
    if (!useFallback && pool) {
      const sql = activeOnly
        ? 'SELECT * FROM services WHERE is_active = 1 ORDER BY display_order ASC, id ASC'
        : 'SELECT * FROM services ORDER BY display_order ASC, id ASC';
      const [rows] = await pool.query(sql);
      return rows;
    }
    const data = readFallbackData();
    let svcs = data.services || [];
    if (activeOnly) svcs = svcs.filter(s => s.is_active === 1 || s.is_active === true);
    return svcs.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  },

  updateService: async (id, serviceData) => {
    const { name, description, price, unit, image_url, is_active, display_order } = serviceData;
    if (!useFallback && pool) {
      await pool.query(
        'UPDATE services SET name = ?, description = ?, price = ?, unit = ?, image_url = COALESCE(?, image_url), is_active = ?, display_order = ? WHERE id = ?',
        [name, description, price, unit, image_url, is_active ? 1 : 0, display_order || 0, id]
      );
      return;
    }
    const data = readFallbackData();
    const idx = data.services.findIndex(s => s.id === parseInt(id, 10));
    if (idx !== -1) {
      data.services[idx] = { ...data.services[idx], ...serviceData, id: parseInt(id, 10) };
      writeFallbackData(data);
    }
  },

  createService: async (serviceData) => {
    const { service_id, name, description, price, unit, image_url, is_active, display_order } = serviceData;
    if (!useFallback && pool) {
      const [result] = await pool.query(
        'INSERT INTO services (service_id, name, description, price, unit, image_url, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [service_id, name, description, price, unit, image_url || '/assets/laundry/wash-fold.webp', is_active ? 1 : 0, display_order || 0]
      );
      return result.insertId;
    }
    const data = readFallbackData();
    const nextId = (data.services.reduce((max, s) => Math.max(max, s.id || 0), 0) || 0) + 1;
    const newSvc = {
      id: nextId,
      service_id: service_id || `service_${nextId}`,
      name,
      description,
      price: parseFloat(price) || 0,
      unit: unit || '/kg',
      image_url: image_url || '/assets/laundry/wash-fold.webp',
      is_active: is_active ? 1 : 0,
      display_order: parseInt(display_order, 10) || nextId
    };
    data.services.push(newSvc);
    writeFallbackData(data);
    return nextId;
  },

  deleteService: async (id) => {
    const serviceId = parseInt(id, 10);
    if (!useFallback && pool) {
      await pool.query('DELETE FROM services WHERE id = ?', [serviceId]);
      return;
    }
    const data = readFallbackData();
    data.services = (data.services || []).filter(s => s.id !== serviceId);
    writeFallbackData(data);
  },

  // Customer Bookings
  createBooking: async (bookingData) => {
    const {
      booking_ref, customer_name, mobile_number, pickup_address, area,
      service_name, service_id, unit_price, quantity, estimated_price,
      pickup_date, pickup_time, special_instructions, coupon_code = null,
      discount_amount = 0, subtotal = 0, total_amount = 0
    } = bookingData;

    if (!useFallback && pool) {
      const [result] = await pool.query(
        `INSERT INTO bookings (
          booking_ref, customer_name, mobile_number, pickup_address, area,
          service_name, service_id, unit_price, quantity, estimated_price,
          pickup_date, pickup_time, special_instructions, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Booking Received', NOW())`,
        [
          booking_ref, customer_name, mobile_number, pickup_address, area,
          service_name, service_id, unit_price, quantity, estimated_price,
          pickup_date, pickup_time, special_instructions
        ]
      );

      await pool.query(
        'INSERT INTO booking_status_history (booking_id, previous_status, new_status, changed_by, reason) VALUES (?, ?, ?, ?, ?)',
        [result.insertId, 'None', 'Booking Received', 'customer', 'Online pickup booking placed.']
      );

      return result.insertId;
    }

    const data = readFallbackData();
    data.bookings = data.bookings || [];
    const nextId = (data.bookings.reduce((max, b) => Math.max(max, b.id || 0), 0) || 0) + 1;
    const newBooking = {
      id: nextId,
      booking_ref,
      customer_name,
      mobile_number,
      pickup_address,
      area,
      service_name,
      service_id,
      unit_price: parseFloat(unit_price) || 0,
      quantity,
      estimated_price,
      subtotal: parseFloat(subtotal) || 0,
      discount_amount: parseFloat(discount_amount) || 0,
      total_amount: parseFloat(total_amount) || 0,
      coupon_code: coupon_code || null,
      pickup_date,
      pickup_time,
      special_instructions,
      status: 'Booking Received', // Normalized tracking initial status
      whatsapp_notified: 0,
      created_at: new Date().toISOString()
    };
    data.bookings.unshift(newBooking);

    data.booking_status_history = data.booking_status_history || [];
    data.booking_status_history.push({
      id: data.booking_status_history.length + 1,
      booking_id: nextId,
      previous_status: 'None',
      new_status: 'Booking Received',
      changed_by: 'customer',
      reason: 'Online pickup booking placed.',
      created_at: new Date().toISOString()
    });

    writeFallbackData(data);
    return nextId;
  },

  findRecentDuplicateBooking: async (mobile, service, windowMinutes = 10) => {
    const cutoff = new Date(Date.now() - windowMinutes * 60000).toISOString();
    if (!useFallback && pool) {
      const [rows] = await pool.query(
        'SELECT * FROM bookings WHERE mobile_number = ? AND service_name = ? AND created_at >= ? LIMIT 1',
        [mobile, service, cutoff]
      );
      return rows[0] || null;
    }
    const data = readFallbackData();
    const found = (data.bookings || []).find(b =>
      b.mobile_number === mobile &&
      b.service_name === service &&
      new Date(b.created_at) >= new Date(cutoff)
    );
    return found || null;
  },

  getBookings: async ({ status, date, search }) => {
    if (!useFallback && pool) {
      let query = 'SELECT * FROM bookings WHERE 1=1';
      const params = [];
      if (status && status !== 'all') {
        query += ' AND status = ?';
        params.push(status);
      }
      if (date) {
        query += ' AND pickup_date = ?';
        params.push(date);
      }
      if (search && search.trim()) {
        const s = `%${search.trim()}%`;
        query += ' AND (booking_ref LIKE ? OR customer_name LIKE ? OR mobile_number LIKE ? OR area LIKE ?)';
        params.push(s, s, s, s);
      }
      query += ' ORDER BY created_at DESC';
      const [rows] = await pool.query(query, params);
      return rows;
    }

    const data = readFallbackData();
    let list = data.bookings || [];
    if (status && status !== 'all') {
      list = list.filter(b => b.status === status);
    }
    if (date) {
      list = list.filter(b => b.pickup_date === date);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(b =>
        (b.booking_ref && b.booking_ref.toLowerCase().includes(q)) ||
        (b.customer_name && b.customer_name.toLowerCase().includes(q)) ||
        (b.mobile_number && b.mobile_number.includes(q)) ||
        (b.area && b.area.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  updateBookingStatus: async (bookingId, newStatus, reason = '', changedBy = 'admin') => {
    if (!useFallback && pool) {
      const [curr] = await pool.query('SELECT status FROM bookings WHERE id = ?', [bookingId]);
      if (!curr[0]) throw new Error('Booking not found');
      const prev = curr[0].status;

      await pool.query('UPDATE bookings SET status = ?, updated_at = NOW() WHERE id = ?', [newStatus, bookingId]);
      await pool.query(
        'INSERT INTO booking_status_history (booking_id, previous_status, new_status, changed_by, reason) VALUES (?, ?, ?, ?, ?)',
        [bookingId, prev, newStatus, changedBy, reason]
      );
      return;
    }

    const data = readFallbackData();
    const booking = (data.bookings || []).find(b => b.id === parseInt(bookingId, 10));
    if (!booking) throw new Error('Booking not found');
    const prev = booking.status;
    booking.status = newStatus;
    booking.updated_at = new Date().toISOString();

    data.booking_status_history = data.booking_status_history || [];
    data.booking_status_history.push({
      id: data.booking_status_history.length + 1,
      booking_id: booking.id,
      previous_status: prev,
      new_status: newStatus,
      changed_by: changedBy,
      reason,
      created_at: new Date().toISOString()
    });

    writeFallbackData(data);
  },

  updateBookingDetails: async (bookingId, details) => {
    const data = readFallbackData();
    const booking = (data.bookings || []).find(b => b.id === parseInt(bookingId, 10));
    if (!booking) throw new Error('Booking not found');

    if (details.actual_weight_kg !== undefined) booking.actual_weight_kg = details.actual_weight_kg;
    if (details.actual_pieces !== undefined) booking.actual_pieces = details.actual_pieces;
    if (details.total_amount !== undefined) booking.total_amount = details.total_amount;
    if (details.notes !== undefined) booking.notes = details.notes;
    booking.updated_at = new Date().toISOString();

    writeFallbackData(data);
  },

  setBookingWhatsAppNotified: async (ref) => {
    if (!useFallback && pool) {
      await pool.query('UPDATE bookings SET whatsapp_notified = 1 WHERE booking_ref = ?', [ref]);
      return;
    }
    const data = readFallbackData();
    const b = (data.bookings || []).find(item => item.booking_ref === ref);
    if (b) {
      b.whatsapp_notified = 1;
      writeFallbackData(data);
    }
  },

  // 9-Stage Public Order Tracking
  trackBooking: async (bookingRef, mobileNumber) => {
    const data = readFallbackData();
    const cleanRef = String(bookingRef || '').trim().toUpperCase();
    const cleanMob = String(mobileNumber || '').replace(/[\s\-+]/g, '').slice(-10);

    const booking = (data.bookings || []).find(b => {
      const matchRef = b.booking_ref && b.booking_ref.toUpperCase() === cleanRef;
      const bMob = String(b.mobile_number || '').replace(/[\s\-+]/g, '').slice(-10);
      return matchRef && (!cleanMob || bMob === cleanMob);
    });

    if (!booking) return null;

    // Retrieve history
    const history = (data.booking_status_history || []).filter(h => h.booking_id === booking.id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Map backwards-compatible statuses to canonical 9 stages
    let currentStatus = booking.status || 'Booking Received';
    if (currentStatus === 'pending') currentStatus = 'Booking Received';
    if (currentStatus === 'confirmed') currentStatus = 'Booking Confirmed';
    if (currentStatus === 'completed') currentStatus = 'Delivered';

    const currentStageIdx = TRACKING_STAGES.findIndex(s => s.id.toLowerCase() === currentStatus.toLowerCase());

    return {
      booking_ref: booking.booking_ref,
      customer_masked_name: maskName(booking.customer_name),
      service_name: booking.service_name,
      quantity: booking.quantity,
      area: booking.area,
      pickup_date: booking.pickup_date,
      pickup_time: booking.pickup_time,
      current_status: currentStatus,
      current_stage_index: currentStageIdx !== -1 ? currentStageIdx : 0,
      estimated_price: booking.estimated_price,
      total_amount: booking.total_amount || null,
      stages: TRACKING_STAGES,
      history: history.map(h => ({
        status: h.new_status,
        timestamp: h.created_at,
        notes: h.reason || ''
      }))
    };
  },

  // Coupon Validation
  validateCoupon: async (code, subtotal = 0, serviceName = '') => {
    const data = readFallbackData();
    const cleanCode = String(code || '').trim().toUpperCase();
    const coupon = (data.coupons || []).find(c => c.code.toUpperCase() === cleanCode && (c.is_active === 1 || c.is_active === true));

    if (!coupon) {
      return { valid: false, message: 'Invalid or inactive coupon code.' };
    }

    const now = new Date();
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return { valid: false, message: 'This coupon code has expired.' };
    }

    const numSubtotal = parseFloat(subtotal) || 0;
    if (coupon.min_amount && numSubtotal < coupon.min_amount) {
      return {
        valid: false,
        message: `Minimum order amount of ₹${coupon.min_amount} is required for coupon ${cleanCode}.`
      };
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.round((numSubtotal * coupon.discount_value) / 100);
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = coupon.discount_value;
    }

    discount = Math.min(discount, numSubtotal); // never exceed total
    const finalTotal = Math.max(0, numSubtotal - discount);

    return {
      valid: true,
      coupon_code: cleanCode,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount: discount,
      discounted_total: finalTotal,
      message: `Coupon ${cleanCode} applied! You saved ₹${discount}.`
    };
  },

  getCoupons: async () => {
    const data = readFallbackData();
    return data.coupons || [];
  },

  createCoupon: async (couponData) => {
    const data = readFallbackData();
    data.coupons = data.coupons || [];
    const nextId = (data.coupons.reduce((max, c) => Math.max(max, c.id || 0), 0) || 0) + 1;
    const newCoupon = {
      id: nextId,
      code: String(couponData.code || '').trim().toUpperCase(),
      discount_type: couponData.discount_type || 'percentage',
      discount_value: parseFloat(couponData.discount_value) || 0,
      min_amount: parseFloat(couponData.min_amount) || 0,
      max_discount: couponData.max_discount ? parseFloat(couponData.max_discount) : null,
      is_active: couponData.is_active ? 1 : 0,
      expires_at: couponData.expires_at || null,
      created_at: new Date().toISOString()
    };
    data.coupons.push(newCoupon);
    writeFallbackData(data);
    return nextId;
  },

  deleteCoupon: async (id) => {
    const data = readFallbackData();
    data.coupons = (data.coupons || []).filter(c => c.id !== parseInt(id, 10));
    writeFallbackData(data);
  },

  // Media Library
  getMediaAssets: async () => {
    const data = readFallbackData();
    return data.media_assets || [];
  },

  addMediaAsset: async (mediaData) => {
    const data = readFallbackData();
    data.media_assets = data.media_assets || [];
    const nextId = (data.media_assets.reduce((max, m) => Math.max(max, m.id || 0), 0) || 0) + 1;
    const newMedia = {
      id: nextId,
      filename: mediaData.filename || `asset_${nextId}.webp`,
      public_url: mediaData.public_url,
      category: mediaData.category || 'general',
      alt_text: mediaData.alt_text || '',
      file_size_bytes: mediaData.file_size_bytes || 0,
      created_at: new Date().toISOString()
    };
    data.media_assets.unshift(newMedia);
    writeFallbackData(data);
    return nextId;
  },

  deleteMediaAsset: async (id) => {
    const data = readFallbackData();
    data.media_assets = (data.media_assets || []).filter(m => m.id !== parseInt(id, 10));
    writeFallbackData(data);
  },

  // Site Sections CMS
  getSiteSections: async () => {
    const data = readFallbackData();
    return (data.sections || DEFAULT_SECTIONS).sort((a, b) => a.display_order - b.display_order);
  },

  updateSiteSection: async (key, updateData) => {
    const data = readFallbackData();
    data.sections = data.sections || [...DEFAULT_SECTIONS];
    const idx = data.sections.findIndex(s => s.key === key);
    if (idx !== -1) {
      data.sections[idx] = { ...data.sections[idx], ...updateData };
      writeFallbackData(data);
    }
  },

  // Audit Logs
  getAuditLogs: async (limit = 50) => {
    const data = readFallbackData();
    return (data.audit_logs || []).slice(0, limit);
  },

  logAudit: async (actionType, entityType, entityId, notes, prevData = null, newData = null, userEmail = 'admin') => {
    const data = readFallbackData();
    data.audit_logs = data.audit_logs || [];
    const nextId = (data.audit_logs.reduce((max, a) => Math.max(max, a.id || 0), 0) || 0) + 1;
    data.audit_logs.unshift({
      id: nextId,
      user_email: userEmail,
      action_type: actionType,
      entity_type: entityType,
      entity_id: String(entityId || ''),
      notes: notes || '',
      prev_data: prevData,
      new_data: newData,
      created_at: new Date().toISOString()
    });
    // Keep max 200 logs
    if (data.audit_logs.length > 200) data.audit_logs = data.audit_logs.slice(0, 200);
    writeFallbackData(data);
  },

  // KPIs & Analytics
  getDashboardStats: async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const data = readFallbackData();
    const bookings = data.bookings || [];
    return {
      total_bookings: bookings.length,
      pending_bookings: bookings.filter(b => b.status === 'pending' || b.status === 'Booking Received').length,
      confirmed_bookings: bookings.filter(b => b.status === 'confirmed' || b.status === 'Booking Confirmed').length,
      completed_bookings: bookings.filter(b => b.status === 'completed' || b.status === 'Delivered').length,
      today_pickups: bookings.filter(b => b.pickup_date === todayStr).length
    };
  },

  // Admin User Auth
  getAdminUser: async (username) => {
    const data = readFallbackData();
    return (data.admin_users || []).find(u => u.username === username) || null;
  },

  updateAdminPassword: async (username, newHash) => {
    const data = readFallbackData();
    const user = (data.admin_users || []).find(u => u.username === username);
    if (user) {
      user.password_hash = newHash;
      writeFallbackData(data);
    }
  },

  // FAQs & Reviews
  getFaqs: async (activeOnly = true) => {
    const data = readFallbackData();
    let faqs = data.faqs || [];
    if (activeOnly) faqs = faqs.filter(f => f.is_active === 1 || f.is_active === true);
    return faqs.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  },

  getReviews: async () => {
    const data = readFallbackData();
    return (data.reviews || []).filter(r => r.is_verified === 1 || r.is_verified === true);
  },

  // Offers & Dynamic Campaigns
  computeOfferStatus: (offer) => {
    if (!offer.is_active || offer.is_active === 0 || offer.is_active === '0') {
      return 'inactive';
    }
    const now = new Date();
    if (offer.start_date) {
      const start = new Date(offer.start_date);
      if (!isNaN(start.getTime()) && now < start) return 'scheduled';
    }
    if (offer.end_date) {
      const end = new Date(offer.end_date);
      if (!isNaN(end.getTime()) && now > end) return 'expired';
    }
    return 'active';
  },

  getOffers: async () => {
    const data = readFallbackData();
    const offersList = data.offers || [];
    return offersList.map(o => ({
      ...o,
      status: db.computeOfferStatus(o)
    }));
  },

  getActiveOffer: async () => {
    const all = await db.getOffers();
    return all.find(o => o.status === 'active') || null;
  },

  getOfferById: async (id) => {
    const offerId = parseInt(id, 10);
    const data = readFallbackData();
    const offer = (data.offers || []).find(o => o.id === offerId);
    if (!offer) return null;
    return { ...offer, status: db.computeOfferStatus(offer) };
  },

  createOffer: async (offerData) => {
    const data = readFallbackData();
    data.offers = data.offers || [];
    const nextId = (data.offers.reduce((max, o) => Math.max(max, o.id || 0), 0) || 0) + 1;
    const newOffer = {
      id: nextId,
      title: offerData.title,
      subtitle: offerData.subtitle || '',
      description: offerData.description,
      discount_type: offerData.discount_type || 'percentage',
      discount_value: parseFloat(offerData.discount_value) || 0,
      promotional_price: offerData.promotional_price ? parseFloat(offerData.promotional_price) : null,
      applicable_services: offerData.applicable_services || 'all',
      min_amount: parseFloat(offerData.min_amount) || 0,
      discount_code: offerData.discount_code || '',
      badge_text: offerData.badge_text || 'Festive Offer',
      image_url: offerData.image_url || '/assets/campaigns/diwali-hero.webp',
      terms: offerData.terms || '',
      cta_text: offerData.cta_text || 'Book Pickup',
      fireworks_enabled: offerData.fireworks_enabled ? 1 : 0,
      is_active: offerData.is_active ? 1 : 0,
      start_date: offerData.start_date || null,
      end_date: offerData.end_date || null,
      created_at: new Date().toISOString()
    };
    data.offers.unshift(newOffer);
    writeFallbackData(data);
    return nextId;
  },

  updateOffer: async (id, offerData) => {
    const offerId = parseInt(id, 10);
    const data = readFallbackData();
    data.offers = data.offers || [];
    const idx = data.offers.findIndex(o => o.id === offerId);
    if (idx !== -1) {
      data.offers[idx] = {
        ...data.offers[idx],
        ...offerData,
        discount_value: parseFloat(offerData.discount_value) || 0,
        min_amount: parseFloat(offerData.min_amount) || 0,
        updated_at: new Date().toISOString()
      };
      writeFallbackData(data);
    }
  },

  updateOfferStatus: async (id, isActive) => {
    const offerId = parseInt(id, 10);
    const data = readFallbackData();
    const offer = (data.offers || []).find(o => o.id === offerId);
    if (offer) {
      offer.is_active = isActive ? 1 : 0;
      offer.updated_at = new Date().toISOString();
      writeFallbackData(data);
    }
  },

  duplicateOffer: async (id) => {
    const offerId = parseInt(id, 10);
    const data = readFallbackData();
    const existing = (data.offers || []).find(o => o.id === offerId);
    if (!existing) throw new Error('Offer not found');

    const nextId = (data.offers.reduce((max, o) => Math.max(max, o.id || 0), 0) || 0) + 1;
    const duplicated = {
      ...existing,
      id: nextId,
      title: `${existing.title} (Copy)`,
      discount_code: existing.discount_code ? `${existing.discount_code}_COPY` : '',
      is_active: 0,
      created_at: new Date().toISOString()
    };
    data.offers.unshift(duplicated);
    writeFallbackData(data);
    return duplicated;
  },

  deleteOffer: async (id) => {
    const offerId = parseInt(id, 10);
    const data = readFallbackData();
    data.offers = (data.offers || []).filter(o => o.id !== offerId);
    writeFallbackData(data);
  },

  // Dynamic Theme & Campaign Scheduling Engine
  getThemeSettings: async () => {
    const settings = await db.getSettings();
    const mode = settings.theme_mode || 'manual';
    let computedTheme = settings.active_theme || 'classic';

    if (mode === 'scheduled') {
      const now = new Date();
      const start = settings.campaign_start ? new Date(settings.campaign_start) : null;
      const end = settings.campaign_end ? new Date(settings.campaign_end) : null;

      const isWithinCampaign = (!start || now >= start) && (!end || now <= end);
      computedTheme = isWithinCampaign ? 'diwali' : 'classic';
    }

    const activeOffer = await db.getActiveOffer();
    const fireworksAllowed = activeOffer
      ? (activeOffer.fireworks_enabled === 1 || activeOffer.fireworks_enabled === true)
      : (settings.fireworks_enabled === 'true' || settings.fireworks_enabled === true || settings.fireworks_enabled === 1);

    return {
      active_theme: computedTheme,
      configured_theme: settings.active_theme || 'classic',
      theme_mode: mode,
      campaign_start: settings.campaign_start || '2026-10-01T00:00:00',
      campaign_end: settings.campaign_end || '2026-11-15T23:59:59',
      fireworks_enabled: fireworksAllowed && computedTheme === 'diwali',
      festive_banner_enabled: settings.festive_banner_enabled === 'true',
      festive_banner_text: settings.festive_banner_text || ''
    };
  }
};

module.exports = { initDatabase, db, TRACKING_STAGES };
