# 🧺 Diwakar Ji Laundry Service — Full-Stack Platform

> **Modern, Database-Driven Laundry Booking & Business Management System**  
> Serving Kanpur (Kidwai Nagar, Swaroop Nagar, Kakadeo, Kalyanpur, Civil Lines, IIT Kanpur) with Free Doorstep Pickup & Delivery.

---

## 🌟 Architecture & Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Pure CSS Design System with Curated Typography (`Outfit`, `Plus Jakarta Sans`, `Manrope`, `Inter`).
- **Dual & Multi-Theme Engine**:
  - 🪔 **Shubh Diwali Theme**: Sacred royal purple, night sky, illuminated earthen clay diya with 3-layered animated flame, swinging traditional Indian lanterns (Akasdeep / Kandils), fairy lights, rotating lotus rangoli mandala, and gold sparkles.
  - 🌊 **Classic Ocean Theme (Everyday)**: Professional crisp ivory/white, deep navy `#10243A`, and royal azure `#2878F0`.
  - 👑 **Royal Gold Theme**: Onyx black and champagne gold.
  - 🍃 **Fresh Mint Theme**: Eco-friendly botanical greens and emerald.
- **Backend**: Node.js, Express.js REST API, parameterized SQL queries, centralized error handling, and rate limiting.
- **Security**:
  - BCrypt password hashing for admin credentials (`DiwakarLaundry@2026`).
  - JWT token and secure HTTP cookie authentication.
  - Helmet security headers and CORS protection.
  - `express-rate-limit` on booking and login endpoints.
- **Database**:
  - MySQL 8.0 normalized schema (`database/schema.sql`, `database/seed.sql`) with InnoDB engine, foreign keys, and indexes.
  - Resilient automated storage adapter for zero-friction local execution.
- **Owner WhatsApp Notification Workflow**:
  - **100% Preserved**: Booking submissions save to the database, generate a unique reference (`DWK-YYYYMM-XXXX`), and open WhatsApp directly to the owner (`+91 7860462268`) with the exact structured message.

---

## 📁 Project Structure

```
DiwakarJi-Laundry/
├── client/                     # React + Vite Frontend
│   ├── public/                 # Authentic image assets (wash_fold.png, etc.)
│   ├── src/
│   │   ├── components/         # Header, Hero, Services, Pricing, BookingForm, Modal, etc.
│   │   ├── pages/              # HomePage, AdminLoginPage, AdminDashboardPage
│   │   ├── context/            # ThemeContext, ConfigContext, AuthContext
│   │   ├── services/           # api.js client API service
│   │   └── styles/             # main.css, themes.css, admin.css
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── server/                     # Node.js + Express REST API
│   ├── src/
│   │   ├── config/             # db.js (MySQL pool with resilient adapter)
│   │   ├── controllers/        # publicController.js, adminController.js
│   │   ├── middleware/         # authMiddleware.js, rateLimiter.js
│   │   ├── routes/             # publicRoutes.js, adminRoutes.js
│   │   ├── utils/              # refGenerator.js, whatsappHelper.js
│   │   └── app.js              # Express app definition
│   ├── server.js               # Entrypoint (starts server on port 5000)
│   ├── test_api.js             # Automated API test suite (23 tests)
│   ├── package.json
│   └── .env.example
├── database/                   # MySQL 8.0 Relational Database Schema
│   ├── schema.sql              # Normalized MySQL tables DDL
│   └── seed.sql                # Canonical Kanpur business seed data
├── DiwakarJi-Laundry/          # Preserved original static assets & source backup
└── README.md                   # System documentation
```

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (Tested with v26.12.0)
- **npm**: v9.0.0 or higher
- **MySQL**: 8.0+ (Optional for local test; server auto-bridges if MySQL credentials are not set)

### 2. Backend Setup
```bash
cd server
npm install
npm test          # Runs 23 comprehensive API and persistence tests
node server.js    # Starts API on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run build     # Builds production bundle into client/dist
npm run dev       # Starts Vite dev server on http://localhost:5173
```

---

## 🗄️ MySQL Database Setup & Migration

To use an external or local production MySQL instance:
1. Create database:
   ```sql
   CREATE DATABASE diwakar_laundry CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Run schema and seed scripts:
   ```bash
   mysql -u root -p diwakar_laundry < database/schema.sql
   mysql -u root -p diwakar_laundry < database/seed.sql
   ```
3. Configure `server/.env`:
   ```env
   PORT=5000
   NODE_ENV=production
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=diwakar_laundry
   JWT_SECRET=your_super_secret_jwt_key
   ```

---

## 🔐 Admin Dashboard Credentials

- **URL**: `http://localhost:5000/admin` (or `/admin/login`)
- **Username**: `admin`
- **Default Password**: `DiwakarLaundry@2026`

### Admin Capabilities
- **Dashboard Overview**: Real-time database metrics (Total Bookings, Pending, Confirmed, Completed, Today's pickups).
- **Bookings Manager**: Search by reference/customer, filter by status and date, inline status progression with audit trail, direct customer call & WhatsApp dispatch.
- **Services & Rates**: Edit base prices and active status for all 6 Kanpur services.
- **Website & Theme Settings**: Switch the public theme (`Shubh Diwali`, `Classic Ocean`, `Royal Gold`, `Fresh Mint`), toggle festive announcement banner and text, edit owner phone numbers.
- **Security**: Change admin password with bcrypt encryption.

---

## 📲 Owner WhatsApp Workflow Specification

1. Customer submits booking on the web application.
2. Frontend validates:
   - Full name (>= 2 chars)
   - Indian mobile number (valid 10 digits starting with 6-9)
   - Complete address & Kanpur area
   - Selected service & estimated quantity
   - Pickup date (not in past) & preferred time slot
3. Server receives request, checks duplicate submission (within past 10 minutes), saves booking, and generates reference code:
   `DWK-YYYYMM-XXXX`
4. Server constructs WhatsApp owner message:
   ```
   🧺 *New Laundry Booking — Diwakar Ji*

   Hello Diwakar Ji,

   I would like to book a laundry pickup.

   ━━━━━━━━━━━━━━━━━━
   🔖 *Booking Ref:* DWK-2610-A7F2
   👤 *Name:* Priya Sharma
   📱 *Mobile:* 9876543210
   🏠 *Address:* House 42, Block C, Swaroop Nagar
   📍 *Area / PIN Code:* Swaroop Nagar, Kanpur
   👕 *Service:* Wash & Iron
   ⚖️ *Estimated Quantity:* 4–6 kg (Medium load)
   💰 *Estimated Price:* ~₹300
   📅 *Pickup Date:* Sunday, 26 Oct 2026
   ⏰ *Preferred Time:* 9:00 AM – 11:00 AM
   📝 *Special Instructions:* Please steam press formal shirts carefully.
   ━━━━━━━━━━━━━━━━━━

   Please confirm availability and the final price.

   Thank you! 🙏
   ```
5. Modal displays confirmation with copy options, direct phone call, and automatic dispatch to `https://wa.me/917860462268`.

---

## 🚢 Deployment Guide

### Option A: Unified Node.js Deployment (Render / Railway / VPS / Heroku)
The Express server is configured to serve the React production bundle from `client/dist` and handle SPA routing:
```bash
# Build React client
cd client && npm run build && cd ..

# Start Node server
cd server && npm start
```
Configure environment variables in your hosting provider according to `server/.env.example`.

### Option B: Decoupled Netlify + Node API
1. Deploy `client/` to **Netlify**:
   - Build command: `npm run build`
   - Publish directory: `client/dist`
   - Environment variable: `VITE_API_URL=https://your-api.onrender.com/api`
2. Deploy `server/` to **Render** / **Railway** with MySQL database:
   - Environment variables: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `FRONTEND_URL`.

---

## 🧪 Automated Test Verification

Run the test suite at any time:
```bash
cd server
npm test
```
Result: **23 passing tests (0 failures)** verifying health, configuration, validation, booking persistence, duplicate prevention, admin authentication, rate limiting, and theme persistence.
