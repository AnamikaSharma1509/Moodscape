import random
import string
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from fastapi import WebSocket
from app.models.schemas import Participant, MovieItem, VoteType
from app.group_matching.matcher import group_matcher
from app import auth_service

def generate_room_code(length: int = 4) -> str:
    """Generate human-friendly room code like MOOD-7K9X."""
    chars = string.ascii_uppercase + string.digits
    suffix = "".join(random.choices(chars, k=length))
    return f"MOOD-{suffix}"

class RoomState:
    WAITING = "WAITING"
    VOTING = "VOTING"
    PROCESSING = "PROCESSING"
    RESULTS = "RESULTS"
    CLOSED = "CLOSED"

class MovieRoom:
    def __init__(
        self,
        code: str,
        name: str,
        host_id: str,
        host_name: str,
        settings: Dict[str, Any],
        access_type: str = "approval_required",
        max_participants: int = 8,
        is_discoverable: bool = True
    ):
        self.code = code
        self.name = name
        self.host_id = host_id
        self.host_name = host_name
        self.status = RoomState.WAITING
        self.settings = settings
        self.access_type = access_type # "approval_required", "public_open", "private_invite"
        self.max_participants = max_participants
        self.is_discoverable = is_discoverable
        self.round = 1
        self.participants: List[Participant] = []
        self.access_requests: List[Dict[str, Any]] = []
        self.deck: List[MovieItem] = []
        # votes: {user_id: {movie_id: "LIKE"|"DISLIKE"|"SUPERLIKE"}}
        self.votes: Dict[str, Dict[int, str]] = {}
        # active websocket connections
        self.connections: List[WebSocket] = []
        self.results: Optional[Dict[str, Any]] = None

    def to_dict(self, requester_id: Optional[str] = None) -> Dict[str, Any]:
        """Convert room state to serializable dict, maintaining vote privacy."""
        user_voting_progress = {}
        for p in self.participants:
            p_votes = self.votes.get(p.user_id, {})
            user_voting_progress[p.user_id] = {
                "display_name": p.display_name,
                "voted_count": len(p_votes),
                "has_finished": len(p_votes) >= len(self.deck) if self.deck else False
            }

        # Privacy protection: only return requester's own votes
        my_votes = self.votes.get(requester_id, {}) if requester_id else {}

        # Is the requester the host?
        is_host = requester_id == self.host_id if requester_id else False

        # Filter access requests visible to host or user's own request
        visible_requests = []
        if is_host:
            visible_requests = self.access_requests
        elif requester_id:
            visible_requests = [r for r in self.access_requests if r["user_id"] == requester_id]

        return {
            "code": self.code,
            "name": self.name,
            "host_id": self.host_id,
            "host_name": self.host_name,
            "status": self.status,
            "access_type": self.access_type,
            "max_participants": self.max_participants,
            "is_discoverable": self.is_discoverable,
            "round": self.round,
            "settings": self.settings,
            "participants": [p.model_dump() if hasattr(p, 'model_dump') else p.dict() for p in self.participants],
            "total_movies": len(self.deck),
            "deck": [m.model_dump() if hasattr(m, 'model_dump') else m.dict() for m in self.deck] if self.status in [RoomState.VOTING, RoomState.RESULTS] else [],
            "my_votes": my_votes,
            "voting_progress": user_voting_progress,
            "access_requests": visible_requests,
            "results": self.results if self.status == RoomState.RESULTS else None
        }

class RoomManager:
    def __init__(self):
        self.rooms: Dict[str, MovieRoom] = {}

    def create_room(
        self,
        name: str,
        host_name: str,
        settings: Dict[str, Any],
        host_id: Optional[str] = None,
        access_type: str = "approval_required",
        max_participants: int = 8,
        is_discoverable: bool = True,
        host_vector: Optional[Dict[str, float]] = None,
        host_mood_title: Optional[str] = None
    ) -> MovieRoom:
        code = generate_room_code()
        while code in self.rooms:
            code = generate_room_code()

        actual_host_id = host_id or f"user_{code}_host"
        room = MovieRoom(
            code=code,
            name=name,
            host_id=actual_host_id,
            host_name=host_name,
            settings=settings,
            access_type=access_type,
            max_participants=max_participants,
            is_discoverable=is_discoverable
        )

        # Add host as first participant
        host_p = Participant(
            user_id=actual_host_id,
            display_name=host_name,
            avatar="👑",
            is_ready=True,
            is_host=True,
            preference_vector=host_vector,
            mood_title=host_mood_title or "Host"
        )
        room.participants.append(host_p)
        self.rooms[code] = room
        return room

    def get_room(self, code: str) -> Optional[MovieRoom]:
        if not code:
            return None
        return self.rooms.get(code.upper())

    def get_discoverable_rooms(self) -> List[Dict[str, Any]]:
        discoverable = []
        for room in self.rooms.values():
            if room.is_discoverable and room.status in [RoomState.WAITING, RoomState.VOTING]:
                discoverable.append({
                    "code": room.code,
                    "name": room.name,
                    "host_id": room.host_id,
                    "host_name": room.host_name,
                    "participant_count": len(room.participants),
                    "max_participants": room.max_participants,
                    "status": room.status,
                    "access_type": room.access_type,
                    "movie_count": room.settings.get("movie_count", 15),
                    "category": room.settings.get("category", "All"),
                    "min_rating": room.settings.get("min_rating", 6.0)
                })
        return discoverable

    def request_access(
        self,
        code: str,
        user_id: str,
        display_name: str,
        avatar: str = "🍿",
        vector: Optional[Dict[str, float]] = None,
        mood_title: Optional[str] = None
    ) -> Dict[str, Any]:
        room = self.get_room(code)
        if not room:
            raise ValueError("Room not found")

        # Check if already a participant
        if any(p.user_id == user_id for p in room.participants):
            return {"status": "ALREADY_PARTICIPANT", "message": "You are already a member of this room."}

        # Check capacity
        if len(room.participants) >= room.max_participants:
            raise ValueError("Room has reached maximum capacity")

        # Direct join if public open
        if room.access_type == "public_open":
            p = self.join_room(code, display_name, user_id=user_id, avatar=avatar, vector=vector, mood_title=mood_title)
            # Notify host that someone joined
            auth_service.create_notification(
                user_id=room.host_id,
                notif_type="ROOM_JOINED",
                title="New Member Joined",
                message=f"{display_name} joined your room {room.name}.",
                room_code=room.code
            )
            return {"status": "JOINED", "participant": p.model_dump() if hasattr(p, 'model_dump') else p.dict()}

        # Check if pending request exists
        existing_req = next((r for r in room.access_requests if r["user_id"] == user_id and r["status"] == "PENDING"), None)
        if existing_req:
            return {"status": "PENDING", "request": existing_req, "message": "Access request already submitted."}

        request_id = f"req_{uuid.uuid4().hex[:10]}"
        now_iso = datetime.now(timezone.utc).isoformat()
        req_entry = {
            "request_id": request_id,
            "user_id": user_id,
            "display_name": display_name,
            "avatar": avatar,
            "preference_vector": vector,
            "mood_title": mood_title,
            "status": "PENDING",
            "requested_at": now_iso
        }
        room.access_requests.append(req_entry)

        # Create real notification for host
        auth_service.create_notification(
            user_id=room.host_id,
            notif_type="ROOM_ACCESS_REQUEST",
            title="Join Request",
            message=f"{display_name} requested to join {room.name}.",
            room_code=room.code,
            request_id=request_id
        )

        return {"status": "PENDING", "request": req_entry, "message": "Request submitted to host."}

    def approve_request(self, code: str, host_id: str, request_id: str) -> bool:
        room = self.get_room(code)
        if not room or room.host_id != host_id:
            raise PermissionError("Only host can approve access requests")

        req = next((r for r in room.access_requests if r["request_id"] == request_id), None)
        if not req or req["status"] != "PENDING":
            return False

        if len(room.participants) >= room.max_participants:
            raise ValueError("Room is at maximum capacity")

        req["status"] = "APPROVED"

        # Add participant
        if not any(p.user_id == req["user_id"] for p in room.participants):
            p = Participant(
                user_id=req["user_id"],
                display_name=req["display_name"],
                avatar=req["avatar"],
                is_ready=False,
                is_host=False,
                preference_vector=req.get("preference_vector"),
                mood_title=req.get("mood_title") or "Movie Lover"
            )
            room.participants.append(p)

        # Notify the user of approval
        auth_service.create_notification(
            user_id=req["user_id"],
            notif_type="ROOM_ACCESS_APPROVED",
            title="Access Approved",
            message=f"You were approved to join {room.name}! Head over to the lobby.",
            room_code=room.code
        )
        return True

    def deny_request(self, code: str, host_id: str, request_id: str) -> bool:
        room = self.get_room(code)
        if not room or room.host_id != host_id:
            raise PermissionError("Only host can deny access requests")

        req = next((r for r in room.access_requests if r["request_id"] == request_id), None)
        if not req or req["status"] != "PENDING":
            return False

        req["status"] = "DENIED"

        # Notify user
        auth_service.create_notification(
            user_id=req["user_id"],
            notif_type="ROOM_ACCESS_DENIED",
            title="Access Denied",
            message=f"Your request to join {room.name} was declined.",
            room_code=room.code
        )
        return True

    def join_room(
        self,
        code: str,
        display_name: str,
        user_id: Optional[str] = None,
        avatar: str = "🍿",
        vector: Optional[Dict[str, float]] = None,
        mood_title: Optional[str] = None
    ) -> Optional[Participant]:
        room = self.get_room(code)
        if not room:
            return None

        actual_user_id = user_id or f"user_{code}_{len(room.participants) + 1}"

        # If already in room, update details and return
        for p in room.participants:
            if p.user_id == actual_user_id:
                p.display_name = display_name
                p.avatar = avatar
                if vector:
                    p.preference_vector = vector
                if mood_title:
                    p.mood_title = mood_title
                return p

        participant = Participant(
            user_id=actual_user_id,
            display_name=display_name,
            avatar=avatar,
            is_ready=False,
            is_host=False,
            preference_vector=vector,
            mood_title=mood_title or "Movie Lover"
        )
        room.participants.append(participant)
        return participant

    def start_room(self, code: str) -> bool:
        room = self.get_room(code)
        if not room:
            return False

        # Generate candidates based on group preference profiles
        movie_count = room.settings.get("movie_count", 20)
        deck = group_matcher.generate_candidate_pool(
            participants=room.participants,
            movie_count=movie_count,
            min_rating=room.settings.get("min_rating", 6.0)
        )
        room.deck = deck
        room.status = RoomState.VOTING
        room.votes = {p.user_id: {} for p in room.participants}
        return True

    def start_second_round(self, code: str, host_id: str) -> bool:
        room = self.get_room(code)
        if not room or room.host_id != host_id:
            raise PermissionError("Only host can start a second round")

        if not room.results:
            return False

        # Pick top 4 to 6 candidate movies from round 1
        shortlist = room.results.get("best_matches", [])[:5]
        if not shortlist and room.deck:
            shortlist = room.deck[:5]

        room.round = 2
        room.deck = shortlist
        room.status = RoomState.VOTING
        room.votes = {p.user_id: {} for p in room.participants}
        room.results = None

        # Notify participants that Round 2 has started
        for p in room.participants:
            auth_service.create_notification(
                user_id=p.user_id,
                notif_type="ROOM_STARTED",
                title="Round 2 Started!",
                message=f"Host launched Round 2 in {room.name}! Swipe on the shortlisted finals.",
                room_code=room.code
            )
        return True

    def submit_vote(self, code: str, user_id: str, movie_id: int, vote: VoteType) -> bool:
        room = self.get_room(code)
        if not room or room.status != RoomState.VOTING:
            return False

        # Verify user is participant
        if not any(p.user_id == user_id for p in room.participants):
            return False

        if user_id not in room.votes:
            room.votes[user_id] = {}

        room.votes[user_id][movie_id] = vote.value

        # Check if all participants finished voting
        all_finished = True
        for p in room.participants:
            if len(room.votes.get(p.user_id, {})) < len(room.deck):
                all_finished = False
                break

        if all_finished and len(room.deck) > 0:
            room.status = RoomState.RESULTS
            room.results = group_matcher.finalize_group_results(
                participants=room.participants,
                deck_movies=room.deck,
                votes=room.votes
            )

            # Notify all members that results are ready
            for p in room.participants:
                auth_service.create_notification(
                    user_id=p.user_id,
                    notif_type="SESSION_RESULTS",
                    title="Movie Match Decided!",
                    message=f"Results are ready for {room.name}! See what the group picked.",
                    room_code=room.code
                )

        return True

    def create_demo_room(self) -> MovieRoom:
        """Create fully populated 4-person demo room for recruiter presentations."""
        code = "MOOD-DEMO"
        settings = {"movie_count": 8, "min_rating": 7.0}
        room = MovieRoom(
            code=code,
            name="Friday Movie Night",
            host_id="user_demo_1",
            host_name="Anamika",
            settings=settings,
            access_type="approval_required",
            max_participants=8,
            is_discoverable=True
        )

        p1 = Participant(
            user_id="user_demo_1",
            display_name="Anamika",
            avatar="👩‍💻",
            is_ready=True,
            is_host=True,
            preference_vector={"thriller": 1.0, "mystery": 0.9, "detective": 0.9, "action": 0.6},
            mood_title="The Curious Thrill-Seeker"
        )
        p2 = Participant(
            user_id="user_demo_2",
            display_name="Shreya",
            avatar="✨",
            is_ready=True,
            is_host=False,
            preference_vector={"romance": 1.0, "comedy": 0.9, "feelGood": 0.9, "drama": 0.4},
            mood_title="The Feel-Good Romantic"
        )
        p3 = Participant(
            user_id="user_demo_3",
            display_name="Rahul",
            avatar="🍿",
            is_ready=True,
            is_host=False,
            preference_vector={"action": 1.0, "thriller": 0.8, "adventure": 0.8, "mystery": 0.5},
            mood_title="The Action Junkie"
        )
        p4 = Participant(
            user_id="user_demo_4",
            display_name="Priya",
            avatar="🎨",
            is_ready=True,
            is_host=False,
            preference_vector={"comedy": 0.9, "drama": 0.9, "emotional": 0.8, "sliceOfLife": 0.7},
            mood_title="The Emotional Soul"
        )
        room.participants = [p1, p2, p3, p4]

        deck = group_matcher.generate_candidate_pool(
            participants=room.participants,
            movie_count=8,
            min_rating=7.0
        )
        room.deck = deck
        room.status = RoomState.RESULTS

        sim_votes: Dict[str, Dict[int, str]] = {
            p1.user_id: {},
            p2.user_id: {},
            p3.user_id: {},
            p4.user_id: {}
        }

        for m in deck:
            genres_lower = [g.lower() for g in m.genres]
            sim_votes[p1.user_id][m.id] = VoteType.SUPERLIKE.value if ("mystery" in genres_lower or "thriller" in genres_lower) else VoteType.LIKE.value
            sim_votes[p2.user_id][m.id] = VoteType.LIKE.value if ("comedy" in genres_lower or "drama" in genres_lower or m.title == "Knives Out") else VoteType.DISLIKE.value
            sim_votes[p3.user_id][m.id] = VoteType.LIKE.value if ("action" in genres_lower or "thriller" in genres_lower or m.title == "Knives Out") else VoteType.DISLIKE.value
            sim_votes[p4.user_id][m.id] = VoteType.LIKE.value if ("comedy" in genres_lower or "drama" in genres_lower or m.title == "Knives Out") else VoteType.DISLIKE.value

        room.votes = sim_votes
        room.results = group_matcher.finalize_group_results(
            participants=room.participants,
            deck_movies=room.deck,
            votes=room.votes
        )

        self.rooms[code] = room
        return room

room_manager = RoomManager()
room_manager.create_demo_room()
