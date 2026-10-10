import uuid
import json
import secrets
import urllib.request
import urllib.error
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from app.database import get_connection, hash_password, verify_password

def verify_google_id_token(id_token: str) -> Dict[str, Any]:
    """Verify Google ID token using Google OAuth2 tokeninfo endpoint."""
    url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "MoodScape-Auth/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                if "error" in data or "sub" not in data:
                    raise ValueError(data.get("error_description", "Invalid Google token"))
                return data
            else:
                raise ValueError("Google token verification failed")
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        try:
            err_json = json.loads(err_msg)
            raise ValueError(err_json.get("error_description", "Invalid Google token"))
        except Exception:
            raise ValueError("Invalid Google authentication token")
    except Exception as e:
        raise ValueError(f"Failed to verify Google token: {str(e)}")

def google_auth_user(credential_jwt: str) -> Dict[str, Any]:
    google_data = verify_google_id_token(credential_jwt)
    email = google_data.get("email", "").strip().lower()
    sub = google_data.get("sub", "")
    given_name = google_data.get("given_name", "Google")
    family_name = google_data.get("family_name", "User")
    picture = google_data.get("picture", "🍿")

    if not email:
        raise ValueError("Google account did not return a valid email address")

    conn = get_connection()
    try:
        now_iso = datetime.now(timezone.utc).isoformat()
        user_row = conn.execute("SELECT * FROM users WHERE email = ? OR google_sub = ?", (email, sub)).fetchone()
        if user_row:
            user_id = user_row["id"]
            conn.execute("""
                UPDATE users SET google_sub = ?, is_verified = 1 WHERE id = ?
            """, (sub, user_id))
            first_name = user_row["first_name"]
            last_name = user_row["last_name"]
            avatar = user_row["avatar"] or "🍿"
        else:
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            dummy_hash, dummy_salt = hash_password(secrets.token_hex(24))
            conn.execute("""
                INSERT INTO users (id, first_name, last_name, email, password_hash, password_salt, avatar, created_at, auth_provider, google_sub, is_verified)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'google', ?, 1)
            """, (user_id, given_name, family_name, email, dummy_hash, dummy_salt, "🍿", now_iso, sub))
            first_name = given_name
            last_name = family_name
            avatar = "🍿"

        token = secrets.token_urlsafe(32)
        conn.execute("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)", (token, user_id, now_iso))
        conn.commit()

        return {
            "token": token,
            "user": {
                "id": user_id,
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
                "avatar": avatar,
                "display_name": f"{first_name} {last_name}".strip(),
                "auth_provider": "google",
                "is_verified": True
            }
        }
    finally:
        conn.close()

def verify_email_token(token: str) -> bool:
    if not token:
        return False
    conn = get_connection()
    try:
        user = conn.execute("SELECT id FROM users WHERE verification_token = ?", (token,)).fetchone()
        if not user:
            return False
        conn.execute("UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?", (user["id"],))
        conn.commit()
        return True
    finally:
        conn.close()

def resend_verification(email_or_user_id: str) -> Dict[str, Any]:
    conn = get_connection()
    try:
        user = conn.execute("SELECT * FROM users WHERE email = ? OR id = ?", (email_or_user_id.strip().lower(), email_or_user_id)).fetchone()
        if not user:
            raise ValueError("User not found")
        if user["is_verified"]:
            return {"status": "already_verified", "message": "Email is already verified"}

        new_token = secrets.token_urlsafe(24)
        conn.execute("UPDATE users SET verification_token = ? WHERE id = ?", (new_token, user["id"]))
        conn.commit()
        return {"status": "sent", "message": f"Verification link delivered to {user['email']}", "verification_token": new_token}
    finally:
        conn.close()

def register_user(first_name: str, last_name: str, email: str, password: str, avatar: str = "🍿") -> Dict[str, Any]:
    email_clean = email.strip().lower()
    if not email_clean or "@" not in email_clean:
        raise ValueError("A valid email address is required")
    if len(password) < 6:
        raise ValueError("Password must be at least 6 characters")
    if not first_name.strip():
        raise ValueError("First name is required")

    conn = get_connection()
    try:
        existing = conn.execute("SELECT id FROM users WHERE email = ?", (email_clean,)).fetchone()
        if existing:
            raise ValueError("An account with this email address already exists")

        user_id = f"user_{uuid.uuid4().hex[:12]}"
        pwd_hash, pwd_salt = hash_password(password)
        now_iso = datetime.now(timezone.utc).isoformat()
        verif_token = secrets.token_urlsafe(24)

        conn.execute("""
            INSERT INTO users (id, first_name, last_name, email, password_hash, password_salt, avatar, created_at, auth_provider, is_verified, verification_token)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'local', 0, ?)
        """, (user_id, first_name.strip(), last_name.strip(), email_clean, pwd_hash, pwd_salt, avatar or "🍿", now_iso, verif_token))

        token = secrets.token_urlsafe(32)
        conn.execute("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)", (token, user_id, now_iso))
        conn.commit()

        return {
            "token": token,
            "user": {
                "id": user_id,
                "first_name": first_name.strip(),
                "last_name": last_name.strip(),
                "email": email_clean,
                "avatar": avatar or "🍿",
                "display_name": f"{first_name.strip()} {last_name.strip()}",
                "auth_provider": "local",
                "is_verified": False,
                "verification_token": verif_token
            }
        }
    finally:
        conn.close()

def login_user(email: str, password: str) -> Dict[str, Any]:
    email_clean = email.strip().lower()
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email_clean,)).fetchone()
        if not row:
            raise ValueError("Invalid email or password")

        if not verify_password(password, row["password_salt"], row["password_hash"]):
            raise ValueError("Invalid email or password")

        token = secrets.token_urlsafe(32)
        now_iso = datetime.now(timezone.utc).isoformat()
        conn.execute("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)", (token, row["id"], now_iso))
        conn.commit()

        return {
            "token": token,
            "user": {
                "id": row["id"],
                "first_name": row["first_name"],
                "last_name": row["last_name"],
                "email": row["email"],
                "avatar": row["avatar"] or "🍿",
                "display_name": f"{row['first_name']} {row['last_name']}",
                "auth_provider": row["auth_provider"] or "local",
                "is_verified": bool(row["is_verified"])
            }
        }
    finally:
        conn.close()

def get_user_by_token(token: str) -> Optional[Dict[str, Any]]:
    if not token:
        return None
    conn = get_connection()
    try:
        session_row = conn.execute("SELECT user_id FROM sessions WHERE token = ?", (token,)).fetchone()
        if not session_row:
            return None

        user_row = conn.execute("SELECT * FROM users WHERE id = ?", (session_row["user_id"],)).fetchone()
        if not user_row:
            return None

        return {
            "id": user_row["id"],
            "first_name": user_row["first_name"],
            "last_name": user_row["last_name"],
            "email": user_row["email"],
            "avatar": user_row["avatar"] or "🍿",
            "display_name": f"{user_row['first_name']} {user_row['last_name']}",
            "auth_provider": user_row["auth_provider"] or "local",
            "is_verified": bool(user_row["is_verified"])
        }
    finally:
        conn.close()

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    try:
        user_row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user_row:
            return None
        return {
            "id": user_row["id"],
            "first_name": user_row["first_name"],
            "last_name": user_row["last_name"],
            "email": user_row["email"],
            "avatar": user_row["avatar"] or "🍿",
            "display_name": f"{user_row['first_name']} {user_row['last_name']}",
            "auth_provider": user_row["auth_provider"] or "local",
            "is_verified": bool(user_row["is_verified"])
        }
    finally:
        conn.close()

def logout_user(token: str):
    conn = get_connection()
    try:
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
        conn.commit()
    finally:
        conn.close()

# Daily Mood Management
def save_user_daily_mood(user_id: str, answers: Dict[str, str], mood_profile: Dict[str, Any], preference_vector: Dict[str, float], mood_date: Optional[str] = None) -> Dict[str, Any]:
    if not mood_date:
        mood_date = datetime.now().strftime("%Y-%m-%d")

    now_iso = datetime.now(timezone.utc).isoformat()
    conn = get_connection()
    try:
        conn.execute("""
            INSERT INTO daily_moods (user_id, mood_date, answers, mood_profile, preference_vector, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, mood_date) DO UPDATE SET
                answers = excluded.answers,
                mood_profile = excluded.mood_profile,
                preference_vector = excluded.preference_vector,
                updated_at = excluded.updated_at
        """, (
            user_id,
            mood_date,
            json.dumps(answers),
            json.dumps(mood_profile),
            json.dumps(preference_vector),
            now_iso
        ))
        conn.commit()
        return {
            "user_id": user_id,
            "mood_date": mood_date,
            "mood_profile": mood_profile,
            "preference_vector": preference_vector,
            "updated_at": now_iso
        }
    finally:
        conn.close()

def get_user_daily_mood(user_id: str, mood_date: Optional[str] = None) -> Optional[Dict[str, Any]]:
    if not mood_date:
        mood_date = datetime.now().strftime("%Y-%m-%d")
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM daily_moods WHERE user_id = ? AND mood_date = ?", (user_id, mood_date)).fetchone()
        if not row:
            # Fallback to the latest mood recorded for the user
            row = conn.execute("SELECT * FROM daily_moods WHERE user_id = ? ORDER BY mood_date DESC LIMIT 1", (user_id,)).fetchone()
            if not row:
                return None

        return {
            "mood_date": row["mood_date"],
            "answers": json.loads(row["answers"]),
            "mood_profile": json.loads(row["mood_profile"]),
            "preference_vector": json.loads(row["preference_vector"]),
            "updated_at": row["updated_at"]
        }
    finally:
        conn.close()

# Notifications Management
def create_notification(user_id: str, notif_type: str, title: str, message: str, room_code: Optional[str] = None, request_id: Optional[str] = None) -> Dict[str, Any]:
    conn = get_connection()
    try:
        notif_id = f"notif_{uuid.uuid4().hex[:12]}"
        now_iso = datetime.now(timezone.utc).isoformat()
        conn.execute("""
            INSERT INTO notifications (id, user_id, type, title, message, room_code, request_id, is_read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
        """, (notif_id, user_id, notif_type, title, message, room_code, request_id, now_iso))
        conn.commit()
        return {
            "id": notif_id,
            "user_id": user_id,
            "type": notif_type,
            "title": title,
            "message": message,
            "room_code": room_code,
            "request_id": request_id,
            "is_read": False,
            "created_at": now_iso
        }
    finally:
        conn.close()

def get_user_notifications(user_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30", (user_id,)).fetchall()
        return [
            {
                "id": r["id"],
                "user_id": r["user_id"],
                "type": r["type"],
                "title": r["title"],
                "message": r["message"],
                "room_code": r["room_code"],
                "request_id": r["request_id"],
                "is_read": bool(r["is_read"]),
                "created_at": r["created_at"]
            }
            for r in rows
        ]
    finally:
        conn.close()

def mark_notification_as_read(notif_id: str, user_id: str):
    conn = get_connection()
    try:
        conn.execute("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", (notif_id, user_id))
        conn.commit()
    finally:
        conn.close()

def mark_all_notifications_as_read(user_id: str):
    conn = get_connection()
    try:
        conn.execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", (user_id,))
        conn.commit()
    finally:
        conn.close()

# Movie Lists (Favorites & Watchlist)
def toggle_user_movie(user_id: str, movie_id: int, list_type: str) -> bool:
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT 1 FROM user_movies WHERE user_id = ? AND movie_id = ? AND list_type = ?",
            (user_id, movie_id, list_type)
        ).fetchone()

        if existing:
            conn.execute("DELETE FROM user_movies WHERE user_id = ? AND movie_id = ? AND list_type = ?", (user_id, movie_id, list_type))
            conn.commit()
            return False
        else:
            now_iso = datetime.now(timezone.utc).isoformat()
            conn.execute("INSERT INTO user_movies (user_id, movie_id, list_type, created_at) VALUES (?, ?, ?, ?)", (user_id, movie_id, list_type, now_iso))
            conn.commit()
            return True
    finally:
        conn.close()

def get_user_movie_ids(user_id: str, list_type: str) -> List[int]:
    conn = get_connection()
    try:
        rows = conn.execute("SELECT movie_id FROM user_movies WHERE user_id = ? AND list_type = ?", (user_id, list_type)).fetchall()
        return [r["movie_id"] for r in rows]
    finally:
        conn.close()

def update_user_profile(user_id: str, first_name: Optional[str] = None, last_name: Optional[str] = None, avatar: Optional[str] = None) -> Dict[str, Any]:
    conn = get_connection()
    try:
        user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            raise ValueError("User not found")

        new_first = first_name.strip() if first_name is not None and first_name.strip() else user["first_name"]
        new_last = last_name.strip() if last_name is not None else user["last_name"]
        new_avatar = avatar if avatar is not None and avatar.strip() else user["avatar"]

        conn.execute("""
            UPDATE users SET first_name = ?, last_name = ?, avatar = ? WHERE id = ?
        """, (new_first, new_last, new_avatar, user_id))
        conn.commit()

        return {
            "id": user_id,
            "first_name": new_first,
            "last_name": new_last,
            "email": user["email"],
            "avatar": new_avatar,
            "display_name": f"{new_first} {new_last}".strip()
        }
    finally:
        conn.close()

def change_user_password(user_id: str, current_password: str, new_password: str) -> bool:
    if len(new_password) < 6:
        raise ValueError("New password must be at least 6 characters")

    conn = get_connection()
    try:
        user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            raise ValueError("User not found")

        if not verify_password(current_password, user["password_salt"], user["password_hash"]):
            raise ValueError("Current password is incorrect")

        new_hash, new_salt = hash_password(new_password)
        conn.execute("UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?", (new_hash, new_salt, user_id))
        conn.commit()
        return True
    finally:
        conn.close()

