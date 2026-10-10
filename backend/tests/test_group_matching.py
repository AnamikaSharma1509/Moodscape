import unittest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.schemas import Participant, VoteType
from app.group_matching.matcher import group_matcher
from app.rooms.manager import room_manager

class TestGroupMatching(unittest.TestCase):
    def test_group_candidate_generation(self):
        p1 = Participant(
            user_id="u1",
            display_name="User 1",
            avatar="🍿",
            preference_vector={"action": 1.0, "thriller": 0.9}
        )
        p2 = Participant(
            user_id="u2",
            display_name="User 2",
            avatar="✨",
            preference_vector={"mystery": 1.0, "thriller": 0.9}
        )
        candidates = group_matcher.generate_candidate_pool(
            participants=[p1, p2],
            movie_count=5
        )
        self.assertEqual(len(candidates), 5)
        self.assertIsNotNone(candidates[0].match_score)

    def test_neutral_genre_diversity_pool(self):
        # Test that group pool produces at least 20 diverse movies with varied genres
        host = Participant(
            user_id="host_yash",
            display_name="Yash",
            avatar="🍿",
            is_host=True
        )
        candidates = group_matcher.generate_candidate_pool(
            participants=[host],
            movie_count=20
        )
        self.assertEqual(len(candidates), 20)
        # Verify multiple unique genres appear in candidate deck
        all_genres = set()
        for c in candidates:
            all_genres.update(c.genres)

        # Check representation of key diverse genres
        self.assertTrue(any(g in all_genres for g in ["Romance", "Comedy"]))
        self.assertTrue(any(g in all_genres for g in ["Science Fiction", "Action", "Adventure"]))
        self.assertTrue(any(g in all_genres for g in ["Animation", "Family", "Drama"]))
        self.assertGreaterEqual(len(all_genres), 6, "Expected at least 6 distinct genres represented")

    def test_email_verification_flow(self):
        from app import auth_service
        import uuid
        test_email = f"tester_{uuid.uuid4().hex[:8]}@example.com"
        reg = auth_service.register_user("Tester", "Verification", test_email, "securepass123")
        self.assertFalse(reg["user"]["is_verified"])
        token = reg["user"]["verification_token"]
        self.assertIsNotNone(token)

        # Verify token
        success = auth_service.verify_email_token(token)
        self.assertTrue(success)

        # Confirm user is now verified
        user = auth_service.get_user_by_id(reg["user"]["id"])
        self.assertTrue(user["is_verified"])

    def test_demo_room(self):
        demo = room_manager.create_demo_room()
        self.assertEqual(demo.code, "MOOD-DEMO")
        self.assertEqual(len(demo.participants), 4)
        self.assertIsNotNone(demo.results)
        self.assertIsNotNone(demo.results["winner"])
        self.assertGreaterEqual(demo.results["winner_score"], 80)

if __name__ == "__main__":
    unittest.main()
