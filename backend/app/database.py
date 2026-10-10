import sqlite3
import os
import json
import hashlib
import secrets
from typing import Optional, Dict, Any, List
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "moodscape.db")

def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return key.hex(), salt

def verify_password(password: str, salt: str, expected_hash: str) -> bool:
    key, _ = hash_password(password, salt)
    return hmac_compare(key, expected_hash)

def hmac_compare(val1: str, val2: str) -> bool:
    return secrets.compare_digest(val1, val2)

def init_db():
    conn = get_connection()
    with conn:
        # Users table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                password_salt TEXT NOT NULL,
                avatar TEXT DEFAULT '🍿',
                created_at TEXT NOT NULL,
                auth_provider TEXT DEFAULT 'local',
                google_sub TEXT,
                is_verified INTEGER DEFAULT 0,
                verification_token TEXT
            )
        """)

        # Migration helper for existing users table
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(users)")
        existing_cols = [c[1] for c in cursor.fetchall()]
        if "auth_provider" not in existing_cols:
            conn.execute("ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'local'")
        if "google_sub" not in existing_cols:
            conn.execute("ALTER TABLE users ADD COLUMN google_sub TEXT")
        if "is_verified" not in existing_cols:
            conn.execute("ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0")
        if "verification_token" not in existing_cols:
            conn.execute("ALTER TABLE users ADD COLUMN verification_token TEXT")

        # Auth sessions
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # User Daily Mood table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS daily_moods (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                mood_date TEXT NOT NULL,
                answers TEXT NOT NULL,
                mood_profile TEXT NOT NULL,
                preference_vector TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(user_id, mood_date),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Notifications table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                room_code TEXT,
                request_id TEXT,
                is_read INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # User movie preferences (favorites and watchlist)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user_movies (
                user_id TEXT NOT NULL,
                movie_id INTEGER NOT NULL,
                list_type TEXT NOT NULL, -- 'favorite' or 'watchlist'
                created_at TEXT NOT NULL,
                PRIMARY KEY (user_id, movie_id, list_type),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

    conn.close()

# Initialize tables immediately
init_db()
