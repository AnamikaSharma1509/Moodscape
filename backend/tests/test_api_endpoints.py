import pytest
import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["dataset_size"] > 0
    assert data["tfidf_ready"] is True

def test_quiz_questions_endpoint():
    res = client.get("/api/quiz-questions")
    assert res.status_code == 200
    data = res.json()
    assert len(data["questions"]) == 7

def test_recommendation_endpoint():
    answers = {
        "q1": "A",
        "q2": "A",
        "q3": "B",
        "q4": "A",
        "q5": "A",
        "q6": "B",
        "q7": "B"
    }
    res = client.post("/api/recommend", json={"answers": answers, "limit": 10})
    assert res.status_code == 200
    data = res.json()
    assert "profile" in data
    assert len(data["top_picks"]) > 0
    assert "hollywood_picks" in data
    assert "bollywood_picks" in data
    assert "vintage_picks" in data
    assert "hidden_gems" in data

def test_multi_user_auth_isolation():
    # User 1
    email1 = f"user1_{os.urandom(4).hex()}@example.com"
    res1 = client.post("/api/auth/register", json={
        "first_name": "Alice",
        "last_name": "Smith",
        "email": email1,
        "password": "password123",
        "avatar": "🍿"
    })
    assert res1.status_code == 200
    token1 = res1.json()["token"]
    user1_id = res1.json()["user"]["id"]

    # User 2
    email2 = f"user2_{os.urandom(4).hex()}@example.com"
    res2 = client.post("/api/auth/register", json={
        "first_name": "Bob",
        "last_name": "Jones",
        "email": email2,
        "password": "password456",
        "avatar": "👩‍💻"
    })
    assert res2.status_code == 200
    token2 = res2.json()["token"]
    user2_id = res2.json()["user"]["id"]

    assert user1_id != user2_id

    # Verify session isolation
    me1 = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token1}"}).json()
    me2 = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token2}"}).json()
    assert me1["email"] == email1
    assert me2["email"] == email2

def test_room_lifecycle_and_access_approval():
    # Create room
    create_res = client.post("/api/rooms", json={
        "room_name": "Weekend Cinema Party",
        "host_name": "HostCharlie",
        "host_id": "host_charlie_1",
        "movie_count": 8,
        "access_type": "approval_required",
        "max_participants": 5,
        "is_discoverable": True
    })
    assert create_res.status_code == 200
    room_code = create_res.json()["room_code"]

    # Check room appears in discoverable rooms
    disc_res = client.get("/api/rooms")
    assert disc_res.status_code == 200
    rooms = disc_res.json()["rooms"]
    assert any(r["code"] == room_code for r in rooms)

    # Guest requests access
    req_res = client.post(f"/api/rooms/{room_code}/request-access", json={
        "user_id": "guest_dave_2",
        "display_name": "Dave",
        "avatar": "✨"
    })
    assert req_res.status_code == 200
    assert req_res.json()["status"] == "PENDING"
    request_id = req_res.json()["request"]["request_id"]

    # Host approves
    app_res = client.post(f"/api/rooms/{room_code}/approve-access", json={
        "host_id": "host_charlie_1",
        "request_id": request_id
    })
    assert app_res.status_code == 200

    # Verify member is now participant
    room_details = client.get(f"/api/rooms/{room_code}").json()
    participant_ids = [p["user_id"] for p in room_details["participants"]]
    assert "guest_dave_2" in participant_ids
