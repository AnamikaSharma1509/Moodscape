import unittest
import sys
import os

# Add parent dir to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.recommender.engine import recommender
from app.recommender.mood_mapper import generate_mood_profile

class TestRecommender(unittest.TestCase):
    def test_quiz_mood_profiling(self):
        # High mystery & thriller answers
        answers = {
            "q1": "A", # mystery
            "q2": "B", # horror/suspense
            "q3": "B", # detective
            "q4": "A", # comedy
            "q5": "A", # adventure/mind games
            "q6": "B", # depth
            "q7": "B"  # edge of seat
        }
        profile = generate_mood_profile(answers)
        self.assertTrue("Mystery" in profile.profile_title or "Thrill" in profile.profile_title)
        self.assertGreater(profile.preference_vector.get("thriller", 0), 0.5)

    def test_recommendation_output(self):
        answers = {"q1": "A", "q2": "A", "q3": "B", "q4": "A", "q5": "A", "q6": "B", "q7": "B"}
        recs = recommender.get_recommendations(answers=answers, limit=8)
        self.assertGreater(len(recs.top_picks), 0)
        self.assertIsNotNone(recs.top_picks[0].match_score)
        self.assertIn("overall_match_pct", recs.top_picks[0].explanation)
        self.assertTrue(len(recs.hollywood_picks) > 0)
        self.assertTrue(len(recs.bollywood_picks) > 0)

if __name__ == "__main__":
    unittest.main()
