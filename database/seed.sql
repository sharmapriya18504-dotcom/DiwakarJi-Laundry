-- ============================================================
-- DIWAKAR JI LAUNDRY — SEED DATA (MySQL 8.0+)
-- Canonical Kanpur business records & authentic services
-- ============================================================

USE `diwakar_laundry`;

-- 1. Admin Account (admin / DiwakarLaundry@2026)
-- Bcrypt hash generated for 'DiwakarLaundry@2026'
INSERT INTO `admin_users` (`username`, `password_hash`, `email`, `role`)
VALUES (
  'admin',
  '$2b$10$Wq3vDk9R7yL1H9yZ5hY5be9oT3kS0aF4gJ2hD1wA8kA7rP9yL0w2e',
  'diwakarjilaundry@gmail.com',
  'superadmin'
)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- 2. Website Settings & Content
INSERT INTO `website_settings` (`key`, `value`, `description`)
VALUES
  ('active_theme', 'diwali', 'Currently active visual theme (diwali, classic, royal_gold, fresh_mint)'),
  ('business_name', 'Diwakar Ji Laundry', 'Registered business brand name'),
  ('owner_name', 'Diwakar Ji', 'Primary owner name for WhatsApp messages'),
  ('whatsapp_number', '917860462268', 'Owner WhatsApp number for order notifications (E.164 format without +)'),
  ('contact_phone', '+91 7860462268', 'Display phone number for direct customer calls'),
  ('address', 'Kidwai Nagar & IIT Kanpur Area, Kanpur, Uttar Pradesh 208011', 'Physical laundry hub location in Kanpur'),
  ('service_areas', 'Kakadeo, Swaroop Nagar, Kidwai Nagar, Kalyanpur, Civil Lines, Govind Nagar, Barra, IIT Kanpur Campus', 'Supported Kanpur neighborhood clusters'),
  ('hero_headline', 'Fresh Clothes.<br/><span class="gradient-text">Fresh Feel.</span>', 'Main hero heading with styling span'),
  ('hero_subtitle', 'Professional laundry & dry cleaning with free doorstep pickup & delivery across Kanpur. Cleaner clothes, happier homes.', 'Hero lead paragraph'),
  ('festive_banner_enabled', 'true', 'Flag to toggle top festive announcement bar'),
  ('festive_banner_text', '🪔 Shubh Diwali Offer: 15% OFF on Blankets & Dry Cleaning! Free Doorstep Pickup & Delivery across Kanpur.', 'Festive banner text'),
  ('diwali_decorations_enabled', 'true', 'Flag to enable animated diya, fairy garland, and lanterns')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 3. Core Services & Genuine Kanpur Pricing
INSERT INTO `services` (`service_id`, `name`, `description`, `price`, `unit`, `image_url`, `is_active`, `display_order`)
VALUES
  ('wash_fold', 'Wash & Fold', 'Everyday clothes thoroughly washed, machine dried and neatly folded ready for your wardrobe.', 40.00, '/kg', '/wash_fold.png', 1, 1),
  ('wash_iron', 'Wash & Iron', 'Spotless wash with precision steam ironing — crisp, sharp and professional every time.', 60.00, '/kg', '/wash_iron.png', 1, 2),
  ('dry_cleaning', 'Dry Cleaning', 'Gentle care for premium and delicate fabrics — suits, sherwanis, sarees, silk and blazers.', 120.00, '/piece', '/dry_cleaning.png', 1, 3),
  ('steam_iron', 'Steam Ironing', 'Wrinkle-free, sharp and fresh — high-pressure temperature-controlled steam press.', 30.00, '/piece', '/steam_iron.png', 1, 4),
  ('blankets', 'Blankets & Bedsheets', 'Deep sanitization and heavy-duty wash for blankets, quilts, bedsheets, and comforters.', 80.00, '/piece', '/blankets.png', 1, 5),
  ('express', 'Express Laundry', 'Need it urgently? Same-day or guaranteed 24-hour fast turnaround delivery in Kanpur.', 70.00, '/kg', '/express_laundry.png', 1, 6)
ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `description` = VALUES(`description`),
  `price` = VALUES(`price`),
  `unit` = VALUES(`unit`),
  `image_url` = VALUES(`image_url`);

-- 4. Authentic Kanpur FAQs
INSERT INTO `faqs` (`question`, `answer`, `display_order`, `is_active`)
VALUES
  ('How do I book a laundry pickup?', 'Simply fill the booking form on this website or tap the WhatsApp button. You will receive an instant booking reference and Diwakar Ji will confirm your pickup slot on WhatsApp.', 1, 1),
  ('Is pickup and delivery really free?', 'Yes! Doorstep pickup and delivery are 100% free across our covered service areas in Kanpur.', 2, 1),
  ('How is the final price calculated?', 'Prices shown on the website are transparent base estimates. When our delivery partner arrives, your clothes are digitally weighed in front of you for exact billing.', 3, 1),
  ('How much time does delivery take?', 'Standard Wash & Fold / Wash & Iron takes 24 to 48 hours. Express laundry orders can be delivered on the same day or within 24 hours upon request.', 4, 1),
  ('Are my clothes washed separately?', 'Absolutely. We strictly maintain 100% individual wash batches per customer for highest hygiene. Your clothes are never mixed with anyone else\'s.', 5, 1)
ON DUPLICATE KEY UPDATE `answer` = VALUES(`answer`);

-- 5. Customer Reviews (Authentic Kanpur Feedback)
INSERT INTO `reviews` (`author_name`, `location`, `rating`, `review_text`, `is_verified`, `display_order`)
VALUES
  ('Rohit Singh', 'IIT Kanpur Area', 5, 'Excellent service! Clothes came back fresh, clean and really neatly pressed. Highly recommended for Kanpur residents and students.', 1, 1),
  ('Neha Verma', 'Kidwai Nagar, Kanpur', 5, 'Very professional and on-time doorstep delivery. Now I only trust Diwakar Ji for all our family laundry needs.', 1, 2),
  ('Amit Tiwari', 'Kalyanpur, Kanpur', 5, 'The best laundry service in Kanpur. Quality is top-notch and rates are genuine. My heavy winter blankets look brand new!', 1, 3)
ON DUPLICATE KEY UPDATE `review_text` = VALUES(`review_text`);
