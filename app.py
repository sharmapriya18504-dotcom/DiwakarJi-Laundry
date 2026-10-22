"""
Diwakar Ji Laundry — Backend Server & REST API
Built with Python Flask & SQLite
"""
import os
import re
import random
import string
import urllib.parse
from datetime import datetime, date, timedelta
from functools import wraps

from flask import Flask, request, jsonify, render_template, send_from_directory, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

import database

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, 'DiwakarJi-Laundry')

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
app.secret_key = os.environ.get('SECRET_KEY', 'diwakar-laundry-secure-festive-key-2026-kanpur')
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

CORS(app, supports_credentials=True)

# Initialize DB if not present
database.init_db()


# --- AUTH DECORATOR ---
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            # Also check Authorization header token for API clients
            auth_header = request.headers.get('Authorization', '')
            token = session.get('auth_token')
            if not token or auth_header != f"Bearer {token}":
                return jsonify({'error': 'Unauthorized. Admin login required.'}), 401
        return f(*args, **kwargs)
    return decorated_function


# --- HELPER: SETTINGS ---
def get_setting(key, default=''):
    conn = database.get_db()
    row = conn.execute("SELECT setting_value FROM website_settings WHERE setting_key = ?", (key,)).fetchone()
    conn.close()
    return row['setting_value'] if row else default


def get_all_settings():
    conn = database.get_db()
    rows = conn.execute("SELECT setting_key, setting_value FROM website_settings").fetchall()
    conn.close()
    return {r['setting_key']: r['setting_value'] for r in rows}


# --- HELPER: FORMAT DATE ---
def format_date_display(date_str):
    try:
        d = datetime.strptime(date_str, '%Y-%m-%d')
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return f"{days[d.weekday()]}, {d.day} {months[d.month - 1]} {d.year}"
    except Exception:
        return date_str


# --- HELPER: ESTIMATE PRICE ---
def calculate_estimate(service_name, quantity_str):
    conn = database.get_db()
    svc = conn.execute("SELECT price, unit FROM services WHERE name = ? AND is_active = 1", (service_name,)).fetchone()
    conn.close()
    if not svc:
        return "Confirmed at pickup"
    
    price = svc['price']
    unit = svc['unit']

    # Parse approximate quantity multiplier
    qty_lower = quantity_str.lower()
    if '1–3' in qty_lower or '1-3' in qty_lower:
        base = 2
    elif '4–6' in qty_lower or '4-6' in qty_lower:
        base = 5
    elif '7–10' in qty_lower or '7-10' in qty_lower:
        base = 8
    elif '10+' in qty_lower:
        base = 12
    else:
        return f"Starting from ₹{int(price)}{unit}"

    est = int(price * base)
    return f"~₹{est} (based on ₹{int(price)}{unit})"


# --- HELPER: BUILD WHATSAPP MESSAGE ---
def build_whatsapp_message(data, ref, est_price):
    line = '\n'
    owner_name = get_setting('owner_name', 'Diwakar Ji')
    msg = f"🧺 *New Laundry Booking — {owner_name}*{line}{line}"
    msg += f"Hello {owner_name},{line}{line}"
    msg += f"I would like to book a laundry pickup.{line}{line}"
    msg += f"━━━━━━━━━━━━━━━━━━{line}"
    msg += f"🔖 *Booking Ref:* {ref}{line}"
    msg += f"👤 *Name:* {data.get('name', '')}{line}"
    msg += f"📱 *Mobile:* {data.get('mobile', '')}{line}"
    msg += f"🏠 *Address:* {data.get('address', '')}{line}"
    msg += f"📍 *Area / PIN Code:* {data.get('area', '')}{line}"
    msg += f"👕 *Service:* {data.get('service', '')}{line}"
    msg += f"⚖️ *Estimated Quantity:* {data.get('quantity', '')}{line}"
    if est_price:
        msg += f"💰 *Estimated Price:* {est_price}{line}"
    msg += f"📅 *Pickup Date:* {data.get('formatted_date', data.get('date', ''))}{line}"
    msg += f"⏰ *Preferred Time:* {data.get('time', '')}{line}"
    
    instructions = data.get('instructions', '').strip()
    if instructions:
        msg += f"📝 *Special Instructions:* {instructions}{line}"
    else:
        msg += f"📝 *Special Instructions:* —{line}"
    
    msg += f"━━━━━━━━━━━━━━━━━━{line}{line}"
    msg += f"Please confirm availability and the final price.{line}{line}"
    msg += "Thank you! 🙏"
    return msg


# ============================================================
# PUBLIC FRONTEND & ASSET ROUTES
# ============================================================

@app.route('/')
def index():
    return send_from_directory(FRONTEND_DIR, 'index.html')


@app.route('/admin')
def admin_page():
    return send_from_directory(FRONTEND_DIR, 'admin.html')


@app.route('/<path:filename>')
def serve_static(filename):
    if os.path.exists(os.path.join(FRONTEND_DIR, filename)):
        return send_from_directory(FRONTEND_DIR, filename)
    return send_from_directory(FRONTEND_DIR, 'index.html')


# ============================================================
# PUBLIC API ENDPOINTS
# ============================================================

@app.route('/api/public/config', methods=['GET'])
def get_public_config():
    """Returns dynamic website settings and active services for the public site."""
    conn = database.get_db()
    settings = get_all_settings()
    services_rows = conn.execute(
        "SELECT id, service_id, name, description, price, unit, is_popular, image_url, icon_class, display_order "
        "FROM services WHERE is_active = 1 ORDER BY display_order ASC"
    ).fetchall()
    conn.close()

    services = [dict(row) for row in services_rows]
    return jsonify({
        'settings': settings,
        'services': services
    })


@app.route('/api/bookings', methods=['POST'])
def create_booking():
    """
    Validates, saves booking to database, generates booking reference,
    and returns prefilled WhatsApp URL preserving existing owner notification.
    """
    data = request.get_json() or {}
    
    name = str(data.get('name', '')).strip()
    mobile = str(data.get('mobile', '')).strip().replace(' ', '').replace('-', '').replace('+91', '')
    address = str(data.get('address', '')).strip()
    area = str(data.get('area', '')).strip()
    service = str(data.get('service', '')).strip()
    quantity = str(data.get('quantity', '')).strip()
    pickup_date_raw = str(data.get('date', '')).strip()
    pickup_time = str(data.get('time', '')).strip()
    instructions = str(data.get('instructions', '')).strip()

    # Validations
    errors = []
    if len(name) < 2:
        errors.append("Please enter a valid customer name (at least 2 characters).")
    
    # 10 digit Indian mobile validation
    clean_mobile = re.sub(r'\D', '', mobile)
    if len(clean_mobile) == 12 and clean_mobile.startswith('91'):
        clean_mobile = clean_mobile[2:]
    if not (len(clean_mobile) == 10 and clean_mobile[0] in '6789'):
        errors.append("Please enter a valid 10-digit Indian mobile number.")
    
    if len(address) < 5:
        errors.append("Please provide a pickup address.")
    if len(area) < 2:
        errors.append("Please provide your area or PIN code.")
    if not service:
        errors.append("Please select a laundry service.")
    if not quantity:
        errors.append("Please select an estimated quantity.")
    if not pickup_time:
        errors.append("Please select a preferred pickup time.")

    # Validate pickup date (not in past, within 30 days)
    try:
        p_date = datetime.strptime(pickup_date_raw, '%Y-%m-%d').date()
        today = date.today()
        if p_date < today:
            errors.append("Pickup date cannot be in the past.")
        elif p_date > today + timedelta(days=35):
            errors.append("Pickup date cannot be more than 35 days in advance.")
    except Exception:
        errors.append("Invalid pickup date format. Expected YYYY-MM-DD.")

    if errors:
        return jsonify({'success': False, 'errors': errors}), 400

    formatted_date = format_date_display(pickup_date_raw)
    data['formatted_date'] = formatted_date
    data['mobile'] = clean_mobile

    # Duplicate check: check if same mobile, service, date, time submitted in last 10 minutes
    conn = database.get_db()
    existing = conn.execute("""
        SELECT * FROM bookings 
        WHERE mobile = ? AND service_name = ? AND pickup_date = ? AND pickup_time = ?
        AND created_at >= datetime('now', '-10 minutes')
        ORDER BY id DESC LIMIT 1
    """, (clean_mobile, service, pickup_date_raw, pickup_time)).fetchone()

    owner_phone = get_setting('whatsapp_number', '917860462268')
    est_price = calculate_estimate(service, quantity)

    if existing:
        ref = existing['reference']
        wa_msg = build_whatsapp_message(data, ref, est_price)
        wa_url = f"https://wa.me/{owner_phone}?text={urllib.parse.quote(wa_msg)}"
        conn.close()
        return jsonify({
            'success': True,
            'is_duplicate': True,
            'message': 'Existing recent booking found. Continuing with existing reference.',
            'booking': dict(existing),
            'whatsappUrl': wa_url,
            'whatsappMessage': wa_msg,
            'ownerPhone': owner_phone
        })

    # Generate unique reference
    rand_chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    ref = f"DWK-{datetime.now().strftime('%y%m')}-{rand_chars}"

    ip_addr = request.headers.get('X-Forwarded-For', request.remote_addr or '')

    conn.execute("""
        INSERT INTO bookings (
            reference, customer_name, mobile, address, area, service_name,
            quantity, pickup_date, pickup_time, instructions, estimated_amount,
            status, notification_status, ip_address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'initiated', ?)
    """, (
        ref, name, clean_mobile, address, area, service,
        quantity, pickup_date_raw, pickup_time, instructions, est_price,
        ip_addr
    ))
    conn.commit()

    saved_row = conn.execute("SELECT * FROM bookings WHERE reference = ?", (ref,)).fetchone()
    conn.close()

    # Build WhatsApp owner notification
    wa_msg = build_whatsapp_message(data, ref, est_price)
    wa_url = f"https://wa.me/{owner_phone}?text={urllib.parse.quote(wa_msg)}"

    return jsonify({
        'success': True,
        'booking': dict(saved_row) if saved_row else {'reference': ref},
        'whatsappUrl': wa_url,
        'whatsappMessage': wa_msg,
        'ownerPhone': owner_phone
    }), 201


@app.route('/api/bookings/<ref>/notification', methods=['PATCH'])
def update_notification_status(ref):
    """Updates notification status when user successfully opens WhatsApp or retries."""
    data = request.get_json() or {}
    new_status = data.get('status', 'opened')
    
    conn = database.get_db()
    conn.execute("""
        UPDATE bookings SET notification_status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE reference = ?
    """, (new_status, ref))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'reference': ref, 'notification_status': new_status})


# ============================================================
# ADMIN AUTH & MANAGEMENT API
# ============================================================

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': 'Please provide username and password.'}), 400

    conn = database.get_db()
    user = conn.execute("SELECT * FROM admin_users WHERE username = ?", (username,)).fetchone()
    
    if not user or not check_password_hash(user['password_hash'], password):
        conn.close()
        return jsonify({'error': 'Invalid username or password.'}), 401

    # Update last login
    conn.execute("UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", (user['id'],))
    conn.commit()
    conn.close()

    # Generate session & token
    auth_token = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
    session['admin_logged_in'] = True
    session['admin_username'] = username
    session['auth_token'] = auth_token

    return jsonify({
        'success': True,
        'username': username,
        'token': auth_token
    })


@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully.'})


@app.route('/api/admin/auth-check', methods=['GET'])
def admin_auth_check():
    if session.get('admin_logged_in'):
        return jsonify({
            'authenticated': True,
            'username': session.get('admin_username')
        })
    # Check Bearer token
    auth_header = request.headers.get('Authorization', '')
    token = session.get('auth_token')
    if token and auth_header == f"Bearer {token}":
        return jsonify({
            'authenticated': True,
            'username': session.get('admin_username')
        })
    return jsonify({'authenticated': False}), 401


@app.route('/api/admin/dashboard-stats', methods=['GET'])
@admin_required
def admin_dashboard_stats():
    conn = database.get_db()
    today_str = date.today().strftime('%Y-%m-%d')

    total_bookings = conn.execute("SELECT COUNT(*) AS count FROM bookings").fetchone()['count']
    pending_bookings = conn.execute("SELECT COUNT(*) AS count FROM bookings WHERE status = 'pending'").fetchone()['count']
    confirmed_bookings = conn.execute("SELECT COUNT(*) AS count FROM bookings WHERE status = 'confirmed'").fetchone()['count']
    completed_bookings = conn.execute("SELECT COUNT(*) AS count FROM bookings WHERE status = 'completed'").fetchone()['count']
    today_pickups = conn.execute("SELECT COUNT(*) AS count FROM bookings WHERE pickup_date = ?", (today_str,)).fetchone()['count']
    active_services = conn.execute("SELECT COUNT(*) AS count FROM services WHERE is_active = 1").fetchone()['count']
    
    conn.close()

    return jsonify({
        'total': total_bookings,
        'pending': pending_bookings,
        'confirmed': confirmed_bookings,
        'completed': completed_bookings,
        'today': today_pickups,
        'services': active_services
    })


@app.route('/api/admin/bookings', methods=['GET'])
@admin_required
def admin_get_bookings():
    status = request.args.get('status', '').strip()
    search = request.args.get('search', '').strip()
    date_filter = request.args.get('date', '').strip()

    conn = database.get_db()
    query = "SELECT * FROM bookings WHERE 1=1"
    params = []

    if status and status != 'all':
        query += " AND status = ?"
        params.append(status)

    if date_filter:
        query += " AND pickup_date = ?"
        params.append(date_filter)

    if search:
        query += " AND (reference LIKE ? OR customer_name LIKE ? OR mobile LIKE ? OR area LIKE ?)"
        s = f"%{search}%"
        params.extend([s, s, s, s])

    query += " ORDER BY id DESC LIMIT 100"

    rows = conn.execute(query, params).fetchall()
    conn.close()

    return jsonify({'bookings': [dict(r) for r in rows]})


@app.route('/api/admin/bookings/<int:booking_id>/status', methods=['PATCH'])
@admin_required
def admin_update_booking_status(booking_id):
    data = request.get_json() or {}
    new_status = data.get('status')
    valid_statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']

    if new_status not in valid_statuses:
        return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400

    conn = database.get_db()
    conn.execute("""
        UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (new_status, booking_id))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'booking_id': booking_id, 'status': new_status})


@app.route('/api/admin/services', methods=['GET'])
@admin_required
def admin_get_services():
    conn = database.get_db()
    rows = conn.execute("SELECT * FROM services ORDER BY display_order ASC").fetchall()
    conn.close()
    return jsonify({'services': [dict(r) for r in rows]})


@app.route('/api/admin/services', methods=['POST'])
@admin_required
def admin_create_service():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    price = data.get('price')
    unit = data.get('unit', '/kg').strip()
    desc = data.get('description', '').strip()
    image = data.get('image_url', 'wash_fold.png').strip()
    icon = data.get('icon_class', 'fa-shirt').strip()
    popular = 1 if data.get('is_popular') else 0

    if not name or price is None:
        return jsonify({'error': 'Name and price are required.'}), 400

    service_id = re.sub(r'[^a-z0-9]+', '_', name.lower()).strip('_')

    conn = database.get_db()
    try:
        conn.execute("""
            INSERT INTO services (service_id, name, description, price, unit, is_popular, image_url, icon_class, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (service_id, name, desc, float(price), unit, popular, image, icon))
        conn.commit()
    except Exception as e:
        conn.close()
        return jsonify({'error': f'Failed to create service: {str(e)}'}), 400

    conn.close()
    return jsonify({'success': True, 'message': 'Service created successfully.'}), 201


@app.route('/api/admin/services/<int:service_id>', methods=['PUT'])
@admin_required
def admin_update_service(service_id):
    data = request.get_json() or {}
    name = data.get('name')
    price = data.get('price')
    unit = data.get('unit')
    desc = data.get('description')
    popular = 1 if data.get('is_popular') else 0
    is_active = 1 if data.get('is_active', True) else 0

    if not name or price is None:
        return jsonify({'error': 'Name and price are required.'}), 400

    conn = database.get_db()
    conn.execute("""
        UPDATE services 
        SET name = ?, price = ?, unit = ?, description = ?, is_popular = ?, is_active = ?
        WHERE id = ?
    """, (name, float(price), unit, desc, popular, is_active, service_id))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Service updated successfully.'})


@app.route('/api/admin/settings', methods=['GET'])
@admin_required
def admin_get_settings():
    return jsonify({'settings': get_all_settings()})


@app.route('/api/admin/settings', methods=['PUT'])
@admin_required
def admin_update_settings():
    data = request.get_json() or {}
    allowed_keys = [
        'business_name', 'contact_phone', 'whatsapp_number', 'owner_name',
        'festive_banner_enabled', 'festive_banner_text', 'festive_discount_badge',
        'diwali_decorations_enabled', 'active_theme', 'hero_headline', 'hero_subtitle',
        'opening_hours', 'service_areas'
    ]

    conn = database.get_db()
    for key in allowed_keys:
        if key in data:
            val = str(data[key]).strip()
            conn.execute("""
                INSERT INTO website_settings (setting_key, setting_value)
                VALUES (?, ?)
                ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value
            """, (key, val))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'settings': get_all_settings()})


@app.route('/api/admin/change-password', methods=['POST'])
@admin_required
def admin_change_password():
    data = request.get_json() or {}
    current_pass = data.get('current_password', '')
    new_pass = data.get('new_password', '')

    if len(new_pass) < 6:
        return jsonify({'error': 'New password must be at least 6 characters long.'}), 400

    username = session.get('admin_username')
    conn = database.get_db()
    user = conn.execute("SELECT * FROM admin_users WHERE username = ?", (username,)).fetchone()

    if not user or not check_password_hash(user['password_hash'], current_pass):
        conn.close()
        return jsonify({'error': 'Current password is incorrect.'}), 400

    new_hash = generate_password_hash(new_pass)
    conn.execute("UPDATE admin_users SET password_hash = ? WHERE id = ?", (new_hash, user['id']))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Password changed successfully.'})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Diwakar Ji Laundry server on port {port}...")
    print(f"Public website: http://127.0.0.1:{port}/")
    print(f"Admin dashboard: http://127.0.0.1:{port}/admin")
    app.run(host='0.0.0.0', port=port, debug=True)
