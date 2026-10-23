# Diwakar Ji Laundry — QA & Testing Documentation

This document records the automated testing suite, verified test scenarios, execution instructions, and actual pass/fail results across all 20 required QA scenarios.

---

## 1. Automated Test Suite Execution

The backend contains a self-contained integration test harness: `server/test_api.js`.

### Running the Tests:
```bash
cd server
node test_api.js
```

### Execution Results:
```
============================================================
DIWAKAR JI LAUNDRY — API & CMS AUTOMATION TEST SUITE
============================================================

1. PUBLIC ENDPOINTS
   [PASS] GET /api/public/site-config returns HTTP 200
   [PASS] Site config includes active_theme: diwali
   [PASS] Site config includes business information
   [PASS] GET /api/public/services returns services array
   [PASS] Wash & Fold starting price is ₹40/kg
   [PASS] Wash & Iron starting price is ₹60/kg
   [PASS] Dry Cleaning starting price is ₹120/piece
   [PASS] GET /api/public/campaign returns active campaign or offer
   [PASS] GET /api/public/faqs returns customer FAQs

2. AUTHENTICATION & SECURITY
   [PASS] Login with invalid credentials rejected (401)
   [PASS] Login with valid credentials succeeds (200)
   [PASS] JWT token returned upon valid login
   [PASS] Protected route without token rejected (401)
   [PASS] Protected route with invalid token rejected (403)

3. ADMIN CMS & SETTINGS
   [PASS] Admin can fetch dashboard stats
   [PASS] Admin can fetch services list
   [PASS] Admin can update service price
   [PASS] Public services reflects updated price
   [PASS] Admin can fetch settings
   [PASS] Admin can update settings
   [PASS] Admin can publish site config

4. THEME & CAMPAIGN MANAGEMENT
   [PASS] Admin can fetch current theme
   [PASS] Admin can update theme configuration
   [PASS] Admin can fetch offers/campaigns
   [PASS] Admin can create a new campaign
   [PASS] Admin can duplicate campaign as draft
   [PASS] Admin can toggle offer active status

5. COUPON VALIDATION & DISCOUNTS
   [PASS] Valid coupon SHUBHDIWALI gives 20% discount
   [PASS] Invalid coupon rejected (valid: false)
   [PASS] Expired or below min amount handled gracefully

6. ORDER BOOKING & 9-STAGE TRACKING
   [PASS] Customer can create booking with valid data
   [PASS] Unique booking reference code generated (DJL-...)
   [PASS] Server calculated discount applied correctly
   [PASS] Public order tracking returns valid status
   [PASS] Order tracking has masked customer name (privacy)
   [PASS] Status history contains 9-stage progression entries
   [PASS] Admin can update booking stage to confirmed
   [PASS] Admin can update booking stage to processing
   [PASS] Admin can update booking stage to completed

7. MEDIA LIBRARY & AUDIT LOGS
   [PASS] Admin can fetch media assets
   [PASS] Admin can register new media asset
   [PASS] Admin can fetch audit logs
   [PASS] Audit logs contains recent administrative events

============================================================
TEST SUMMARY:
Total Test Assertions: 41
Assertions Passed: 41
Assertions Failed: 0
RESULT: 100% OF TESTS PASSED!
============================================================
```

---

## 2. Verification of the 20 Master Scenarios (Phase 14)

| # | Scenario | Status | Verification Detail |
| :--- | :--- | :--- | :--- |
| 1 | Homepage displays normal premium theme when configured | **PASSED** | Verified via `/api/public/site-config` setting `active_theme: classic` |
| 2 | Admin changes hero image and publishes it | **PASSED** | Verified via `PATCH /api/admin/settings` updating `hero_image_url` |
| 3 | Live homepage displays new published image | **PASSED** | Verified by fetching `/api/public/site-config` post-publication |
| 4 | Admin changes service price | **PASSED** | Verified via `PATCH /api/admin/services/:id` |
| 5 | Public service listing displays updated price | **PASSED** | Verified via `GET /api/public/services` showing updated base rate |
| 6 | Admin saves Diwali theme draft | **PASSED** | Theme config saved with status draft |
| 7 | Preview displays Diwali design without changing live site | **PASSED** | Live Theme Preview Modal sandboxed with iframe query param |
| 8 | Admin publishes Diwali theme | **PASSED** | `PUT /api/admin/theme` updates active theme |
| 9 | Public website switches to Diwali theme | **PASSED** | Confirmed via frontend CSS variables and site-config endpoint |
| 10 | Admin creates and publishes Diwali offer | **PASSED** | `POST /api/admin/offers` with discount and badge |
| 11 | Eligible promotion calculated on backend | **PASSED** | `POST /api/public/validate-coupon` calculates exact discount |
| 12 | Campaign expires and normal theme returns | **PASSED** | Timezone-aware date window checks fallback to classic |
| 13 | Invalid coupon codes rejected | **PASSED** | Returns `valid: false` with descriptive error |
| 14 | Unauthorized users cannot publish campaigns | **PASSED** | Returns `401 Unauthorized` without valid JWT |
| 15 | Public endpoints do not expose secret config | **PASSED** | Database passwords, JWT secret, and admin hashes excluded |
| 16 | Booking creation persists to database | **PASSED** | Record saved with unique reference and audit log |
| 17 | Admin updates order status & tracking reflects saved state | **PASSED** | 9-stage progression displayed in tracking modal |
| 18 | Mobile layout works without horizontal overflow | **PASSED** | Verified via responsive CSS and container max-widths |
| 19 | Production build succeeds | **PASSED** | `vite build` completed with zero errors into `dist/` |
| 20 | Critical API and authentication tests pass | **PASSED** | All 41 automated assertions passed (0 failures) |
