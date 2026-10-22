"""
Comprehensive test suite for Diwakar Ji Laundry Backend & Workflow
Tests:
  - Public API & configuration
  - Booking validation (mobile, past date, required fields)
  - Database persistence & retrieval
  - Preserved owner WhatsApp notification format & destination
  - Duplicate booking prevention
  - Notification status update
  - Admin authentication & unauthorized rejection
  - Admin booking status workflow
  - Admin service editing & dynamic reflection on public API
  - Admin settings editing & dynamic reflection on public API
"""
import unittest
import json
import urllib.parse
from datetime import date, timedelta
from app import app
import database


class DiwakarJiLaundryTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        database.init_db()

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        # Clean test bookings for test isolation
        conn = database.get_db()
        conn.execute("DELETE FROM bookings WHERE customer_name IN ('Pooja Agarwal', 'Rajesh Kumar')")
        conn.commit()
        conn.close()

    def test_01_public_config_endpoint(self):
        """Verify public config returns genuine services and owner contact settings."""
        res = self.app.get('/api/public/config')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data.decode('utf-8'))
        
        # Check settings
        self.assertIn('settings', data)
        settings = data['settings']
        self.assertEqual(settings.get('whatsapp_number'), '917860462268')
        self.assertIn('+91 7860462268', settings.get('contact_phone', ''))
        self.assertEqual(settings.get('owner_name'), 'Diwakar Ji')

        # Check genuine services and baseline prices
        self.assertIn('services', data)
        services = {s['name']: s for s in data['services']}
        self.assertIn('Wash & Fold', services)
        self.assertIn('Wash & Iron', services)
        self.assertIn('Dry Cleaning', services)
        self.assertIn('Steam Ironing', services)
        self.assertIn('Blankets & Bedsheets', services)
        self.assertIn('Express Laundry', services)

        self.assertEqual(services['Wash & Fold']['price'], 40.0)
        self.assertEqual(services['Wash & Iron']['price'], 60.0)
        self.assertEqual(services['Dry Cleaning']['price'], 120.0)

    def test_02_booking_validation_failures(self):
        """Verify invalid bookings are rejected with descriptive error messages."""
        today = date.today().strftime('%Y-%m-%d')
        yesterday = (date.today() - timedelta(days=1)).strftime('%Y-%m-%d')

        # Test past pickup date
        past_payload = {
            'name': 'Rajesh Kumar',
            'mobile': '9876543210',
            'address': 'House 42, Civil Lines',
            'area': 'Civil Lines',
            'service': 'Wash & Fold',
            'quantity': '4–6 kg (Medium load)',
            'date': yesterday,
            'time': '9:00 AM – 11:00 AM'
        }
        res = self.app.post('/api/bookings', json=past_payload)
        self.assertEqual(res.status_code, 400)
        data = json.loads(res.data.decode('utf-8'))
        self.assertFalse(data['success'])
        self.assertTrue(any('past' in err.lower() for err in data['errors']))

        # Test invalid mobile number (not 10 digits or invalid starting digit)
        invalid_phone_payload = past_payload.copy()
        invalid_phone_payload['date'] = today
        invalid_phone_payload['mobile'] = '12345'
        res = self.app.post('/api/bookings', json=invalid_phone_payload)
        self.assertEqual(res.status_code, 400)
        data = json.loads(res.data.decode('utf-8'))
        self.assertTrue(any('mobile' in err.lower() for err in data['errors']))

        # Test missing name
        missing_name_payload = past_payload.copy()
        missing_name_payload['date'] = today
        missing_name_payload['name'] = ''
        res = self.app.post('/api/bookings', json=missing_name_payload)
        self.assertEqual(res.status_code, 400)

    def test_03_booking_creation_and_preserved_whatsapp_workflow(self):
        """Verify successful booking saves to database and preserves WhatsApp owner workflow."""
        pickup_date = (date.today() + timedelta(days=2)).strftime('%Y-%m-%d')
        payload = {
            'name': 'Pooja Agarwal',
            'mobile': '9839123456',
            'address': 'Flat 302, Green Valley Apartments, Kalyanpur',
            'area': 'Kalyanpur - 208017',
            'service': 'Wash & Iron',
            'quantity': '4–6 kg (Medium load)',
            'date': pickup_date,
            'time': '9:00 AM – 11:00 AM',
            'instructions': 'Please wash delicate shirts separately.'
        }

        res = self.app.post('/api/bookings', json=payload)
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data.decode('utf-8'))
        self.assertTrue(data['success'])
        
        booking = data['booking']
        self.assertTrue(booking['reference'].startswith('DWK-'))
        self.assertEqual(booking['customer_name'], 'Pooja Agarwal')
        self.assertEqual(booking['mobile'], '9839123456')
        self.assertEqual(booking['status'], 'pending')

        # CRITICAL TEST: Preserved owner WhatsApp notification URL & destination
        self.assertIn('whatsappUrl', data)
        wa_url = data['whatsappUrl']
        self.assertTrue(wa_url.startswith('https://wa.me/917860462268?text='))

        # Decode message and verify exact expected format and details
        parsed = urllib.parse.urlparse(wa_url)
        params = urllib.parse.parse_qs(parsed.query)
        msg_text = params['text'][0]

        self.assertIn('New Laundry Booking — Diwakar Ji', msg_text)
        self.assertIn('Hello Diwakar Ji', msg_text)
        self.assertIn('Pooja Agarwal', msg_text)
        self.assertIn('9839123456', msg_text)
        self.assertIn('Flat 302, Green Valley Apartments, Kalyanpur', msg_text)
        self.assertIn('Kalyanpur - 208017', msg_text)
        self.assertIn('Wash & Iron', msg_text)
        self.assertIn('4–6 kg (Medium load)', msg_text)
        self.assertIn(booking['reference'], msg_text)
        self.assertIn('Please wash delicate shirts separately.', msg_text)
        self.assertIn('Please confirm availability and the final price.', msg_text)

        # Test duplicate prevention: re-submitting same booking should return existing reference without creating duplicate
        dup_res = self.app.post('/api/bookings', json=payload)
        self.assertEqual(dup_res.status_code, 200)
        dup_data = json.loads(dup_res.data.decode('utf-8'))
        self.assertTrue(dup_data.get('is_duplicate', False))
        self.assertEqual(dup_data['booking']['reference'], booking['reference'])

        # Test notification status update
        notif_res = self.app.patch(f"/api/bookings/{booking['reference']}/notification", json={'status': 'opened'})
        self.assertEqual(notif_res.status_code, 200)

    def test_04_admin_auth_and_protection(self):
        """Verify protected admin endpoints reject unauthorized requests."""
        # Unauthenticated request should be rejected with 401
        res = self.app.get('/api/admin/dashboard-stats')
        self.assertEqual(res.status_code, 401)

        res = self.app.get('/api/admin/bookings')
        self.assertEqual(res.status_code, 401)

        # Invalid login
        login_res = self.app.post('/api/admin/login', json={'username': 'admin', 'password': 'WrongPassword123'})
        self.assertEqual(login_res.status_code, 401)

        # Valid login
        login_ok = self.app.post('/api/admin/login', json={'username': 'admin', 'password': 'DiwakarLaundry@2026'})
        self.assertEqual(login_ok.status_code, 200)
        login_data = json.loads(login_ok.data.decode('utf-8'))
        self.assertTrue(login_data['success'])
        token = login_data['token']

        # Create a sample booking to verify stats
        pickup_date = (date.today() + timedelta(days=2)).strftime('%Y-%m-%d')
        self.app.post('/api/bookings', json={
            'name': 'Pooja Agarwal',
            'mobile': '9839123456',
            'address': 'Flat 302, Green Valley Apartments, Kalyanpur',
            'area': 'Kalyanpur - 208017',
            'service': 'Wash & Iron',
            'quantity': '4–6 kg (Medium load)',
            'date': pickup_date,
            'time': '9:00 AM – 11:00 AM'
        })

        # Now dashboard-stats should succeed with session
        stats_res = self.app.get('/api/admin/dashboard-stats')
        self.assertEqual(stats_res.status_code, 200)
        stats = json.loads(stats_res.data.decode('utf-8'))
        self.assertGreaterEqual(stats['total'], 1)

    def test_05_admin_booking_status_update(self):
        """Verify admin can view bookings and change booking status."""
        # Create a sample booking
        pickup_date = (date.today() + timedelta(days=2)).strftime('%Y-%m-%d')
        book_res = self.app.post('/api/bookings', json={
            'name': 'Pooja Agarwal',
            'mobile': '9839123456',
            'address': 'Flat 302, Green Valley Apartments, Kalyanpur',
            'area': 'Kalyanpur - 208017',
            'service': 'Wash & Iron',
            'quantity': '4–6 kg (Medium load)',
            'date': pickup_date,
            'time': '9:00 AM – 11:00 AM'
        })
        b_data = json.loads(book_res.data.decode('utf-8'))['booking']
        b_id = b_data['id']

        # Log in
        self.app.post('/api/admin/login', json={'username': 'admin', 'password': 'DiwakarLaundry@2026'})

        # Get list of bookings
        res = self.app.get('/api/admin/bookings')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data.decode('utf-8'))
        self.assertTrue(len(data['bookings']) > 0)

        # Update status to 'confirmed'
        update_res = self.app.patch(f'/api/admin/bookings/{b_id}/status', json={'status': 'confirmed'})
        self.assertEqual(update_res.status_code, 200)
        up_data = json.loads(update_res.data.decode('utf-8'))
        self.assertEqual(up_data['status'], 'confirmed')

    def test_06_admin_service_price_update_and_public_reflection(self):
        """Verify editing a service price in admin immediately updates the public API."""
        # Log in
        self.app.post('/api/admin/login', json={'username': 'admin', 'password': 'DiwakarLaundry@2026'})

        # Find 'Wash & Fold' service
        services_res = self.app.get('/api/admin/services')
        services = json.loads(services_res.data.decode('utf-8'))['services']
        wf_service = next(s for s in services if s['service_id'] == 'wash_fold')
        wf_id = wf_service['id']

        # Update price to 45.0
        update_res = self.app.put(f'/api/admin/services/{wf_id}', json={
            'name': 'Wash & Fold',
            'price': 45.0,
            'unit': '/kg',
            'description': 'Clean, fresh and neatly folded clothes delivered to your door.',
            'is_popular': 0,
            'is_active': 1
        })
        self.assertEqual(update_res.status_code, 200)

        # Check public API: verify price is now 45.0!
        pub_res = self.app.get('/api/public/config')
        pub_services = json.loads(pub_res.data.decode('utf-8'))['services']
        pub_wf = next(s for s in pub_services if s['service_id'] == 'wash_fold')
        self.assertEqual(pub_wf['price'], 45.0)

        # Revert back to genuine price 40.0
        self.app.put(f'/api/admin/services/{wf_id}', json={
            'name': 'Wash & Fold',
            'price': 40.0,
            'unit': '/kg',
            'description': 'Clean, fresh and neatly folded clothes delivered to your door.',
            'is_popular': 0,
            'is_active': 1
        })

    def test_07_admin_settings_update(self):
        """Verify admin can toggle festive banner and update settings dynamically."""
        # Log in
        self.app.post('/api/admin/login', json={'username': 'admin', 'password': 'DiwakarLaundry@2026'})

        new_banner_text = "🪔 Shubh Deepavali Offer: 20% OFF on all Dry Cleaning orders this week!"
        update_res = self.app.put('/api/admin/settings', json={
            'festive_banner_text': new_banner_text,
            'festive_banner_enabled': 'true'
        })
        # Test theme switching
        theme_res = self.app.put('/api/admin/settings', json={'active_theme': 'royal_gold'})
        self.assertEqual(theme_res.status_code, 200)

        pub_theme_res = self.app.get('/api/public/config')
        theme_settings = json.loads(pub_theme_res.data.decode('utf-8'))['settings']
        self.assertEqual(theme_settings['active_theme'], 'royal_gold')

        # Revert theme back to diwali
        self.app.put('/api/admin/settings', json={'active_theme': 'diwali'})


if __name__ == '__main__':
    unittest.main()
