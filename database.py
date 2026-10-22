"""
Database module for Diwakar Ji Laundry
Handles SQLite initialization, schema creation, seeding, and queries.
"""
import sqlite3
import os
from werkzeug.security import generate_password_hash

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'diwakar_laundry.db')


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn


def init_db():
    """Initializes the database schema and default records if not present."""
    conn = get_db()
    cursor = conn.cursor()

    # 1. Website Settings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS website_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT NOT NULL
    );
    """)

    # 2. Services table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        unit TEXT NOT NULL,
        is_popular INTEGER DEFAULT 0,
        image_url TEXT NOT NULL,
        icon_class TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1
    );
    """)

    # 3. Bookings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        mobile TEXT NOT NULL,
        address TEXT NOT NULL,
        area TEXT NOT NULL,
        service_name TEXT NOT NULL,
        quantity TEXT NOT NULL,
        pickup_date TEXT NOT NULL,
        pickup_time TEXT NOT NULL,
        instructions TEXT DEFAULT '',
        estimated_amount TEXT DEFAULT '',
        status TEXT DEFAULT 'pending',
        notification_status TEXT DEFAULT 'initiated',
        ip_address TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 4. Admin Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
    );
    """)

    # Seed default website settings
    default_settings = [
        ('business_name', 'Diwakar Ji Laundry Service'),
        ('contact_phone', '+91 7860462268'),
        ('whatsapp_number', '917860462268'),
        ('owner_name', 'Diwakar Ji'),
        ('festive_banner_enabled', 'true'),
        ('festive_banner_text', '🪔 Shubh Diwali Offer: 15% OFF on Blankets & Dry Cleaning! Free Pickup & Delivery across Kanpur.'),
        ('festive_discount_badge', 'Diwali Festive Offer'),
        ('diwali_decorations_enabled', 'true'),
        ('hero_headline', 'Fresh Clothes. Fresh Feel.'),
        ('hero_subtitle', 'Professional laundry & dry cleaning with free doorstep pickup & delivery across Kanpur. Cleaner clothes, happier homes.'),
        ('opening_hours', '7:00 AM – 8:00 PM (All 7 Days)'),
        ('service_areas', 'IIT Kanpur Area, Kalyanpur, Kidwai Nagar, Govind Nagar, Civil Lines, Kakadeo & Nearby')
    ]

    for key, val in default_settings:
        cursor.execute("""
        INSERT OR IGNORE INTO website_settings (setting_key, setting_value)
        VALUES (?, ?)
        """, (key, val))

    # Seed genuine services with real prices from existing website
    default_services = [
        ('wash_fold', 'Wash & Fold', 'Clean, fresh and neatly folded clothes delivered to your door.', 40.0, '/kg', 0, 'wash_fold.png', 'fa-shirt', 1),
        ('wash_iron', 'Wash & Iron', 'Spotless wash with perfect ironing — crisp and professional every time.', 60.0, '/kg', 1, 'wash_iron.png', 'fa-wand-magic-sparkles', 2),
        ('dry_cleaning', 'Dry Cleaning', 'For premium & delicate fabrics — suits, sarees, silk and more.', 120.0, '/piece', 0, 'dry_cleaning.png', 'fa-vest', 3),
        ('steam_iron', 'Steam Ironing', 'Wrinkle-free, sharp & fresh — professional steam press for all garments.', 30.0, '/piece', 0, 'steam_iron.png', 'fa-temperature-high', 4),
        ('blankets', 'Blankets & Bedsheets', 'Hygienic, deep cleaning for home essentials — fresh, soft & germ-free.', 80.0, '/piece', 0, 'blankets.png', 'fa-bed', 5),
        ('express', 'Express Laundry', "Need it fast? We've got you covered — same day or next day delivery.", 70.0, '/kg', 0, 'express_laundry.png', 'fa-bolt', 6)
    ]

    for sid, name, desc, price, unit, pop, img, icon, order in default_services:
        cursor.execute("""
        INSERT OR IGNORE INTO services (service_id, name, description, price, unit, is_popular, image_url, icon_class, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (sid, name, desc, price, unit, pop, img, icon, order))

    # Seed admin user if not exists
    cursor.execute("SELECT id FROM admin_users WHERE username = 'admin'")
    if not cursor.fetchone():
        hashed = generate_password_hash('DiwakarLaundry@2026')
        cursor.execute("""
        INSERT INTO admin_users (username, password_hash, role)
        VALUES ('admin', ?, 'admin')
        """, (hashed,))

    conn.commit()
    conn.close()


if __name__ == '__main__':
    init_db()
    print("Database initialized successfully at:", DB_PATH)
