import pytest
import sys
import os
import secrets

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.rooms.manager import room_manager, RoomState
from app import auth_service

def test_user_registration_and_login():
    email = f"test_{auth_service.secrets.token_hex(4)}@example.com"
    pwd = "securepassword123"

    reg = auth_service.register_user("Anamika", "Sharma", email, pwd, avatar="👩‍💻")
    assert reg["token"] is not None
    assert reg["user"]["email"] == email
    assert reg["user"]["first_name"] == "Anamika"

    # Login
    login_res = auth_service.login_user(email, pwd)
    assert login_res["token"] is not None
    assert login_res["user"]["id"] == reg["user"]["id"]

    # Verify session
    user_me = auth_service.get_user_by_token(login_res["token"])
    assert user_me["id"] == reg["user"]["id"]

def test_daily_mood_persistence():
    user_id = f"user_{auth_service.secrets.token_hex(4)}"
    answers = {"q1": "A", "q2": "B", "q3": "A", "q4": "B", "q5": "A", "q6": "B", "q7": "A"}
    profile = {"profile_title": "The Curious Detective", "description": "Loved mysteries"}
    vec = {"mystery": 1.0, "thriller": 0.8}

    saved = auth_service.save_user_daily_mood(user_id, answers, profile, vec, "2026-10-11")
    assert saved["mood_date"] == "2026-10-11"

    retrieved = auth_service.get_user_daily_mood(user_id, "2026-10-11")
    assert retrieved is not None
    assert retrieved["mood_profile"]["profile_title"] == "The Curious Detective"
    assert retrieved["answers"]["q1"] == "A"

def test_room_discovery_and_access_request():
    room = room_manager.create_room(
        name="Saturday Chill",
        host_name="HostUser",
        settings={"movie_count": 10},
        host_id="user_host_99",
        access_type="approval_required",
        max_participants=4,
        is_discoverable=True
    )
    assert room.code in room_manager.rooms

    # Check discoverable
    discoverable = room_manager.get_discoverable_rooms()
    assert any(r["code"] == room.code for r in discoverable)

    # User requests access
    guest_id = "user_guest_1"
    req_res = room_manager.request_access(room.code, guest_id, "GuestOne", avatar="🍿")
    assert req_res["status"] == "PENDING"
    req_id = req_res["request"]["request_id"]

    # Host checks notifications
    notifs = auth_service.get_user_notifications("user_host_99")
    assert any(n["type"] == "ROOM_ACCESS_REQUEST" for n in notifs)

    # Host approves
    approved = room_manager.approve_request(room.code, "user_host_99", req_id)
    assert approved is True
    assert any(p.user_id == guest_id for p in room.participants)

    # Guest receives approval notification
    guest_notifs = auth_service.get_user_notifications(guest_id)
    assert any(n["type"] == "ROOM_ACCESS_APPROVED" for n in guest_notifs)

def test_profile_update_and_password_change():
    # Register test user
    email = f"profile_test_{secrets.token_hex(4)}@moodscape.test"
    reg = auth_service.register_user("Initial", "User", email, "secret123", "🍿")
    user_id = reg["user"]["id"]

    # Update profile
    updated = auth_service.update_user_profile(user_id, first_name="Updated", last_name="Member", avatar="👩‍💻")
    assert updated["first_name"] == "Updated"
    assert updated["last_name"] == "Member"
    assert updated["avatar"] == "👩‍💻"
    assert updated["display_name"] == "Updated Member"

    # Change password
    assert auth_service.change_user_password(user_id, "secret123", "newsecurepass") is True

    # Login with new password should succeed
    login_res = auth_service.login_user(email, "newsecurepass")
    assert login_res["user"]["id"] == user_id

