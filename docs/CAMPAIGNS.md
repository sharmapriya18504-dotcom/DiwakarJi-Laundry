# Diwakar Ji Laundry — Diwali Campaigns & Promotional Offers Guide

This guide details how the Diwali campaign engine works, including server-side coupon validation, campaign scheduling, discount math, and priority rules.

---

## 1. Festive Campaign Philosophy

Diwakar Ji Laundry runs special festive campaigns (especially for Diwali, Chhath Puja, and Wedding Season) to provide Kanpur residents with premium garment care for their festive silks, kurtas, suits, and household linens.

The platform ensures:
1. **Professional Brand Identity**: The Diwali theme adds warm festive gold illumination, subtle earthen diya motifs, and marigold garlands while retaining a clean, high-trust business aesthetic (never looking like a cluttered festival flyer).
2. **Zero Browser Trust**: All discounts, coupon codes, and promotional prices are validated and calculated strictly on the backend server.
3. **Safe Campaign Scheduling**: Campaigns only display within their valid start and end timestamps (Asia/Kolkata). When a campaign ends, the site automatically transitions back to the Ocean Blue everyday theme without deleting campaign data.

---

## 2. Server-Side Discount Calculation Engine

When a customer books laundry or enters a coupon code, the backend (`server/src/controllers/publicController.js` and `server/src/config/db.js`) calculates the discount:

```javascript
// Server validation logic
let discountAmount = 0;
if (coupon.discount_type === 'percentage') {
  discountAmount = Math.round((subtotal * coupon.discount_value) / 100);
  if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
    discountAmount = coupon.max_discount_amount;
  }
} else if (coupon.discount_type === 'fixed') {
  discountAmount = Math.min(subtotal, coupon.discount_value);
}
const finalPrice = Math.max(0, subtotal - discountAmount);
```

### Server Validation Checks:
1. **Code Existence & Casing**: Codes are normalized to uppercase (e.g. `SHUBHDIWALI`).
2. **Active Status**: Inactive or draft coupons are rejected with `400 Bad Request`.
3. **Expiry Check**: If `current_date > valid_until`, coupon is rejected as expired.
4. **Minimum Order Check**: If `subtotal < min_order_amount`, coupon is rejected with a message showing the required minimum amount.
5. **Non-Negative Total**: The calculated discount can never reduce the order total below ₹0.

---

## 3. Pre-Configured Campaign Vouchers

| Code | Type | Value | Min. Order | Max. Discount | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `SHUBHDIWALI` | Percentage | 20% | ₹300 | ₹150 | Official Diwali Festive Offer |
| `DIWALI20` | Percentage | 20% | ₹300 | ₹100 | General Festive 20% Discount |
| `FLAT50` | Fixed | ₹50 | ₹250 | ₹50 | Flat ₹50 OFF for First-Time Bookings |

---

## 4. Scheduling & Priority Resolution

In the admin panel under **Appearance & Themes**:
- **Manual Mode**: Admin chooses either `diwali` or `classic`. The site remains in that theme indefinitely until changed.
- **Scheduled Mode**: The site checks current time against `campaign_start` and `campaign_end`:
  - If current time is within the window &rarr; `diwali` theme is automatically served by `/api/public/site-config`.
  - If current time is before start or after end &rarr; `classic` theme is automatically served as fallback.
  - Overlapping campaigns resolve by the highest `display_priority` value.

---

## 5. Live Theme Preview Without Publishing

Admins can preview draft themes at any time by clicking **Live Theme Preview** in the admin header or under the Themes tab:
- Renders the draft theme in an embedded sandbox iframe.
- Allows toggling between **Desktop** (1180px) and **Mobile Device Frame** (375px).
- Does not publish changes to the live customer-facing website until the admin explicitly clicks **Save Theme Settings** or **Publish Live**.
