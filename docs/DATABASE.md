# Diwakar Ji Laundry — Database Architecture & Schema Reference

This document outlines the database design, schema definitions, tables, relations, and security policies for Diwakar Ji Laundry.

---

## 1. Overview & Dual-Mode Compatibility

The platform is designed to run seamlessly with:
1. **Supabase PostgreSQL (Production Cloud)**: Utilizing native PostgreSQL data types, Row Level Security (RLS) policies, foreign keys, triggers, and JSONB payloads.
2. **MySQL 8.0+ (Local/Self-Hosted)**: Provided in `database/schema.sql` and `database/seed.sql`.
3. **Dual-Mode Resilient File Store (`server/data/diwakar_store.json`)**: An ACID-like atomic read/write fallback engine enabling zero-config local development, instant testing, and offline resilience.

---

## 2. PostgreSQL / Supabase Schema (`supabase/migrations/20261023000000_init_supabase_schema.sql`)

The PostgreSQL schema consists of **17 normalized tables**:

| Table | Purpose | Security & RLS |
| :--- | :--- | :--- |
| `profiles` | Administrator accounts with salt-hashed passwords | RLS enabled; Admin access only |
| `services` | Laundry service catalog (Wash & Fold, Wash & Iron, Dry Cleaning, etc.) | Public read for active; Admin write |
| `customers` | Normalized customer profiles and contact details | RLS enabled; Authenticated admin view |
| `bookings` | Customer laundry orders with reference codes, dates, and slots | Public insert; Customer ref track; Admin write |
| `booking_items` | Individual line items and quantities linked to bookings | Linked to bookings |
| `order_status_history` | 9-stage tracking history and audit reasons | Public tracking read via ref; Admin insert |
| `payments` | Payment logs and verification records | Admin view |
| `site_pages` | Dynamic page definitions for the CMS | Public read for published |
| `site_sections` | Section visibility toggles and layout order | Public read; Admin write |
| `media_assets` | Centralized photography asset registry with dimensions and alt text | Public read; Admin write |
| `theme_configs` | Theme appearance tokens (Ocean Blue vs. Diwali Theme) | Public read for published; Admin write |
| `campaigns` | Diwali and festive promotional campaigns | Public read for active; Admin write |
| `coupon_codes` | Server-validated checkout coupon vouchers | Public validation; Admin write |
| `business_settings` | Verified phone, WhatsApp, address, and operating hours | Public read; Admin write |
| `faqs` | Customer FAQs with category tags | Public read |
| `reviews` | Authentic authorized customer reviews | Public read |
| `audit_logs` | Chronological administrative security event ledger | Admin read only |

---

## 3. The 9-Stage Order Tracking Workflow

Every booking traverses through 9 standardized lifecycle states:
1. `pending` — **Booking Received** (Customer submitted request online)
2. `confirmed` — **Booking Confirmed** (Store verified pickup slot)
3. `pickup_scheduled` — **Pickup Scheduled** (Rider dispatched)
4. `picked_up` — **Picked Up** (Garments collected at customer doorstep)
5. `processing` — **Processing** (Weighed, sorted, and washed at facility)
6. `quality_check` — **Quality Check** (Stain inspection and garment care check)
7. `ready_for_delivery` — **Ready for Delivery** (Folded or steam-ironed on hangers)
8. `out_for_delivery` — **Out for Delivery** (Rider en route to customer address)
9. `completed` — **Delivered** (Order handed over successfully)
*(Alternative: `cancelled` with an audit reason)*

Public tracking endpoint (`/api/orders/track` or `/api/public/track/:ref`) automatically masks customer personal details (e.g., `P**** S*****`, phone `******2268`) for zero data leaks.

---

## 4. Row Level Security (RLS) Policies

Supabase Row Level Security is configured on all public-facing tables:
- `anon` roles have `SELECT` access to published configurations, active services, and current campaigns.
- `anon` roles have `INSERT` access to create bookings.
- `service_role` and verified admin tokens have complete `ALL` privileges on all management tables.

---

## 5. Seed Data Execution

To apply the schema and seed data to your Supabase project:
1. Open the **SQL Editor** in your Supabase Dashboard.
2. Paste the contents of `supabase/migrations/20261023000000_init_supabase_schema.sql` and click **Run**.
3. Paste the contents of `supabase/seed.sql` and click **Run**.
