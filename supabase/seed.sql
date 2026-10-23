-- =========================================================================
-- DIWAKAR JI LAUNDRY — SUPABASE POSTGRESQL CANONICAL SEED DATA
-- Target: Supabase PostgreSQL 15+
-- =========================================================================

-- 1. BUSINESS SETTINGS
INSERT INTO public.business_settings (
  id, business_name, owner_name, phone_number, whatsapp_number, email,
  address, service_areas, operating_hours, delivery_policy, min_order_value, maps_url
) VALUES (
  1,
  'Diwakar Ji Laundry',
  'Diwakar Ji',
  '+91 7860462268',
  '917860462268',
  'diwakarjilaundry@gmail.com',
  'Kidwai Nagar & IIT Kanpur Area, Kanpur, Uttar Pradesh 208011',
  'Kakadeo, Swaroop Nagar, Kidwai Nagar, Kalyanpur, Civil Lines, Govind Nagar, Barra, IIT Kanpur Campus',
  'Monday to Sunday: 7:00 AM – 9:00 PM',
  '100% Free Doorstep Pickup & Delivery across Kanpur service zones with zero minimum order friction.',
  0.00,
  'https://maps.google.com/?q=Diwakar+Ji+Laundry+Kanpur'
) ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  owner_name = EXCLUDED.owner_name,
  phone_number = EXCLUDED.phone_number,
  whatsapp_number = EXCLUDED.whatsapp_number,
  address = EXCLUDED.address,
  service_areas = EXCLUDED.service_areas;

-- 2. SERVICES CATALOG WITH ACCURATE CANONICAL PRICING
INSERT INTO public.services (service_id, name, description, price, unit, image_url, min_order, turnaround_hours, is_active, display_order)
VALUES
  ('wash_fold', 'Wash & Fold', 'Everyday clothes thoroughly washed, machine dried and neatly folded ready for your wardrobe.', 40.00, '/kg', '/assets/laundry/wash-fold.webp', '3 kg', 24, true, 1),
  ('wash_iron', 'Wash & Iron', 'Spotless wash with precision steam ironing — crisp, sharp and professional every time.', 60.00, '/kg', '/assets/laundry/wash-iron.webp', '3 kg', 24, true, 2),
  ('dry_cleaning', 'Dry Cleaning', 'Gentle care for premium and delicate fabrics — suits, sherwanis, sarees, silk and blazers.', 120.00, '/piece', '/assets/laundry/dry-cleaning.webp', '1 piece', 48, true, 3),
  ('steam_iron', 'Steam Ironing', 'Wrinkle-free, sharp and fresh — high-pressure temperature-controlled steam press.', 30.00, '/piece', '/assets/laundry/steam-iron.webp', '3 pieces', 12, true, 4),
  ('blankets', 'Blankets & Bedsheets', 'Deep sanitization and heavy-duty wash for blankets, quilts, bedsheets, and comforters.', 80.00, '/piece', '/assets/laundry/blankets.webp', '1 piece', 48, true, 5),
  ('express', 'Express Laundry', 'Need it urgently? Same-day or guaranteed 24-hour fast turnaround delivery in Kanpur.', 70.00, '/kg', '/assets/laundry/express-laundry.webp', '2 kg', 12, true, 6)
ON CONFLICT (service_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  unit = EXCLUDED.unit,
  image_url = EXCLUDED.image_url;

-- 3. THEME CONFIGURATIONS
INSERT INTO public.theme_configs (
  theme_key, theme_name, is_active, is_draft, theme_colors, typography_settings, banner_settings, decorative_settings, published_at
) VALUES
  (
    'classic_ocean',
    'Classic Ocean (Normal Everyday)',
    false,
    false,
    '{"primary": "#10243A", "secondary": "#1E3E62", "accent": "#2878F0", "surface": "#FFFFFF", "background": "#F8FAFC", "text": "#0F172A"}'::jsonb,
    '{"fontFamily": "Plus Jakarta Sans, sans-serif", "headingFont": "Outfit, sans-serif"}'::jsonb,
    '{"enabled": false, "text": "Serving Kanpur with 100% Free Doorstep Pickup & Delivery."}'::jsonb,
    '{"fireworks": false, "diyas": false, "marigold": false}'::jsonb,
    now()
  ),
  (
    'diwali',
    'Shubh Diwali Festive Theme',
    true,
    false,
    '{"primary": "#0D1117", "secondary": "#161B22", "accent": "#F59E0B", "gold": "#F6C64A", "surface": "#1F2937", "background": "#0B0F19", "text": "#F8FAFC"}'::jsonb,
    '{"fontFamily": "Plus Jakarta Sans, sans-serif", "headingFont": "Outfit, sans-serif"}'::jsonb,
    '{"enabled": true, "text": "🪔 Shubh Diwali Offer: 15% OFF on Blankets & Dry Cleaning! Free Doorstep Pickup & Delivery across Kanpur."}'::jsonb,
    '{"fireworks": true, "diyas": true, "marigold": true, "lanterns": true}'::jsonb,
    now()
  )
ON CONFLICT (theme_key) DO UPDATE SET
  is_active = EXCLUDED.is_active,
  theme_colors = EXCLUDED.theme_colors,
  banner_settings = EXCLUDED.banner_settings,
  decorative_settings = EXCLUDED.decorative_settings;

-- 4. DIWALI CAMPAIGN & PROMOTIONS
INSERT INTO public.campaigns (
  name, slug, headline, subtitle, description, banner_image_url, hero_image_url,
  discount_type, discount_value, min_order_amount, max_discount, applicable_services,
  start_at, end_at, timezone, status, terms_and_conditions, is_public, display_priority
) VALUES (
  'Diwali Special 2026',
  'diwali-special',
  'Diwali Special',
  'Fresh Clothes for a Brighter Tomorrow',
  'Celebrate Diwali with sparkling fresh clothes and special festive laundry savings across Kanpur.',
  '/assets/campaigns/diwali-banner.webp',
  '/assets/campaigns/diwali-hero.webp',
  'percentage',
  15.00,
  100.00,
  500.00,
  'all',
  '2026-10-01 00:00:00+05:30',
  '2026-11-15 23:59:59+05:30',
  'Asia/Kolkata',
  'active',
  'Valid on all standard laundry and dry cleaning orders placed through the website during the festive campaign. Minimum order value ₹100.',
  true,
  1
) ON CONFLICT (slug) DO UPDATE SET
  headline = EXCLUDED.headline,
  description = EXCLUDED.description,
  discount_value = EXCLUDED.discount_value,
  status = EXCLUDED.status;

-- 5. COUPON CODES
INSERT INTO public.coupon_codes (code, discount_type, discount_value, min_order_amount, max_discount, max_uses, expires_at, is_active)
VALUES
  ('SHUBHDIWALI', 'percentage', 15.00, 100.00, 300.00, 500, '2026-11-15 23:59:59+05:30', true),
  ('DIWALI20', 'percentage', 20.00, 250.00, 500.00, 250, '2026-11-15 23:59:59+05:30', true),
  ('FLAT50', 'fixed', 50.00, 300.00, 50.00, 100, '2026-11-30 23:59:59+05:30', true)
ON CONFLICT (code) DO UPDATE SET
  discount_value = EXCLUDED.discount_value,
  is_active = EXCLUDED.is_active;

-- 6. FAQS
INSERT INTO public.faqs (question, answer, display_order, is_active)
VALUES
  ('How do I book a laundry pickup?', 'Simply fill the booking form on this website or tap the WhatsApp button. You will receive an instant booking reference and Diwakar Ji will confirm your pickup slot on WhatsApp.', 1, true),
  ('Is pickup and delivery really free?', 'Yes! Doorstep pickup and delivery are 100% free across our covered service areas in Kanpur.', 2, true),
  ('How is the final price calculated?', 'Prices shown on the website are transparent base estimates. When our delivery partner arrives, your clothes are digitally weighed in front of you for exact billing.', 3, true),
  ('How much time does delivery take?', 'Standard Wash & Fold / Wash & Iron takes 24 to 48 hours. Express laundry orders can be delivered on the same day or within 24 hours upon request.', 4, true),
  ('Are my clothes washed separately?', 'Absolutely. We strictly maintain 100% individual wash batches per customer for highest hygiene. Your clothes are never mixed with anyone else''s.', 5, true);

-- 7. AUTHENTIC REVIEWS
INSERT INTO public.reviews (author_name, location, rating, review_text, is_verified, display_order)
VALUES
  ('Rohit Singh', 'IIT Kanpur Area', 5, 'Excellent service! Clothes came back fresh, clean and really neatly pressed. Highly recommended for Kanpur residents and students.', true, 1),
  ('Neha Verma', 'Kidwai Nagar, Kanpur', 5, 'Very professional and on-time doorstep delivery. Now I only trust Diwakar Ji for all our family laundry needs.', true, 2),
  ('Amit Tiwari', 'Kalyanpur, Kanpur', 5, 'The best laundry service in Kanpur. Quality is top-notch and rates are genuine. My heavy winter blankets look brand new!', true, 3);
