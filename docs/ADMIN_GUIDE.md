# Diwakar Ji Laundry — Store Owner & Administrator Manual

This comprehensive guide explains how to manage day-to-day laundry operations, orders, services, pricing, website content, themes, and campaigns via the Diwakar Ji Laundry Admin Console.

---

## 1. Accessing the Admin Console

- **Console URL**: `https://diwakar-ji.netlify.app/admin/login` (or `/admin` when logged in)
- **Initial Username**: `admin`
- **Initial Password**: `admin123`
*(Change your password under **Admin Profile** immediately upon your first login)*

---

## 2. Navigating the 13 Admin Tabs

### 1. Overview
- **Key Performance Indicators (KPIs)**: View Total Bookings, New/Pending Orders, Confirmed Pickups, Completed Deliveries, and Pickups Scheduled for Today.
- **Active Campaign Status**: Live indicator showing whether the Diwali Special offer is currently active.
- **Recent Customer Bookings**: Real-time table with instant quick-action buttons to confirm or complete orders.

### 2. Bookings & Orders
- **Filter & Search**: Search by Booking Ref (e.g., `DJL-20261023-A1B2`), customer name, or phone number. Filter by status (`pending`, `confirmed`, `completed`, `cancelled`) or by pickup date.
- **9-Stage Order Tracking Status Updater**: Click the **Stage** button on any order to advance its status:
  - *Booking Received* &rarr; *Booking Confirmed* &rarr; *Pickup Scheduled* &rarr; *Picked Up* &rarr; *Processing* &rarr; *Quality Check* &rarr; *Ready for Delivery* &rarr; *Out for Delivery* &rarr; *Delivered*.
- **Audit Reason**: Add an optional reason for status adjustments (e.g., "Customer requested evening pickup", "4.5 kg weighed at workshop").
- **WhatsApp Direct Action**: Click the green **WhatsApp** button to immediately open a prefilled WhatsApp conversation with the customer.

### 3. Customers Directory
- Automatically compiles a deduplicated directory of all customers who have booked with Diwakar Ji Laundry.
- Displays customer name, phone number, primary neighborhood (e.g., Kidwai Nagar, Kalyanpur, IIT Area), total orders placed, estimated lifetime spend, and last booking date.
- One-click WhatsApp link to contact the customer for reminders or offers.

### 4. Services Catalog
- View all active services.
- **Inline Price Editing**: Update the base price directly in the table and click **Save**.
- **Add New Service**: Add a new laundry service with custom name, description, unit (per kg / per piece / per pair), turnaround estimate, and photo asset URL.
- **Delete Service**: Safely remove outdated or deprecated services.

### 5. Pricing Manager
- Displays the official Diwakar Ji standard pricing:
  - Wash & Fold: **₹40 / kg** (min 3 kg)
  - Wash & Steam Iron: **₹60 / kg** (min 2 kg)
  - Dry Cleaning: **₹120 / piece**
  - Doorstep Delivery: **FREE above ₹299** (₹40 standard delivery for smaller orders).

### 6. Website Content (CMS)
- **Hero Banner Editor**: Modify the main homepage headline, subtitle, primary CTA button label, and hero photo without editing any code.
- **Section Visibility Toggles**: Enable or disable any homepage section (Hero, Services, How It Works, Why Choose Us, Pricing, Reviews, FAQ, Service Areas, Footer) with a single click.

### 7. Image Library (Media Manager)
- Central visual gallery of all 11+ professional commercial laundry photographs.
- Displays thumbnail preview, file size in KB, MIME type, and alt text.
- One-click **Copy Path** button to copy image paths for use in services or campaigns.
- **Register Asset**: Register new image files deployed to the server or object storage.

### 8. Appearance & Themes
- **Theme Switcher**: Switch between:
  - **Shubh Diwali Festival Theme**: Deep navy `#0c1424`, festive gold accents `#d4a34b`, diya illumination, and subtle sparkle canvas.
  - **Ocean Blue Everyday Theme**: Clean navy `#10243A`, sky blue `#2878F0`, and crisp minimalist presentation.
- **Live Theme Preview Modal**: Test both themes in a real-time simulator with a **Desktop** vs. **Mobile Device Frame** toggle *without affecting the live website*.
- **Campaign Scheduling**: Configure exact start and end dates (Asia/Kolkata timezone) for the theme to switch automatically.

### 9. Campaigns & Offers
- **Diwali Campaign Manager**: Create and edit seasonal offers with custom headline, discount percentage or fixed amount, and validity dates.
- **One-Click Actions**: Edit, Duplicate (creates draft), Pause/Activate, or Delete.
- **Coupon Vouchers**: Issue promo codes (e.g., `SHUBHDIWALI`, `DIWALI20`, `FLAT50`) with minimum order constraints and maximum discount caps.

### 10. SEO Settings
- Manage the public meta title, meta description, keywords, canonical site URL, and OpenGraph social sharing image.

### 11. Business Settings
- Manage verified business contact information:
  - Owner WhatsApp: `7860462268`
  - Helpline Phone: `+91 7860462268`
  - Workshop Address: `Shop No. 4, Kidwai Nagar Main Market & Kalyanpur IIT Area, Kanpur, UP 208011`
  - Serviceable Neighborhoods: `Kidwai Nagar, Kalyanpur, IIT Kanpur, Kakadeo, Swaroop Nagar, Civil Lines, Barra, Govind Nagar, Shyam Nagar`.

### 12. Audit Logs & Reports
- Chronological, tamper-evident log tracking every admin event: status updates, pricing changes, theme switches, and publications.

### 13. Admin Profile & Security
- Change admin password securely with bcrypt salt-hashing.
- Session logout.
