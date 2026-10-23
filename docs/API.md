# Diwakar Ji Laundry — REST API Reference

The backend exposes a secure, rate-limited REST API supporting both customer-facing public routes and authenticated administrator endpoints.

- **Base URL (Local)**: `http://localhost:5000/api`
- **Base URL (Production)**: `https://diwakarji-laundry-api.onrender.com/api`

---

## 1. Authentication

Admin endpoints require a standard Bearer token in the `Authorization` header:
```http
Authorization: Bearer <jwt_token>
```
Tokens are generated upon successful login at `POST /api/auth/login` and expire after 7 days.

---

## 2. Public Endpoints (No Auth Required)

### `GET /api/public/site-config` (or `/api/public/config`)
Returns the currently published frontend configuration:
- `active_theme`: `'diwali'` or `'classic'`
- `theme_mode`: `'manual'` or `'scheduled'`
- `business`: Verified business name, phone, WhatsApp, and address
- `active_offer`: Active festive promotion (or `null`)
- `hero`: Headline, subtitle, CTA text, and image URL
- `sections`: Visible homepage section keys

### `GET /api/public/services` (or `/api/services`)
Returns active laundry services with base pricing, unit (`kg`/`piece`), turnaround, and commercial image URLs.

### `GET /api/public/campaign` (or `/api/offers/active`)
Returns currently active seasonal promotional campaign.

### `GET /api/public/faqs`
Returns customer FAQs organized by category.

### `POST /api/bookings`
Submit a new customer laundry booking:
- **Body**:
  ```json
  {
    "customer_name": "Priya Sharma",
    "mobile_number": "9876543210",
    "pickup_address": "Flat 302, Green Park",
    "pickup_date": "2026-10-25",
    "pickup_time": "10:00 AM - 01:00 PM",
    "area": "Kidwai Nagar",
    "service_name": "Wash & Fold",
    "quantity": 4,
    "discount_code": "SHUBHDIWALI",
    "special_instructions": "Fold neatly, eco detergent"
  }
  ```
- **Response**: `{ success: true, booking_ref: "DJL-20261025-ABCD", estimated_price: 128, tracking_url: "..." }`

### `POST /api/orders/track` (or `GET /api/public/track/:ref`)
Track order lifecycle through the 9 stages:
- **Body**: `{ "booking_ref": "DJL-20261025-ABCD" }`
- **Response**: Returns masked customer name (`P**** S*****`), status history, current stage, and timestamps.

### `POST /api/public/validate-coupon`
Verify coupon validity before order submission:
- **Body**: `{ "code": "SHUBHDIWALI", "subtotal": 350 }`
- **Response**: `{ success: true, valid: true, discount_amount: 70, final_price: 280, message: "Valid 20% discount" }`

---

## 3. Administrator Endpoints (Bearer Token Required)

### Dashboard & Analytics
- `GET /api/admin/stats` &mdash; Returns KPI counts: total, pending, confirmed, completed, today's pickups.

### Booking & Order Management
- `GET /api/admin/bookings` &mdash; Filterable list of all orders (status, search query, date).
- `PATCH /api/admin/bookings/:id/status` &mdash; Update booking state with an audit reason.
- `PATCH /api/admin/bookings/:id/details` &mdash; Update actual weight/pieces, price adjustments, and audit notes.

### Services Management
- `GET /api/admin/services` &mdash; Full service list including inactive items.
- `POST /api/admin/services` &mdash; Create new service.
- `PATCH /api/admin/services/:id` &mdash; Update service price, description, or unit.
- `DELETE /api/admin/services/:id` &mdash; Remove service.

### Media Asset Library
- `GET /api/admin/media` &mdash; Full asset gallery list.
- `POST /api/admin/media` &mdash; Register new image asset.
- `DELETE /api/admin/media/:id` &mdash; Delete asset reference.

### Appearance & Themes
- `GET /api/admin/theme` &mdash; Get current theme configuration.
- `PUT /api/admin/theme` &mdash; Update active theme, scheduling window, and sparkle effects.

### Campaigns & Coupons
- `GET /api/admin/offers` &mdash; List all seasonal campaigns.
- `POST /api/admin/offers` &mdash; Create campaign offer.
- `PUT /api/admin/offers/:id` &mdash; Edit campaign offer.
- `PATCH /api/admin/offers/:id/status` &mdash; Toggle campaign active/inactive.
- `POST /api/admin/campaigns/:id/duplicate` &mdash; Duplicate campaign as draft.
- `DELETE /api/admin/offers/:id` &mdash; Delete campaign.
- `GET /api/admin/coupons` &mdash; List coupons.
- `POST /api/admin/coupons` &mdash; Create coupon.
- `DELETE /api/admin/coupons/:id` &mdash; Delete coupon.

### CMS & Business Settings
- `GET /api/admin/settings` &mdash; Retrieve business settings.
- `PATCH /api/admin/settings` &mdash; Save settings.
- `POST /api/admin/site-config/publish` &mdash; Publish live website configuration.
- `GET /api/admin/sections` &mdash; Homepage section toggles.
- `PATCH /api/admin/sections/:key` &mdash; Toggle section visibility.

### Audit Logs & Security
- `GET /api/admin/audit-logs` &mdash; Chronological administrative audit ledger.
- `POST /api/admin/change-password` &mdash; Update admin password with bcrypt hashing.
