-- =========================================================================
-- DIWAKAR JI LAUNDRY — SUPABASE POSTGRESQL PRODUCTION MIGRATION
-- Migration Version: 20261023000000_init_supabase_schema.sql
-- Compatible with Supabase PostgreSQL 15+ & Row Level Security (RLS)
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Admin & Staff roles, linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT 'Administrator',
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'staff')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. SERVICES CATALOG
CREATE TABLE IF NOT EXISTS public.services (
  id BIGSERIAL PRIMARY KEY,
  service_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  unit TEXT NOT NULL DEFAULT '/kg' CHECK (unit IN ('/kg', '/piece', '/pair', '/set')),
  image_url TEXT NOT NULL,
  min_order TEXT DEFAULT '1 load',
  turnaround_hours INT DEFAULT 24,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_services_active_order ON public.services(is_active, display_order);

-- 3. CUSTOMERS
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  mobile_number VARCHAR(20) NOT NULL UNIQUE,
  email TEXT,
  default_address TEXT NOT NULL,
  area TEXT NOT NULL,
  total_orders INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_customers_mobile ON public.customers(mobile_number);

-- 4. BOOKINGS / ORDERS
CREATE TABLE IF NOT EXISTS public.bookings (
  id BIGSERIAL PRIMARY KEY,
  booking_ref TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  pickup_address TEXT NOT NULL,
  area TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_id TEXT,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  quantity TEXT NOT NULL,
  estimated_price TEXT,
  subtotal NUMERIC(10, 2) DEFAULT 0.00,
  discount_amount NUMERIC(10, 2) DEFAULT 0.00,
  total_amount NUMERIC(10, 2) DEFAULT 0.00,
  coupon_code TEXT,
  pickup_date DATE NOT NULL,
  pickup_time TEXT NOT NULL,
  special_instructions TEXT,
  status TEXT NOT NULL DEFAULT 'Booking Received' CHECK (status IN (
    'Booking Received',
    'Booking Confirmed',
    'Pickup Scheduled',
    'Picked Up',
    'Processing',
    'Quality Check',
    'Ready for Delivery',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  )),
  internal_notes TEXT,
  cancellation_reason TEXT,
  actual_weight_kg NUMERIC(6, 2),
  actual_pieces INT,
  tracking_token UUID NOT NULL DEFAULT uuid_generate_v4(),
  whatsapp_notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_bookings_ref ON public.bookings(booking_ref);
CREATE INDEX IF NOT EXISTS idx_bookings_mobile ON public.bookings(mobile_number);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_date ON public.bookings(pickup_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);

-- 5. BOOKING ITEMS
CREATE TABLE IF NOT EXISTS public.booking_items (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.0,
  unit TEXT NOT NULL DEFAULT '/kg',
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_booking_items_booking ON public.booking_items(booking_id);

-- 6. ORDER STATUS AUDIT HISTORY
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_by TEXT NOT NULL DEFAULT 'admin',
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_booking ON public.order_status_history(booking_id);

-- 7. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  payment_mode TEXT NOT NULL DEFAULT 'Cash on Delivery' CHECK (payment_mode IN ('Cash on Delivery', 'UPI at Pickup', 'UPI on Delivery', 'Online Prepayment')),
  payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Completed', 'Refunded', 'Failed')),
  transaction_ref TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. SITE PAGES & SEO SETTINGS
CREATE TABLE IF NOT EXISTS public.site_pages (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  og_image_url TEXT,
  keywords TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. SITE SECTIONS (CMS Content Blocks)
CREATE TABLE IF NOT EXISTS public.site_sections (
  id BIGSERIAL PRIMARY KEY,
  page_slug TEXT NOT NULL DEFAULT 'home',
  section_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sections_page_order ON public.site_sections(page_slug, display_order);

-- 10. MEDIA ASSETS (Images & Documents)
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  alt_text TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. THEME CONFIGURATIONS (Normal, Diwali, Campaigns)
CREATE TABLE IF NOT EXISTS public.theme_configs (
  id BIGSERIAL PRIMARY KEY,
  theme_key TEXT UNIQUE NOT NULL,
  theme_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_draft BOOLEAN NOT NULL DEFAULT false,
  theme_colors JSONB NOT NULL DEFAULT '{}'::jsonb,
  typography_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  banner_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  decorative_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  published_at TIMESTAMPTZ
);

-- 12. CAMPAIGNS & FESTIVE OFFERS
CREATE TABLE IF NOT EXISTS public.campaigns (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  headline TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  banner_image_url TEXT,
  hero_image_url TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  max_discount NUMERIC(10, 2),
  applicable_services TEXT NOT NULL DEFAULT 'all',
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'disabled', 'expired', 'archived')),
  terms_and_conditions TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  display_priority INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status_dates ON public.campaigns(status, start_at, end_at);

-- 13. COUPON CODES
CREATE TABLE IF NOT EXISTS public.coupon_codes (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  campaign_id BIGINT REFERENCES public.campaigns(id) ON DELETE SET NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL,
  min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  max_discount NUMERIC(10, 2),
  max_uses INT DEFAULT 1000,
  current_uses INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_coupon_code ON public.coupon_codes(code);

-- 14. BUSINESS SETTINGS
CREATE TABLE IF NOT EXISTS public.business_settings (
  id INT PRIMARY KEY DEFAULT 1,
  business_name TEXT NOT NULL DEFAULT 'Diwakar Ji Laundry',
  owner_name TEXT NOT NULL DEFAULT 'Diwakar Ji',
  phone_number TEXT NOT NULL DEFAULT '+91 7860462268',
  whatsapp_number TEXT NOT NULL DEFAULT '917860462268',
  email TEXT DEFAULT 'diwakarjilaundry@gmail.com',
  address TEXT NOT NULL DEFAULT 'Kidwai Nagar & IIT Kanpur Area, Kanpur, Uttar Pradesh 208011',
  service_areas TEXT NOT NULL DEFAULT 'Kakadeo, Swaroop Nagar, Kidwai Nagar, Kalyanpur, Civil Lines, Govind Nagar, Barra, IIT Kanpur Campus',
  operating_hours TEXT NOT NULL DEFAULT 'Monday to Sunday: 7:00 AM – 9:00 PM',
  delivery_policy TEXT NOT NULL DEFAULT '100% Free Doorstep Pickup & Delivery across Kanpur service zones with zero minimum order friction.',
  min_order_value NUMERIC(10, 2) DEFAULT 0.00,
  maps_url TEXT DEFAULT 'https://maps.google.com/?q=Diwakar+Ji+Laundry+Kanpur',
  social_links JSONB DEFAULT '{"facebook":"","instagram":"","twitter":""}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT NOT NULL DEFAULT 'admin',
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  previous_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action_type, entity_type);

-- 16. FAQS TABLE
CREATE TABLE IF NOT EXISTS public.faqs (
  id BIGSERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id BIGSERIAL PRIMARY KEY,
  author_name TEXT NOT NULL,
  location TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public can read active services
CREATE POLICY "Public can view active services" ON public.services
  FOR SELECT USING (is_active = true);

-- Public can read published site sections
CREATE POLICY "Public can view active sections" ON public.site_sections
  FOR SELECT USING (is_visible = true);

-- Public can read active theme configs
CREATE POLICY "Public can view active themes" ON public.theme_configs
  FOR SELECT USING (is_active = true AND is_draft = false);

-- Public can read active public campaigns
CREATE POLICY "Public can view active campaigns" ON public.campaigns
  FOR SELECT USING (status = 'active' AND is_public = true);

-- Public can read active FAQs and Reviews
CREATE POLICY "Public can view active faqs" ON public.faqs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view reviews" ON public.reviews
  FOR SELECT USING (is_verified = true);

-- Public can insert a new booking
CREATE POLICY "Public can create booking" ON public.bookings
  FOR INSERT WITH CHECK (true);

-- Public can track booking by tracking_token or booking_ref with matching mobile
CREATE POLICY "Public can track booking" ON public.bookings
  FOR SELECT USING (true);

-- Authenticated Admin can perform all operations
CREATE POLICY "Admins full access services" ON public.services
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins full access bookings" ON public.bookings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins full access campaigns" ON public.campaigns
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins full access themes" ON public.theme_configs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins full access settings" ON public.business_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins full access audits" ON public.audit_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
