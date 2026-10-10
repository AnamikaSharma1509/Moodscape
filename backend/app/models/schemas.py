from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from enum import Enum

class VoteType(str, Enum):
    DISLIKE = "DISLIKE"
    LIKE = "LIKE"
    SUPERLIKE = "SUPERLIKE"

class QuizAnswers(BaseModel):
    q1: Optional[str] = "A" # "A" or "B"
    q2: Optional[str] = "A"
    q3: Optional[str] = "A"
    q4: Optional[str] = "A"
    q5: Optional[str] = "A"
    q6: Optional[str] = "A"
    q7: Optional[str] = "A"

class MoodProfileResponse(BaseModel):
    profile_title: str
    tagline: str
    description: str
    primary_genres: List[str]
    secondary_genres: List[str]
    energy_level: str
    emotional_tone: str
    preference_vector: Dict[str, float]

class MovieItem(BaseModel):
    id: int
    title: str
    year: int
    genres: List[str]
    overview: str
    rating: float
    vote_count: int
    popularity: float
    runtime: int
    director: str
    cast: List[str]
    poster_path: str
    backdrop_path: Optional[str] = None
    mood_tags: List[str]
    category: str # "Hollywood", "Bollywood", "Vintage", "Hidden Gem", "International"
    streaming_providers: List[str] = []
    language: str = "en"
    match_score: Optional[int] = None
    explanation: Optional[Dict[str, Any]] = None

class RecommendRequest(BaseModel):
    answers: Optional[Dict[str, str]] = None
    preference_vector: Optional[Dict[str, float]] = None
    category_filter: Optional[str] = None
    limit: Optional[int] = 12

class RecommendResponse(BaseModel):
    profile: Optional[MoodProfileResponse] = None
    top_picks: List[MovieItem]
    hollywood_picks: List[MovieItem]
    bollywood_picks: List[MovieItem]
    vintage_picks: List[MovieItem]
    hidden_gems: List[MovieItem]
    wildcard_pick: Optional[MovieItem] = None

class Participant(BaseModel):
    user_id: str
    display_name: str
    avatar: str
    is_ready: bool = False
    is_host: bool = False
    preference_vector: Optional[Dict[str, float]] = None
    mood_title: Optional[str] = None

class GroupCandidateRequest(BaseModel):
    participants: List[Participant]
    movie_count: int = 15
    languages: Optional[List[str]] = None
    genres: Optional[List[str]] = None
    min_rating: Optional[float] = 6.0

class GroupScoreRequest(BaseModel):
    movie_id: int
    participants: List[Participant]
    votes: Optional[Dict[str, str]] = None

class GroupScoreResponse(BaseModel):
    movie_id: int
    average_compatibility: float
    minimum_compatibility: float
    consensus: float
    group_score: float
    individual_matches: Dict[str, float]
    consensus_reasons: List[str]

class CreateRoomRequest(BaseModel):
    room_name: str
    host_name: str
    host_id: Optional[str] = None
    movie_count: int = 15
    category: Optional[str] = "All"
    languages: Optional[List[str]] = None
    genres: Optional[List[str]] = None
    min_rating: Optional[float] = 6.0
    access_type: Optional[str] = "approval_required"
    max_participants: Optional[int] = 8
    is_discoverable: Optional[bool] = True
    host_preference_vector: Optional[Dict[str, float]] = None
    host_mood_title: Optional[str] = None

class JoinRoomRequest(BaseModel):
    room_code: str
    display_name: str
    user_id: Optional[str] = None
    avatar: Optional[str] = "🍿"
    preference_vector: Optional[Dict[str, float]] = None
    mood_title: Optional[str] = None

class RequestAccessPayload(BaseModel):
    user_id: str
    display_name: str
    avatar: Optional[str] = "🍿"
    preference_vector: Optional[Dict[str, float]] = None
    mood_title: Optional[str] = None

class ActionRequestPayload(BaseModel):
    host_id: str
    request_id: str

class SubmitVoteRequest(BaseModel):
    user_id: str
    movie_id: int
    vote: VoteType

# Authentication & User Schemas
class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    avatar: Optional[str] = "🍿"

class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    credential: str

class VerifyEmailRequest(BaseModel):
    token: str

class ResendVerificationRequest(BaseModel):
    email_or_user_id: str

class UserProfile(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    avatar: str
    display_name: str
    auth_provider: Optional[str] = "local"
    is_verified: Optional[bool] = False
    verification_token: Optional[str] = None

class AuthResponse(BaseModel):
    token: str
    user: UserProfile

class DailyMoodRequest(BaseModel):
    user_id: str
    answers: Dict[str, str]
    mood_profile: Dict[str, Any]
    preference_vector: Dict[str, float]
    mood_date: Optional[str] = None

class ToggleMovieRequest(BaseModel):
    user_id: str
    movie_id: int
    list_type: str # "favorite" or "watchlist"

class UpdateProfileRequest(BaseModel):
    user_id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    user_id: str
    current_password: str
    new_password: str

