# Diwakar Ji Laundry — Production Deployment Guide

This guide details the step-by-step instructions for deploying the Diwakar Ji Laundry frontend to **Netlify**, the backend API to **Render**, and the database to **Supabase**.

---

## 1. Architecture Overview

- **Frontend**: React + Vite SPA hosted on **Netlify** with automatic global CDN caching, SSL, and SPA rewrites (`_redirects` / `netlify.toml`).
- **Backend**: Node.js + Express REST API running on **Render** (Web Service).
- **Database**: PostgreSQL managed by **Supabase** with automated backups and connection pooling.
- **Image Assets**: Hosted locally under `client/public/assets/` and served via Netlify's high-speed CDN with fallbacks.

---

## 2. Step 1: Database Setup on Supabase

1. Create a free account at [Supabase](https://supabase.com).
2. Create a new project (e.g., `diwakar-ji-laundry-db`) and select the **AWS Mumbai (ap-south-1)** region for lowest latency to Kanpur.
3. Open the **SQL Editor** in the Supabase Dashboard:
   - Execute `supabase/migrations/20261023000000_init_supabase_schema.sql`
   - Execute `supabase/seed.sql`
4. In Project Settings > **Database**, copy your **Connection String (URI)**:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
5. In Project Settings > **API**, copy your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

---

## 3. Step 2: Backend Deployment on Render

1. Create an account at [Render](https://render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository (`DiwakarJi-Laundry`).
4. Configure the Web Service:
   - **Name**: `diwakarji-laundry-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Instance Type**: Free or Starter
5. Add the following **Environment Variables**:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres` |
   | `FRONTEND_URL` | `https://diwakar-ji.netlify.app` |
   | `JWT_SECRET` | *Strong 64-char random hex string* |
   | `OWNER_WHATSAPP_NUMBER`| `917860462268` |
   | `OWNER_NAME` | `Diwakar Sharma` |
6. Click **Create Web Service**. Note your Render URL:
   `https://diwakarji-laundry-api.onrender.com`

---

## 4. Step 3: Frontend Deployment on Netlify

1. Log in to [Netlify](https://netlify.com).
2. Link your GitHub repository.
3. In Site Settings > **Build & deploy**:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
4. In Site configuration > **Environment variables**, set:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://diwakarji-laundry-api.onrender.com/api` |
5. The `netlify.toml` in the repository root already provides:
   - Build commands and base directory
   - SPA route rewrites (`/* /index.html 200`)
   - Security headers (`X-Frame-Options: SAMEORIGIN` for live admin theme preview)
6. Trigger deployment. The live site will deploy at:
   `https://diwakar-ji.netlify.app/`

---

## 5. Post-Deployment Verification Checklist

- [ ] Visit `https://diwakar-ji.netlify.app/` — verify that hero, services, pricing, and campaign banner render.
- [ ] Submit a test booking — verify that an order ref (`DJL-YYYYMMDD-XXXX`) is issued.
- [ ] Click "Track Order" — verify the 9-stage tracker shows "Booking Received".
- [ ] Visit `/admin/login` — log in with `admin` / `admin123`.
- [ ] Go to "Admin Profile" and update the default password.
- [ ] Test the "Appearance & Themes" live preview modal (Desktop and Mobile).
