# Diwakar Ji Laundry — Local Setup Guide

Welcome to the **Diwakar Ji Laundry** full-stack business platform. This guide provides comprehensive, step-by-step instructions for getting the frontend client, backend server, and database running locally on your development machine.

---

## 1. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: Version 18.x or 20.x LTS
- **npm**: Version 9.x or higher
- **Git**
- Optional: **MySQL 8.0+** or a **Supabase PostgreSQL** instance

---

## 2. Repository Layout

```
DiwakarJi-Laundry/
├── client/              # React 18 + Vite frontend
├── server/              # Node.js + Express backend API
├── supabase/            # Supabase PostgreSQL migrations & seed SQL
│   ├── migrations/
│   │   └── 20261023000000_init_supabase_schema.sql
│   └── seed.sql
├── database/            # Alternative MySQL schema & seed
├── docs/                # Architectural & operational documentation
└── netlify.toml         # Production build & SPA routing configuration
```

---

## 3. Backend Setup

1. Open your terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```

4. Configure your database mode in `.env`:
   - **Mode A: Dual-Mode Resilient File Store (Zero-Config Default)**:
     If MySQL or PostgreSQL is not running, the server automatically boots with the persistent JSON store in `server/data/diwakar_store.json`. No external database installation is required for local testing!
   - **Mode B: Supabase PostgreSQL**:
     Set `DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`.
   - **Mode C: Local MySQL**:
     Set `DB_HOST=localhost`, `DB_USER=root`, `DB_PASSWORD=your_password`, `DB_NAME=diwakar_laundry`.

5. Start the backend development server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   The backend will start at: `http://localhost:5000` (API base: `http://localhost:5000/api`).

---

## 4. Frontend Setup

1. In a separate terminal tab, navigate to `client/`:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the client `.env` file:
   ```bash
   cp .env.example .env
   ```
   Ensure `VITE_API_URL=http://localhost:5000/api`.

4. Start Vite development server:
   ```bash
   npm run dev
   ```
   The customer frontend will launch at: `http://localhost:5173`.

---

## 5. Default Credentials

- **Admin Console URL**: `http://localhost:5173/admin/login`
- **Username**: `admin`
- **Password**: `admin123`
*(Remember to update the password immediately under the Admin Profile / Security tab upon first login!)*

---

## 6. Verification & Automated Tests

To run the complete automated test suite (41 integration assertions):
```bash
cd server
node test_api.js
```
Expected output:
```
Total Test Assertions: 41
Assertions Passed: 41
Assertions Failed: 0
RESULT: 100% OF TESTS PASSED!
```
