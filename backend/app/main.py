from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Query, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any

from app.config import settings
from app.models.schemas import (
    QuizAnswers,
    MoodProfileResponse,
    RecommendRequest,
    RecommendResponse,
    MovieItem,
    GroupCandidateRequest,
    GroupScoreRequest,
    GroupScoreResponse,
    CreateRoomRequest,
    JoinRoomRequest,
    SubmitVoteRequest,
    VoteType,
    RegisterRequest,
    LoginRequest,
    GoogleAuthRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
    AuthResponse,
    DailyMoodRequest,
    RequestAccessPayload,
    ActionRequestPayload,
    ToggleMovieRequest,
    UpdateProfileRequest,
    ChangePasswordRequest
)
from app.recommender.mood_mapper import QUIZ_QUESTIONS, generate_mood_profile
from app.recommender.engine import recommender
from app.group_matching.matcher import group_matcher
from app.rooms.manager import room_manager, RoomState
from app import auth_service

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Mood-Based Movie Discovery & Collaborative Social Match Engine"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "app": "MoodScape API",
        "tagline": "Your Mood. Your Movie. Your People.",
        "status": "healthy",
        "movies_loaded": len(recommender.movies),
        "version": settings.VERSION
    }

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "dataset_size": len(recommender.movies),
        "tfidf_ready": recommender.movie_tfidf_matrix is not None
    }

# ----------------- AUTHENTICATION & SESSIONS -----------------

@app.post("/api/auth/register", response_model=AuthResponse)
def register(payload: RegisterRequest):
    try:
        res = auth_service.register_user(
            first_name=payload.first_name,
            last_name=payload.last_name,
            email=payload.email,
            password=payload.password,
            avatar=payload.avatar or "🍿"
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    try:
        res = auth_service.login_user(
            email=payload.email,
            password=payload.password
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.post("/api/auth/google", response_model=AuthResponse)
def google_sign_in(payload: GoogleAuthRequest):
    try:
        res = auth_service.google_auth_user(payload.credential)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google authentication failed: {str(e)}")

@app.post("/api/auth/verify-email")
def verify_email(payload: VerifyEmailRequest):
    success = auth_service.verify_email_token(payload.token)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
    return {"status": "success", "message": "Email verified successfully"}

@app.post("/api/auth/resend-verification")
def resend_verification_endpoint(payload: ResendVerificationRequest):
    try:
        res = auth_service.resend_verification(payload.email_or_user_id)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/auth/me")
def get_current_user(authorization: Optional[str] = Header(None)):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]

    if not token:
        raise HTTPException(status_code=401, detail="Authentication token required")

    user = auth_service.get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return user

@app.post("/api/auth/logout")
def logout(authorization: Optional[str] = Header(None)):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    if token:
        auth_service.logout_user(token)
    return {"message": "Logged out successfully"}

@app.put("/api/auth/profile")
def update_profile(payload: UpdateProfileRequest):
    try:
        user = auth_service.update_user_profile(
            user_id=payload.user_id,
            first_name=payload.first_name,
            last_name=payload.last_name,
            avatar=payload.avatar
        )
        return {"user": user, "message": "Profile updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/change-password")
def change_password(payload: ChangePasswordRequest):
    try:
        auth_service.change_user_password(
            user_id=payload.user_id,
            current_password=payload.current_password,
            new_password=payload.new_password
        )
        return {"message": "Password changed successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ----------------- DAILY MOOD PERSISTENCE -----------------

@app.post("/api/user/daily-mood")
def save_daily_mood(payload: DailyMoodRequest):
    return auth_service.save_user_daily_mood(
        user_id=payload.user_id,
        answers=payload.answers,
        mood_profile=payload.mood_profile,
        preference_vector=payload.preference_vector,
        mood_date=payload.mood_date
    )

@app.get("/api/user/daily-mood")
def get_daily_mood(user_id: str, mood_date: Optional[str] = None):
    mood = auth_service.get_user_daily_mood(user_id, mood_date)
    return {"daily_mood": mood}

# ----------------- NOTIFICATIONS -----------------

@app.get("/api/notifications")
def get_notifications(user_id: str):
    return {"notifications": auth_service.get_user_notifications(user_id)}

@app.post("/api/notifications/{notif_id}/read")
def read_notification(notif_id: str, user_id: str):
    auth_service.mark_notification_as_read(notif_id, user_id)
    return {"success": True}

@app.post("/api/notifications/read-all")
def read_all_notifications(user_id: str):
    auth_service.mark_all_notifications_as_read(user_id)
    return {"success": True}

# ----------------- USER MOVIE LISTS -----------------

@app.post("/api/user/movies/toggle")
def toggle_movie(payload: ToggleMovieRequest):
    is_saved = auth_service.toggle_user_movie(payload.user_id, payload.movie_id, payload.list_type)
    return {"movie_id": payload.movie_id, "list_type": payload.list_type, "is_saved": is_saved}

@app.get("/api/user/movies")
def get_user_movie_ids(user_id: str, list_type: str = "favorite"):
    ids = auth_service.get_user_movie_ids(user_id, list_type)
    return {"movie_ids": ids}

# ----------------- SOLO QUIZ & RECOMMENDER -----------------

@app.get("/api/quiz-questions")
def get_quiz_questions():
    """Retrieve the 7 interactive mood quiz questions."""
    return {"questions": QUIZ_QUESTIONS}

@app.post("/api/mood-profile", response_model=MoodProfileResponse)
def analyze_mood_profile(payload: QuizAnswers):
    """Calculate mood archetype and normalized preference vector from 7 answers."""
    answers_dict = {
        "q1": payload.q1 or "A",
        "q2": payload.q2 or "A",
        "q3": payload.q3 or "A",
        "q4": payload.q4 or "A",
        "q5": payload.q5 or "A",
        "q6": payload.q6 or "A",
        "q7": payload.q7 or "A",
    }
    return generate_mood_profile(answers_dict)

@app.post("/api/recommend", response_model=RecommendResponse)
def get_recommendations(payload: RecommendRequest):
    """ML recommendation engine calculating hybrid content, genre, mood, and quality scores."""
    return recommender.get_recommendations(
        answers=payload.answers,
        pref_vector=payload.preference_vector,
        category_filter=payload.category_filter,
        limit=payload.limit or 12
    )

# ----------------- MOVIES CATALOG & SEARCH -----------------

@app.get("/api/movies")
def get_movies(
    category: Optional[str] = None,
    genre: Optional[str] = None,
    mood: Optional[str] = None,
    min_rating: Optional[float] = None,
    streaming: Optional[str] = None,
    limit: int = 50
):
    results = recommender.movies
    if category and category.lower() != "all":
        results = [m for m in results if m.get("category", "").lower() == category.lower()]
    if genre and genre.lower() != "all":
        results = [m for m in results if any(g.lower() == genre.lower() for g in m.get("genres", []))]
    if mood and mood.lower() != "all":
        results = [m for m in results if any(mood.lower() in t.lower() for t in m.get("mood_tags", []))]
    if min_rating:
        results = [m for m in results if m.get("rating", 0) >= min_rating]
    if streaming:
        results = [m for m in results if any(streaming.lower() in p.lower() for p in m.get("streaming_providers", []))]

    return {"count": len(results), "movies": results[:limit]}

@app.get("/api/movies/{movie_id}")
def get_movie_by_id(movie_id: int):
    movie = next((m for m in recommender.movies if m["id"] == movie_id), None)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie

@app.get("/api/search")
def search_movies(q: str = Query(..., min_length=1)):
    q_lower = q.lower()
    matches = []
    for m in recommender.movies:
        title_match = q_lower in m["title"].lower()
        director_match = q_lower in m.get("director", "").lower()
        cast_match = any(q_lower in actor.lower() for actor in m.get("cast", []))
        genre_match = any(q_lower in g.lower() for g in m.get("genres", []))

        if title_match or director_match or cast_match or genre_match:
            matches.append(m)

    return {"query": q, "count": len(matches), "results": matches[:20]}

@app.get("/api/watch-providers/{movie_id}")
def get_watch_providers(movie_id: int):
    movie = next((m for m in recommender.movies if m["id"] == movie_id), None)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return {
        "movie_id": movie_id,
        "title": movie["title"],
        "region": settings.DEFAULT_REGION,
        "providers": movie.get("streaming_providers", ["Netflix", "Amazon Prime Video"])
    }

# ----------------- GROUP CANDIDATE & MATCHING -----------------

@app.post("/api/group/candidates", response_model=List[MovieItem])
def get_group_candidates(payload: GroupCandidateRequest):
    return group_matcher.generate_candidate_pool(
        participants=payload.participants,
        movie_count=payload.movie_count,
        languages=payload.languages,
        genres=payload.genres,
        min_rating=payload.min_rating
    )

@app.post("/api/group/score", response_model=GroupScoreResponse)
def calculate_group_score(payload: GroupScoreRequest):
    movie = next((m for m in recommender.movies if m["id"] == payload.movie_id), None)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    movie_idx = recommender.movies.index(movie)
    return group_matcher.calculate_group_movie_score(movie, movie_idx, payload.participants)

# ----------------- REAL-TIME COLLABORATIVE ROOMS -----------------

@app.get("/api/rooms")
def list_discoverable_rooms():
    """List public active rooms open for discovery."""
    return {"rooms": room_manager.get_discoverable_rooms()}

@app.post("/api/rooms")
def create_room(payload: CreateRoomRequest):
    settings_dict = {
        "movie_count": payload.movie_count,
        "category": payload.category,
        "min_rating": payload.min_rating
    }
    room = room_manager.create_room(
        name=payload.room_name,
        host_name=payload.host_name,
        settings=settings_dict,
        host_id=payload.host_id,
        access_type=payload.access_type or "approval_required",
        max_participants=payload.max_participants or 8,
        is_discoverable=payload.is_discoverable if payload.is_discoverable is not None else True,
        host_vector=payload.host_preference_vector,
        host_mood_title=payload.host_mood_title
    )
    return {
        "room_code": room.code,
        "room": room.to_dict(requester_id=room.host_id)
    }

@app.get("/api/rooms/{code}")
def get_room_details(code: str, user_id: Optional[str] = None):
    room = room_manager.get_room(code)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found or expired")
    return room.to_dict(requester_id=user_id)

@app.post("/api/rooms/{code}/request-access")
def request_room_access(code: str, payload: RequestAccessPayload):
    try:
        res = room_manager.request_access(
            code=code,
            user_id=payload.user_id,
            display_name=payload.display_name,
            avatar=payload.avatar or "🍿",
            vector=payload.preference_vector,
            mood_title=payload.mood_title
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/rooms/{code}/approve-access")
def approve_room_access(code: str, payload: ActionRequestPayload):
    try:
        success = room_manager.approve_request(
            code=code,
            host_id=payload.host_id,
            request_id=payload.request_id
        )
        if not success:
            raise HTTPException(status_code=400, detail="Failed to approve request or request not found")
        room = room_manager.get_room(code)
        return {"success": True, "room": room.to_dict(requester_id=payload.host_id)}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/rooms/{code}/deny-access")
def deny_room_access(code: str, payload: ActionRequestPayload):
    try:
        success = room_manager.deny_request(
            code=code,
            host_id=payload.host_id,
            request_id=payload.request_id
        )
        if not success:
            raise HTTPException(status_code=400, detail="Failed to deny request or request not found")
        room = room_manager.get_room(code)
        return {"success": True, "room": room.to_dict(requester_id=payload.host_id)}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

@app.post("/api/rooms/{code}/join")
def join_room(code: str, payload: JoinRoomRequest):
    room = room_manager.get_room(code)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    participant = room_manager.join_room(
        code=code,
        display_name=payload.display_name,
        user_id=payload.user_id,
        avatar=payload.avatar or "🍿",
        vector=payload.preference_vector,
        mood_title=payload.mood_title
    )
    return {
        "joined": True,
        "participant": participant.model_dump() if hasattr(participant, 'model_dump') else participant.dict(),
        "room": room.to_dict(requester_id=participant.user_id)
    }

@app.post("/api/rooms/{code}/ready")
def toggle_ready(code: str, user_id: str):
    room = room_manager.get_room(code)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    for p in room.participants:
        if p.user_id == user_id:
            p.is_ready = not p.is_ready
            break

    return room.to_dict(requester_id=user_id)

@app.post("/api/rooms/{code}/start")
def start_room_session(code: str, host_id: str):
    room = room_manager.get_room(code)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room.host_id != host_id:
        raise HTTPException(status_code=403, detail="Only host can start the room session")

    success = room_manager.start_room(code)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to start room")

    return room.to_dict(requester_id=host_id)

@app.post("/api/rooms/{code}/round2")
def start_round_two(code: str, host_id: str):
    try:
        success = room_manager.start_second_round(code=code, host_id=host_id)
        if not success:
            raise HTTPException(status_code=400, detail="Cannot start second round")
        room = room_manager.get_room(code)
        return {"success": True, "room": room.to_dict(requester_id=host_id)}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

@app.post("/api/rooms/{code}/vote")
def submit_vote(code: str, payload: SubmitVoteRequest):
    room = room_manager.get_room(code)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    success = room_manager.submit_vote(
        code=code,
        user_id=payload.user_id,
        movie_id=payload.movie_id,
        vote=payload.vote
    )
    if not success:
        raise HTTPException(status_code=400, detail="Voting failed or session closed")

    return room.to_dict(requester_id=payload.user_id)

@app.post("/api/rooms/demo")
def get_demo_room():
    """Endpoint for instant recruiter demo room."""
    demo_room = room_manager.create_demo_room()
    return demo_room.to_dict(requester_id="user_demo_1")

# WebSocket for live multi-user room presence and voting
@app.websocket("/ws/rooms/{code}")
async def websocket_room_endpoint(websocket: WebSocket, code: str):
    await websocket.accept()
    room = room_manager.get_room(code)
    if not room:
        await websocket.close(code=1000, reason="Room not found")
        return

    room.connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("action")
            user_id = data.get("user_id")

            if action == "PING":
                await websocket.send_json({"type": "PONG"})
            elif action == "GET_STATE":
                await websocket.send_json({"type": "ROOM_UPDATE", "room": room.to_dict(requester_id=user_id)})
    except WebSocketDisconnect:
        if websocket in room.connections:
            room.connections.remove(websocket)
