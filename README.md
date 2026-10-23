# 🧺 Diwakar Ji Laundry Service — Full-Stack Platform

> **Premium Website Redesign, Full Backend CMS & Diwali Campaign Management**  
> Serving Kanpur (Kidwai Nagar, Swaroop Nagar, Kakadeo, Kalyanpur, Civil Lines, IIT Kanpur) with Free Doorstep Pickup & Delivery.

---

## 🌟 Key Highlights

1. **Advanced Professional UI/UX**:
   - Modern, high-trust visual identity designed with deep navy `#0c1424`, royal azure `#2878F0`, crisp white surfaces, refined typography (`Plus Jakarta Sans`, `Outfit`, `Manrope`), and responsive card layouts.
2. **11 Genuine Commercial Laundry Photography Assets**:
   - Deployed under `client/public/assets/laundry/` and `client/public/assets/campaigns/` (hero, wash & fold, wash & iron, dry cleaning, steam iron, express laundry, doorstep delivery, blankets & comforters, fabric care, facility process, and Diwali festive silks).
3. **Dual-Mode Theme Engine & Live Preview**:
   - **Shubh Diwali Festival Theme**: Deep navy, festive gold accents (`#d4a34b`), earthen diya illumination, marigold motifs, and subtle background sparkles.
   - **Ocean Blue Everyday Theme**: Clean atelier navy (`#10243A`), sky blue, and crisp minimalist aesthetic.
   - **Live Theme Preview Modal**: Test both themes inside an interactive Desktop and Mobile device simulator *without modifying the live website*.
4. **9-Stage Order Tracking Workflow**:
   - Customers track their order in real time via unique reference codes (e.g. `DJL-20261023-A1B2`) across 9 verified milestones: *Booking Received &rarr; Booking Confirmed &rarr; Pickup Scheduled &rarr; Picked Up &rarr; Processing &rarr; Quality Check &rarr; Ready for Delivery &rarr; Out for Delivery &rarr; Delivered*.
   - Privacy-safe masking for customer names and mobile numbers.
5. **Server-Validated Diwali Promotional Campaigns**:
   - Backend validation for coupon codes (`SHUBHDIWALI`, `DIWALI20`, `FLAT50`), minimum order constraints, maximum discount caps, and automatic expiry.
6. **13-Tab Admin Console (`/admin`)**:
   - Sidebar navigation: Overview, Bookings, Customers Directory, Services Catalog, Pricing Manager, Website Content CMS, Image Library, Appearance & Themes, Campaigns & Offers, SEO Settings, Business Settings, Audit Logs, and Admin Security Profile.
7. **PostgreSQL / Supabase Database Architecture**:
   - 17 normalized tables with Row Level Security (RLS), foreign keys, indexes, triggers, and full seed data in `supabase/migrations/` and `supabase/seed.sql`.
   - Dual-mode resilient file store (`server/data/diwakar_store.json`) for zero-config offline/local development.
8. **100% Preserved Business Integrations**:
   - Preserves verified WhatsApp owner dispatch to `+91 7860462268` (Diwakar Sharma).
   - Preserves Kanpur neighborhood coverage and authentic pricing (Wash & Fold: ₹40/kg, Wash & Iron: ₹60/kg, Dry Cleaning: ₹120/piece).

---

## 📁 Repository Structure

```
DiwakarJi-Laundry/
├── client/                     # React 18 + Vite Frontend
│   ├── public/
│   │   ├── assets/
│   │   │   ├── laundry/        # Commercial photography assets
│   │   │   └── campaigns/      # Diwali campaign banners
│   │   ├── robots.txt          # SEO robots file
│   │   ├── sitemap.xml         # XML Sitemap
│   │   └── _redirects          # Netlify SPA routing
│   ├── src/
│   │   ├── components/         # Header, Hero, Services, Pricing, TrackingModal, BookingForm...
│   │   ├── pages/              # HomePage, AdminLoginPage, AdminDashboardPage (13 tabs)
│   │   ├── context/            # ThemeContext, ConfigContext, AuthContext
│   │   ├── services/           # api.js client API service
│   │   └── styles/             # main.css, themes.css, admin.css
│   ├── package.json
│   └── vite.config.js
├── server/                     # Node.js + Express REST API
│   ├── src/
│   │   ├── config/             # db.js (PostgreSQL / MySQL / Resilient JSON store)
│   │   ├── controllers/        # publicController.js, adminController.js
│   │   ├── middleware/         # authMiddleware.js, rateLimiter.js
│   │   ├── routes/             # publicRoutes.js, adminRoutes.js
│   │   └── utils/              # refGenerator.js, whatsappHelper.js
│   ├── data/                   # Persistent fallback JSON store
│   ├── test_api.js             # Automated API integration test suite (41 assertions)
│   └── server.js
├── supabase/                   # Supabase PostgreSQL Database Setup
│   ├── migrations/             # 20261023000000_init_supabase_schema.sql
│   └── seed.sql                # Kanpur business seed data
├── database/                   # MySQL 8.0 Alternative Database Schema
│   ├── schema.sql
│   └── seed.sql
├── docs/                       # Complete Operational Documentation
│   ├── SETUP.md                # Local setup and installation guide
│   ├── DATABASE.md             # Schema, 17 tables, RLS & tracking architecture
│   ├── DEPLOYMENT.md           # Netlify, Render & Supabase deployment
│   ├── ADMIN_GUIDE.md          # Store owner admin console manual
│   ├── CAMPAIGNS.md            # Diwali offers, coupons & scheduling
│   ├── API.md                  # REST API endpoint reference
│   └── TESTING.md              # Test execution & 20 QA scenario audit
├── netlify.toml                # Netlify deployment configuration
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### 1. Start the Backend API
```bash
cd server
npm install
npm run dev
# Starts on http://localhost:5000/api
```

### 2. Start the Frontend Client
```bash
cd client
npm install
npm run dev
# Starts on http://localhost:5173
```

### 3. Run Automated Tests
```bash
cd server
node test_api.js
# Runs all 41 test assertions (100% PASS rate)
```

### 4. Admin Credentials
- **URL**: `http://localhost:5173/admin/login`
- **Username**: `admin`
- **Password**: `admin123`

---

## 📚 Documentation Links

Detailed guides are located in the [`docs/`](file:///c:/Users/Priya%20Sharma/Downloads/DiwakarJi-Laundry/docs) directory:
- [Setup & Installation Guide](file:///c:/Users/Priya%20Sharma/Downloads/DiwakarJi-Laundry/docs/SETUP.md)
- [Database Architecture & Schema](file:///c:/Users/Priya%20Sharma/Downloads/DiwakarJi-Laundry/docs/DATABASE.md)
- [Production Deployment Guide](file:///c:/Users/Priya%20Sharma/Downloads/DiwakarJi-Laundry/docs/DEPLOYMENT.md)
- [Admin Console Manual](file:///c:/Users/Priya%20Sharma/Downloads/DiwakarJi-Laundry/docs/ADMIN_GUIDE.md)
- [Diwali Campaigns & Scheduling](file:///c:/Users/Priya%20Sharma/Downloads/DiwakarJi-Laundry/docs/CAMPAIGNS.md)
- [REST API Specification](file:///c:/Users/Priya%20Sharma/Downloads/DiwakarJi-Laundry/docs/API.md)
- [QA Verification & Test Results](file:///c:/Users/Priya%20Sharma/Downloads/DiwakarJi-Laundry/docs/TESTING.md)
