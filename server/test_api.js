const http = require('http');
const app = require('./src/app');
const { initDatabase, db } = require('./src/config/db');

let server;
let baseUrl;

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (options.body) {
      if (typeof options.body === 'object') {
        reqOptions.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
      }
      reqOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
    }

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING NODE.JS + EXPRESS API TEST SUITE ---');
  await initDatabase();

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test server running on ${baseUrl}`);

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health endpoint
    const healthRes = await makeRequest('/api/health');
    assert(healthRes.status === 200 && healthRes.body.status === 'healthy', 'GET /api/health returns healthy');

    // 2. Public config
    const configRes = await makeRequest('/api/public/config');
    assert(configRes.status === 200, 'GET /api/public/config returns 200');
    assert(Array.isArray(configRes.body.services) && configRes.body.services.length >= 6, 'Returns 6 active Kanpur laundry services');
    assert(configRes.body.settings.active_theme === 'diwali', 'Default active theme is diwali');
    assert(configRes.body.settings.whatsapp_number === '917860462268', 'Owner WhatsApp is configured as +91 7860462268');

    // 3. Validation rejection for empty booking
    const badBooking = await makeRequest('/api/bookings', { method: 'POST', body: {} });
    assert(badBooking.status === 400, 'POST /api/bookings rejects empty submission with 400');

    // 4. Validation rejection for bad phone number
    const badPhoneBooking = await makeRequest('/api/bookings', {
      method: 'POST',
      body: {
        full_name: 'Test Customer',
        mobile: '12345',
        address: '123 Test Street, Kidwai Nagar',
        area: 'Kidwai Nagar',
        service: 'Wash & Fold',
        quantity: '4–6 kg',
        pickup_date: '2026-10-25',
        pickup_time: '9:00 AM – 11:00 AM'
      }
    });
    assert(badPhoneBooking.status === 400, 'POST /api/bookings rejects invalid mobile number');

    // 5. Successful booking creation
    const testPhone = '98' + String(Date.now()).slice(-8);
    const validBooking = await makeRequest('/api/bookings', {
      method: 'POST',
      body: {
        full_name: 'Priya Sharma',
        mobile: testPhone,
        address: 'House 42, Block C, Swaroop Nagar',
        area: 'Swaroop Nagar, Kanpur',
        service: 'Wash & Iron',
        quantity: '4–6 kg (Medium load)',
        pickup_date: '2026-10-26',
        pickup_time: '9:00 AM – 11:00 AM',
        instructions: 'Please steam press formal shirts carefully.'
      }
    });

    assert(validBooking.status === 201, 'POST /api/bookings creates booking with 201');
    assert(validBooking.body.booking_ref && validBooking.body.booking_ref.startsWith('DWK-'), 'Generates valid DWK- reference code');
    assert(validBooking.body.whatsapp_url.includes('wa.me/917860462268'), 'Constructs owner WhatsApp URL with +91 7860462268');
    assert(validBooking.body.whatsapp_message.includes('Priya Sharma'), 'WhatsApp message contains customer name');
    assert(validBooking.body.whatsapp_message.includes(validBooking.body.booking_ref), 'WhatsApp message contains booking reference code');

    const createdRef = validBooking.body.booking_ref;

    // 6. Duplicate booking check
    const dupBooking = await makeRequest('/api/bookings', {
      method: 'POST',
      body: {
        full_name: 'Priya Sharma',
        mobile: testPhone,
        address: 'House 42, Block C, Swaroop Nagar',
        area: 'Swaroop Nagar, Kanpur',
        service: 'Wash & Iron',
        quantity: '4–6 kg (Medium load)',
        pickup_date: '2026-10-26',
        pickup_time: '9:00 AM – 11:00 AM'
      }
    });
    assert(dupBooking.status === 200 && dupBooking.body.is_duplicate === true, 'Duplicate submission within 10 min returns existing reference safely');

    // 7. Track owner notification status
    const notifRes = await makeRequest(`/api/bookings/${createdRef}/notification`, { method: 'PATCH' });
    assert(notifRes.status === 200 && notifRes.body.success === true, 'PATCH /api/bookings/:ref/notification marks WhatsApp notified');

    // 8. Admin login invalid credentials
    const badLogin = await makeRequest('/api/admin/login', {
      method: 'POST',
      body: { username: 'admin', password: 'WrongPassword!' }
    });
    assert(badLogin.status === 401, 'POST /api/admin/login rejects wrong credentials with 401');

    // 9. Admin login valid credentials
    const goodLogin = await makeRequest('/api/admin/login', {
      method: 'POST',
      body: { username: 'admin', password: 'DiwakarLaundry@2026' }
    });
    assert(goodLogin.status === 200 && goodLogin.body.token, 'POST /api/admin/login succeeds and returns JWT token');
    const adminToken = goodLogin.body.token;

    // 10. Protected admin endpoint without token is blocked
    const unauthDashboard = await makeRequest('/api/admin/dashboard-stats');
    assert(unauthDashboard.status === 401, 'Unauthenticated GET /api/admin/dashboard-stats is blocked with 401');

    // 11. Protected admin endpoint with token
    const authDashboard = await makeRequest('/api/admin/dashboard-stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(authDashboard.status === 200, 'Authenticated GET /api/admin/dashboard-stats succeeds with 200');
    assert(authDashboard.body.stats.total_bookings >= 1, 'Real booking count reflected in dashboard KPIs');

    // 12. Admin booking list & status transition
    const bookingsList = await makeRequest('/api/admin/bookings', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(bookingsList.status === 200 && bookingsList.body.bookings.length >= 1, 'Admin can retrieve all bookings with customer details');

    const bookingId = bookingsList.body.bookings[0].id;
    const updateStatusRes = await makeRequest(`/api/admin/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'confirmed', reason: 'Pickup vehicle assigned for Kidwai Nagar' }
    });
    assert(updateStatusRes.status === 200, 'Admin can update booking status to confirmed');

    // 13. Dynamic Theme & Settings Update
    const updateSettingsRes = await makeRequest('/api/admin/settings', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { active_theme: 'royal_gold', festive_banner_text: '👑 Royal Gold Festival Seva' }
    });
    assert(updateSettingsRes.status === 200, 'Admin can update website theme to royal_gold in database');

    const verifyConfig = await makeRequest('/api/public/config');
    assert(verifyConfig.body.settings.active_theme === 'royal_gold', 'Public config dynamically reflects updated royal_gold theme');

    // 14. Public Offers & Theme Endpoints
    const publicOfferRes = await makeRequest('/api/offers/active');
    assert(publicOfferRes.status === 200, 'GET /api/offers/active returns 200');
    assert(publicOfferRes.body.offer && typeof publicOfferRes.body.offer === 'object', 'Active offer exists with dynamic fields');

    const publicThemeRes = await makeRequest('/api/theme');
    assert(publicThemeRes.status === 200, 'GET /api/theme returns 200');
    assert(publicThemeRes.body.active_theme !== undefined, 'Returns computed active_theme');
    assert(typeof publicThemeRes.body.fireworks_enabled === 'boolean', 'Returns fireworks_enabled flag');

    // 15. Admin Offer CRUD
    const adminOffersList = await makeRequest('/api/admin/offers', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminOffersList.status === 200 && Array.isArray(adminOffersList.body.offers), 'Admin can list all offers');

    // Create test offer
    const createOfferRes = await makeRequest('/api/admin/offers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: 'Diwali Special 2026',
        subtitle: 'Fresh Clothes for a Brighter Tomorrow',
        description: 'Celebrate Diwali with fresh clothes and special laundry savings.',
        discount_type: 'percentage',
        discount_value: 20,
        discount_code: 'DIWALI20',
        badge_text: 'Festive Offer',
        applicable_services: 'all',
        min_amount: 300,
        fireworks_enabled: 1,
        is_active: 1
      }
    });
    assert(createOfferRes.status === 201 && createOfferRes.body.offer.id, 'Admin can create a new dynamic offer');
    const createdOfferId = createOfferRes.body.offer.id;

    // Toggle offer status
    const toggleOfferRes = await makeRequest(`/api/admin/offers/${createdOfferId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { is_active: false }
    });
    assert(toggleOfferRes.status === 200 && toggleOfferRes.body.offer.is_active === 0, 'Admin can deactivate offer via PATCH status');

    // Delete test offer
    const deleteOfferRes = await makeRequest(`/api/admin/offers/${createdOfferId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(deleteOfferRes.status === 200, 'Admin can delete an offer');

    // 16. Admin Theme Scheduling & Mode
    const updateThemeRes = await makeRequest('/api/admin/theme', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        active_theme: 'diwali',
        theme_mode: 'scheduled',
        campaign_start: '2026-10-01T00:00:00',
        campaign_end: '2026-11-15T23:59:59',
        fireworks_enabled: true
      }
    });
    assert(updateThemeRes.status === 200, 'Admin can update theme scheduling and fireworks toggle');
    assert(updateThemeRes.body.theme.active_theme === 'diwali', 'Theme scheduling dynamically computes diwali inside campaign window');

    // Reset back to diwali manual
    await makeRequest('/api/admin/theme', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        active_theme: 'diwali',
        theme_mode: 'manual',
        fireworks_enabled: true
      }
    });

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\n====================================================`);
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`====================================================`);
    if (failed > 0) process.exit(1);
  }
}

runTests();
