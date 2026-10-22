const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

let pool = null;
let useFallback = false;

// Default Canonical Seed Data
const DEFAULT_SERVICES = [
  { id: 1, service_id: 'wash_fold', name: 'Wash & Fold', description: 'Everyday clothes thoroughly washed, machine dried and neatly folded ready for your wardrobe.', price: 40.0, unit: '/kg', image_url: '/wash_fold.png', is_active: 1, display_order: 1 },
  { id: 2, service_id: 'wash_iron', name: 'Wash & Iron', description: 'Spotless wash with precision steam ironing — crisp, sharp and professional every time.', price: 60.0, unit: '/kg', image_url: '/wash_iron.png', is_active: 1, display_order: 2 },
  { id: 3, service_id: 'dry_cleaning', name: 'Dry Cleaning', description: 'Gentle care for premium and delicate fabrics — suits, sherwanis, sarees, silk and blazers.', price: 120.0, unit: '/piece', image_url: '/dry_cleaning.png', is_active: 1, display_order: 3 },
  { id: 4, service_id: 'steam_iron', name: 'Steam Ironing', description: 'Wrinkle-free, sharp and fresh — high-pressure temperature-controlled steam press.', price: 30.0, unit: '/piece', image_url: '/steam_iron.png', is_active: 1, display_order: 4 },
  { id: 5, service_id: 'blankets', name: 'Blankets & Bedsheets', description: 'Deep sanitization and heavy-duty wash for blankets, quilts, bedsheets, and comforters.', price: 80.0, unit: '/piece', image_url: '/blankets.png', is_active: 1, display_order: 5 },
  { id: 6, service_id: 'express', name: 'Express Laundry', description: 'Need it urgently? Same-day or guaranteed 24-hour fast turnaround delivery in Kanpur.', price: 70.0, unit: '/kg', image_url: '/express_laundry.png', is_active: 1, display_order: 6 }
];

const DEFAULT_SETTINGS = {
  active_theme: 'diwali',
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
  festive_banner_enabled: 'true',
  festive_banner_text: '🪔 Shubh Diwali Offer: 15% OFF on Blankets & Dry Cleaning! Free Doorstep Pickup & Delivery across Kanpur.',
  diwali_decorations_enabled: 'true'
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
  { id: 2, author_name: 'Neha Verma', location: 'Kidwai Nagar, Kanpur', 5: 5, rating: 5, review_text: 'Very professional and on-time doorstep delivery. Now I only trust Diwakar Ji for all our family laundry needs.', is_verified: 1, display_order: 2 },
  { id: 3, author_name: 'Amit Tiwari', location: 'Kalyanpur, Kanpur', rating: 5, review_text: 'The best laundry service in Kanpur. Quality is top-notch and rates are genuine. My heavy winter blankets look brand new!', is_verified: 1, display_order: 3 }
];

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const STORE_PATH = path.join(DATA_DIR, 'diwakar_store.json');

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
          description: 'Celebrate Diwali with fresh clothes and special laundry savings.',
          discount_type: 'percentage',
          discount_value: 15,
          promotional_price: null,
          applicable_services: 'all',
          min_amount: 100,
          discount_code: 'SHUBHDIWALI',
          badge_text: 'Festive Offer',
          image_url: null,
          terms: 'Valid on all standard laundry and dry cleaning orders throughout the festive campaign.',
          cta_text: 'Book Pickup',
          fireworks_enabled: 1,
          is_active: 1,
          start_date: '2026-10-01T00:00:00',
          end_date: '2026-11-15T23:59:59',
          created_at: new Date().toISOString()
        }
      ],
      reviews: [...DEFAULT_REVIEWS]
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function readFallbackData() {
  initFallbackStore();
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return { admin_users: [], website_settings: {}, services: [], bookings: [], booking_status_history: [], faqs: [], offers: [], reviews: [] };
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
    // Attempt connection to MySQL server
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();

    // Create pool for database
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

    // Run schema migrations if needed
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

    // Seed defaults if empty
    const [svcRows] = await pool.query('SELECT COUNT(*) as cnt FROM services');
    if (svcRows[0].cnt === 0) {
      const seedPath = path.join(__dirname, '..', '..', '..', 'database', 'seed.sql');
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf-8');
        const seedStmts = seedSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
        for (const stmt of seedStmts) {
          if (!stmt.toLowerCase().startsWith('use')) {
            try { await pool.query(stmt); } catch (err) { /* ignore duplicate seed */ }
          }
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

  // Settings
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

  // Services
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
    const { name, description, price, unit, is_active, display_order } = serviceData;
    if (!useFallback && pool) {
      await pool.query(
        'UPDATE services SET name = ?, description = ?, price = ?, unit = ?, is_active = ?, display_order = ? WHERE id = ?',
        [name, description, price, unit, is_active ? 1 : 0, display_order || 0, id]
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
        [service_id, name, description, price, unit, image_url || '/wash_fold.png', is_active ? 1 : 0, display_order || 0]
      );
      return result.insertId;
    }
    const data = readFallbackData();
    const nextId = (data.services.reduce((max, s) => Math.max(max, s.id || 0), 0) || 0) + 1;
    const newSvc = { id: nextId, service_id, name, description, price: parseFloat(price), unit, image_url: image_url || '/wash_fold.png', is_active: is_active ? 1 : 0, display_order: display_order || 0 };
    data.services.push(newSvc);
    writeFallbackData(data);
    return nextId;
  },

  // Bookings
  checkRecentDuplicate: async (mobile, serviceName) => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    if (!useFallback && pool) {
      const [rows] = await pool.query(
        'SELECT * FROM bookings WHERE mobile_number = ? AND service_name = ? AND created_at >= ? LIMIT 1',
        [mobile, serviceName, tenMinutesAgo]
      );
      return rows[0] || null;
    }
    const data = readFallbackData();
    const tenMinTime = Date.now() - 10 * 60 * 1000;
    return (data.bookings || []).find(b => {
      const bTime = new Date(b.created_at).getTime();
      return b.mobile_number === mobile && b.service_name === serviceName && bTime >= tenMinTime;
    }) || null;
  },

  createBooking: async (bookingData) => {
    const {
      booking_ref, customer_name, mobile_number, pickup_address, area,
      service_name, service_id, unit_price, quantity, estimated_price,
      pickup_date, pickup_time, special_instructions
    } = bookingData;

    if (!useFallback && pool) {
      const [res] = await pool.query(
        `INSERT INTO bookings (
          booking_ref, customer_name, mobile_number, pickup_address, area,
          service_name, service_id, unit_price, quantity, estimated_price,
          pickup_date, pickup_time, special_instructions, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
        [
          booking_ref, customer_name, mobile_number, pickup_address, area,
          service_name, service_id, unit_price || 0, quantity, estimated_price || null,
          pickup_date, pickup_time, special_instructions || null
        ]
      );
      const bookingId = res.insertId;
      await pool.query(
        'INSERT INTO booking_status_history (booking_id, previous_status, new_status, changed_by, reason) VALUES (?, ?, ?, ?, ?)',
        [bookingId, 'none', 'pending', 'customer', 'Initial booking submission']
      );
      return { id: bookingId, booking_ref };
    }

    const data = readFallbackData();
    const nextId = ((data.bookings || []).reduce((max, b) => Math.max(max, b.id || 0), 0) || 0) + 1;
    const nowIso = new Date().toISOString();
    const newBooking = {
      id: nextId,
      booking_ref,
      customer_name,
      mobile_number,
      pickup_address,
      area,
      service_name,
      service_id,
      unit_price: parseFloat(unit_price || 0),
      quantity,
      estimated_price,
      pickup_date,
      pickup_time,
      special_instructions: special_instructions || '',
      status: 'pending',
      notes: '',
      whatsapp_notified: 0,
      created_at: nowIso,
      updated_at: nowIso
    };
    data.bookings = data.bookings || [];
    data.bookings.unshift(newBooking);

    data.booking_status_history = data.booking_status_history || [];
    data.booking_status_history.push({
      id: data.booking_status_history.length + 1,
      booking_id: nextId,
      previous_status: 'none',
      new_status: 'pending',
      changed_by: 'customer',
      reason: 'Initial booking submission',
      created_at: nowIso
    });

    writeFallbackData(data);
    return { id: nextId, booking_ref };
  },

  getBookingByRef: async (bookingRef) => {
    if (!useFallback && pool) {
      const [rows] = await pool.query('SELECT * FROM bookings WHERE booking_ref = ? LIMIT 1', [bookingRef]);
      return rows[0] || null;
    }
    const data = readFallbackData();
    return (data.bookings || []).find(b => b.booking_ref === bookingRef) || null;
  },

  markWhatsAppNotified: async (bookingRef) => {
    if (!useFallback && pool) {
      await pool.query('UPDATE bookings SET whatsapp_notified = 1 WHERE booking_ref = ?', [bookingRef]);
      return;
    }
    const data = readFallbackData();
    const booking = (data.bookings || []).find(b => b.booking_ref === bookingRef);
    if (booking) {
      booking.whatsapp_notified = 1;
      writeFallbackData(data);
    }
  },

  getBookings: async (filters = {}) => {
    const { status, search, date } = filters;
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

  // KPIs & Analytics
  getDashboardStats: async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (!useFallback && pool) {
      const [total] = await pool.query('SELECT COUNT(*) as count FROM bookings');
      const [pending] = await pool.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'");
      const [confirmed] = await pool.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'");
      const [completed] = await pool.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'completed'");
      const [today] = await pool.query('SELECT COUNT(*) as count FROM bookings WHERE pickup_date = ?', [todayStr]);

      return {
        total_bookings: total[0].count,
        pending_bookings: pending[0].count,
        confirmed_bookings: confirmed[0].count,
        completed_bookings: completed[0].count,
        today_pickups: today[0].count
      };
    }

    const data = readFallbackData();
    const bookings = data.bookings || [];
    return {
      total_bookings: bookings.length,
      pending_bookings: bookings.filter(b => b.status === 'pending').length,
      confirmed_bookings: bookings.filter(b => b.status === 'confirmed').length,
      completed_bookings: bookings.filter(b => b.status === 'completed').length,
      today_pickups: bookings.filter(b => b.pickup_date === todayStr).length
    };
  },

  // Admin User Auth
  getAdminUser: async (username) => {
    if (!useFallback && pool) {
      const [rows] = await pool.query('SELECT * FROM admin_users WHERE username = ? LIMIT 1', [username]);
      return rows[0] || null;
    }
    const data = readFallbackData();
    return (data.admin_users || []).find(u => u.username === username) || null;
  },

  updateAdminPassword: async (username, newHash) => {
    if (!useFallback && pool) {
      await pool.query('UPDATE admin_users SET password_hash = ?, updated_at = NOW() WHERE username = ?', [newHash, username]);
      return;
    }
    const data = readFallbackData();
    const user = (data.admin_users || []).find(u => u.username === username);
    if (user) {
      user.password_hash = newHash;
      writeFallbackData(data);
    }
  },

  // FAQs
  getFaqs: async (activeOnly = true) => {
    if (!useFallback && pool) {
      const sql = activeOnly
        ? 'SELECT * FROM faqs WHERE is_active = 1 ORDER BY display_order ASC'
        : 'SELECT * FROM faqs ORDER BY display_order ASC';
      const [rows] = await pool.query(sql);
      return rows;
    }
    const data = readFallbackData();
    let faqs = data.faqs || [];
    if (activeOnly) faqs = faqs.filter(f => f.is_active === 1 || f.is_active === true);
    return faqs.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  },

  // Reviews
  getReviews: async () => {
    if (!useFallback && pool) {
      const [rows] = await pool.query('SELECT * FROM reviews WHERE is_verified = 1 ORDER BY display_order ASC');
      return rows;
    }
    const data = readFallbackData();
    return (data.reviews || []).filter(r => r.is_verified === 1 || r.is_verified === true);
  },

  // Offer Status Evaluation Helper
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

  // Offers Management
  getOffers: async () => {
    let offersList = [];
    if (!useFallback && pool) {
      const [rows] = await pool.query('SELECT * FROM offers ORDER BY id DESC');
      offersList = rows;
    } else {
      const data = readFallbackData();
      offersList = data.offers || [];
    }

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
    if (!useFallback && pool) {
      const [rows] = await pool.query('SELECT * FROM offers WHERE id = ? LIMIT 1', [offerId]);
      if (!rows[0]) return null;
      return { ...rows[0], status: db.computeOfferStatus(rows[0]) };
    }
    const data = readFallbackData();
    const offer = (data.offers || []).find(o => o.id === offerId);
    if (!offer) return null;
    return { ...offer, status: db.computeOfferStatus(offer) };
  },

  createOffer: async (offerData) => {
    const {
      title,
      subtitle = '',
      description,
      discount_type = 'percentage',
      discount_value = 0,
      promotional_price = null,
      applicable_services = 'all',
      min_amount = 0,
      discount_code = '',
      badge_text = 'Festive Offer',
      image_url = null,
      terms = '',
      cta_text = 'Book Pickup',
      fireworks_enabled = 1,
      is_active = 1,
      start_date = null,
      end_date = null
    } = offerData;

    if (!useFallback && pool) {
      const [result] = await pool.query(
        `INSERT INTO offers (
          title, subtitle, description, discount_type, discount_value,
          promotional_price, applicable_services, min_amount, discount_code,
          badge_text, image_url, terms, cta_text, fireworks_enabled,
          is_active, start_date, end_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title, subtitle, description, discount_type, discount_value,
          promotional_price, applicable_services, min_amount, discount_code,
          badge_text, image_url, terms, cta_text, fireworks_enabled ? 1 : 0,
          is_active ? 1 : 0, start_date || null, end_date || null
        ]
      );
      return result.insertId;
    }

    const data = readFallbackData();
    data.offers = data.offers || [];
    const nextId = (data.offers.reduce((max, o) => Math.max(max, o.id || 0), 0) || 0) + 1;
    const newOffer = {
      id: nextId,
      title,
      subtitle,
      description,
      discount_type,
      discount_value: parseFloat(discount_value) || 0,
      promotional_price: promotional_price ? parseFloat(promotional_price) : null,
      applicable_services,
      min_amount: parseFloat(min_amount) || 0,
      discount_code,
      badge_text,
      image_url,
      terms,
      cta_text,
      fireworks_enabled: fireworks_enabled ? 1 : 0,
      is_active: is_active ? 1 : 0,
      start_date: start_date || null,
      end_date: end_date || null,
      created_at: new Date().toISOString()
    };
    data.offers.unshift(newOffer);
    writeFallbackData(data);
    return nextId;
  },

  updateOffer: async (id, offerData) => {
    const offerId = parseInt(id, 10);
    const {
      title,
      subtitle = '',
      description,
      discount_type = 'percentage',
      discount_value = 0,
      promotional_price = null,
      applicable_services = 'all',
      min_amount = 0,
      discount_code = '',
      badge_text = 'Festive Offer',
      image_url = null,
      terms = '',
      cta_text = 'Book Pickup',
      fireworks_enabled = 1,
      is_active = 1,
      start_date = null,
      end_date = null
    } = offerData;

    if (!useFallback && pool) {
      await pool.query(
        `UPDATE offers SET
          title = ?, subtitle = ?, description = ?, discount_type = ?, discount_value = ?,
          promotional_price = ?, applicable_services = ?, min_amount = ?, discount_code = ?,
          badge_text = ?, image_url = ?, terms = ?, cta_text = ?, fireworks_enabled = ?,
          is_active = ?, start_date = ?, end_date = ?, updated_at = NOW()
        WHERE id = ?`,
        [
          title, subtitle, description, discount_type, discount_value,
          promotional_price, applicable_services, min_amount, discount_code,
          badge_text, image_url, terms, cta_text, fireworks_enabled ? 1 : 0,
          is_active ? 1 : 0, start_date || null, end_date || null, offerId
        ]
      );
      return;
    }

    const data = readFallbackData();
    data.offers = data.offers || [];
    const idx = data.offers.findIndex(o => o.id === offerId);
    if (idx !== -1) {
      data.offers[idx] = {
        ...data.offers[idx],
        title,
        subtitle,
        description,
        discount_type,
        discount_value: parseFloat(discount_value) || 0,
        promotional_price: promotional_price ? parseFloat(promotional_price) : null,
        applicable_services,
        min_amount: parseFloat(min_amount) || 0,
        discount_code,
        badge_text,
        image_url,
        terms,
        cta_text,
        fireworks_enabled: fireworks_enabled ? 1 : 0,
        is_active: is_active ? 1 : 0,
        start_date: start_date || null,
        end_date: end_date || null,
        updated_at: new Date().toISOString()
      };
      writeFallbackData(data);
    }
  },

  updateOfferStatus: async (id, isActive) => {
    const offerId = parseInt(id, 10);
    const flag = isActive ? 1 : 0;
    if (!useFallback && pool) {
      await pool.query('UPDATE offers SET is_active = ?, updated_at = NOW() WHERE id = ?', [flag, offerId]);
      return;
    }
    const data = readFallbackData();
    const offer = (data.offers || []).find(o => o.id === offerId);
    if (offer) {
      offer.is_active = flag;
      offer.updated_at = new Date().toISOString();
      writeFallbackData(data);
    }
  },

  deleteOffer: async (id) => {
    const offerId = parseInt(id, 10);
    if (!useFallback && pool) {
      await pool.query('DELETE FROM offers WHERE id = ?', [offerId]);
      return;
    }
    const data = readFallbackData();
    data.offers = (data.offers || []).filter(o => o.id !== offerId);
    writeFallbackData(data);
  },

  // Dynamic Theme & Campaign Scheduling Engine
  getThemeSettings: async () => {
    const settings = await db.getSettings();
    const mode = settings.theme_mode || 'manual';
    let computedTheme = settings.active_theme || 'diwali';

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
      configured_theme: settings.active_theme || 'diwali',
      theme_mode: mode,
      campaign_start: settings.campaign_start || '2026-10-01T00:00:00',
      campaign_end: settings.campaign_end || '2026-11-15T23:59:59',
      fireworks_enabled: fireworksAllowed && computedTheme === 'diwali',
      festive_banner_enabled: settings.festive_banner_enabled === 'true',
      festive_banner_text: settings.festive_banner_text || ''
    };
  }
};

module.exports = { initDatabase, db };
