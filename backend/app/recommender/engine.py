import json
import os
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.models.schemas import MovieItem, RecommendResponse, MoodProfileResponse
from app.recommender.mood_mapper import calculate_preference_vector, generate_mood_profile

class MovieRecommender:
    def __init__(self, data_path: Optional[str] = None):
        if not data_path:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            data_path = os.path.join(os.path.dirname(base_dir), "data", "movies.json")

        self.data_path = data_path
        self.movies: List[Dict[str, Any]] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.movie_tfidf_matrix = None
        self.movie_metadata_corpus: List[str] = []
        self.load_data()

    def load_data(self):
        if not os.path.exists(self.data_path):
            print(f"Warning: Movie dataset not found at {self.data_path}")
            return

        with open(self.data_path, "r", encoding="utf-8") as f:
            self.movies = json.load(f)

        # Feature engineering: build rich text representation for TF-IDF
        self.movie_metadata_corpus = []
        for m in self.movies:
            genres_str = " ".join(m.get("genres", []))
            # Repeat genres and mood tags for weight emphasis in NLP representation
            mood_str = " ".join([tag.replace("😱", "").replace("😂", "").replace("❤️", "").replace("🧠", "").replace("🔥", "").replace("🔍", "").replace("🌍", "").replace("😭", "").replace("🌿", "").replace("⚡", "").strip() for tag in m.get("mood_tags", [])])
            cast_str = " ".join(m.get("cast", []))
            director_str = m.get("director", "")
            overview = m.get("overview", "")
            category = m.get("category", "")

            # Combined textual feature
            feature_doc = f"{genres_str} {genres_str} {mood_str} {mood_str} {overview} {cast_str} {director_str} {category}"
            self.movie_metadata_corpus.append(feature_doc.lower())

        # Fit TF-IDF Vectorizer
        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            max_features=2500,
            ngram_range=(1, 2)
        )
        self.movie_tfidf_matrix = self.vectorizer.fit_transform(self.movie_metadata_corpus)
        print(f"MovieRecommender initialized with {len(self.movies)} movies and TF-IDF matrix shape: {self.movie_tfidf_matrix.shape}")

    def _user_vector_to_query_text(self, pref_vector: Dict[str, float]) -> str:
        """Convert weighted preference vector into a query token document with repetitions reflecting weights."""
        tokens: List[str] = []
        for dim, weight in pref_vector.items():
            if weight <= 0.15:
                continue
            repeat_count = max(1, int(round(weight * 5)))
            # Map dimension to associated movie query words
            dim_lower = dim.lower()
            if dim_lower == "detective":
                word = "detective mystery crime"
            elif dim_lower == "supernatural":
                word = "supernatural horror ghost"
            elif dim_lower == "feelgood":
                word = "feel-good wholesome uplifting comedy"
            elif dim_lower == "sliceoflife":
                word = "relaxing gentle cozy life"
            elif dim_lower == "psychological":
                word = "psychological thought-provoking mind"
            else:
                word = dim_lower

            tokens.extend([word] * repeat_count)

        return " ".join(tokens)

    def _calculate_genre_overlap(self, movie_genres: List[str], pref_vector: Dict[str, float]) -> float:
        """Calculate direct genre alignment score between 0.0 and 1.0."""
        score = 0.0
        match_count = 0
        for g in movie_genres:
            g_key = g.lower()
            if g_key in pref_vector:
                score += pref_vector[g_key]
                match_count += 1
            elif g_key == "sci-fi" and "psychological" in pref_vector:
                score += pref_vector["psychological"] * 0.7
                match_count += 1

        if match_count == 0:
            return 0.1
        return min(1.0, score / max(1, match_count) * 1.2)

    def _calculate_mood_overlap(self, mood_tags: List[str], pref_vector: Dict[str, float]) -> float:
        """Calculate mood tag overlap with user preference."""
        mood_map = {
            "scary": ["horror", "supernatural"],
            "funny": ["comedy", "feelGood"],
            "romantic": ["romance"],
            "thought-provoking": ["psychological", "drama", "mystery"],
            "intense": ["thriller", "action", "suspense"],
            "mysterious": ["mystery", "detective", "thriller"],
            "adventurous": ["adventure", "action"],
            "emotional": ["drama", "emotional", "sad"],
            "relaxing": ["relaxed", "sliceOfLife", "feelGood"],
            "high energy": ["action", "thriller"]
        }

        tag_scores = []
        for tag in mood_tags:
            cleaned = tag.split()[-1].lower() if tag else ""
            if cleaned in mood_map:
                dims = mood_map[cleaned]
                best_subscore = max([pref_vector.get(d, 0.0) for d in dims] or [0.0])
                tag_scores.append(best_subscore)

        return np.mean(tag_scores) if tag_scores else 0.5

    def score_movie_for_user(self, movie: Dict[str, Any], movie_idx: int, user_tfidf_vector, pref_vector: Dict[str, float]) -> Tuple[float, Dict[str, Any]]:
        """Calculate the hybrid score and breakdown for a single movie."""
        # 1. Content similarity via TF-IDF cosine similarity
        movie_vec = self.movie_tfidf_matrix[movie_idx]
        content_sim = float(cosine_similarity(user_tfidf_vector, movie_vec)[0][0])
        # Rescale content similarity to a friendly 0.0 - 1.0 range
        content_sim = min(1.0, max(0.0, content_sim * 1.5))

        # 2. Genre match
        genre_score = self._calculate_genre_overlap(movie.get("genres", []), pref_vector)

        # 3. Mood match
        mood_score = self._calculate_mood_overlap(movie.get("mood_tags", []), pref_vector)

        # 4. Rating quality (normalized 5.0 to 10.0 -> 0.0 to 1.0)
        rating_score = max(0.0, min(1.0, (movie.get("rating", 7.0) - 5.0) / 5.0))

        # 5. Normalized popularity (0 to 100 -> 0.0 to 1.0)
        pop_score = max(0.0, min(1.0, movie.get("popularity", 50.0) / 100.0))

        # Hybrid formula from specification:
        # Final Score = 0.50 * Content + 0.20 * Genre + 0.15 * Mood + 0.10 * Rating + 0.05 * Popularity
        hybrid_score = (
            0.50 * content_sim +
            0.20 * genre_score +
            0.15 * mood_score +
            0.10 * rating_score +
            0.05 * pop_score
        )

        match_pct = int(round(min(99, max(55, hybrid_score * 100))))

        # Generate transparent explanation
        top_user_genres = [k.capitalize() for k, v in sorted(pref_vector.items(), key=lambda x: x[1], reverse=True) if v > 0.4][:3]
        matched_movie_genres = [g for g in movie.get("genres", []) if g.lower() in [k.lower() for k in top_user_genres]]

        reason_text = f"Strongly aligns with your preference for {', '.join(top_user_genres[:2]) if top_user_genres else 'dynamic storytelling'}."
        if matched_movie_genres:
            reason_text += f" Features high-caliber {matched_movie_genres[0]} elements matching your emotional tone."

        explanation = {
            "content_match_pct": int(round(content_sim * 100)),
            "genre_match_pct": int(round(genre_score * 100)),
            "mood_match_pct": int(round(mood_score * 100)),
            "overall_match_pct": match_pct,
            "explanation_text": reason_text
        }

        return hybrid_score, explanation

    def get_recommendations(
        self,
        answers: Optional[Dict[str, str]] = None,
        pref_vector: Optional[Dict[str, float]] = None,
        category_filter: Optional[str] = None,
        limit: int = 12
    ) -> RecommendResponse:
        """Compute hybrid recommendation buckets across categories."""
        profile: Optional[MoodProfileResponse] = None

        if answers:
            profile = generate_mood_profile(answers)
            vector = profile.preference_vector
        elif pref_vector:
            vector = pref_vector
            # Construct a lightweight profile
            sorted_dims = sorted(vector.items(), key=lambda x: x[1], reverse=True)
            top_dim = sorted_dims[0][0].capitalize() if sorted_dims else "Cinematic"
            profile = MoodProfileResponse(
                profile_title=f"The {top_dim} Explorer",
                tagline="Personalized based on custom preference vector.",
                description="Custom tuned vector reflecting emotional preferences.",
                primary_genres=[top_dim],
                secondary_genres=[sorted_dims[1][0].capitalize()] if len(sorted_dims) > 1 else [],
                energy_level="Dynamic",
                emotional_tone="Personalized",
                preference_vector=vector
            )
        else:
            # Default fallback answers
            profile = generate_mood_profile({"q1": "A", "q2": "A", "q3": "B", "q4": "A", "q5": "A", "q6": "B", "q7": "B"})
            vector = profile.preference_vector

        # Transform vector into TF-IDF query
        query_text = self._user_vector_to_query_text(vector)
        user_tfidf_vec = self.vectorizer.transform([query_text])

        # Score every movie in dataset
        scored_movies: List[Tuple[float, Dict[str, Any], Dict[str, Any]]] = []
        for idx, movie in enumerate(self.movies):
            score, explanation = self.score_movie_for_user(movie, idx, user_tfidf_vec, vector)
            scored_movies.append((score, movie, explanation))

        # Sort descending by hybrid score
        scored_movies.sort(key=lambda x: x[0], reverse=True)

        def to_movie_item(score: float, m: Dict[str, Any], exp: Dict[str, Any]) -> MovieItem:
            return MovieItem(
                id=m["id"],
                title=m["title"],
                year=m["year"],
                genres=m["genres"],
                overview=m["overview"],
                rating=m["rating"],
                vote_count=m["vote_count"],
                popularity=m["popularity"],
                runtime=m["runtime"],
                director=m["director"],
                cast=m["cast"],
                poster_path=m["poster_path"],
                backdrop_path=m.get("backdrop_path"),
                mood_tags=m.get("mood_tags", []),
                category=m.get("category", "Hollywood"),
                streaming_providers=m.get("streaming_providers", []),
                language=m.get("language", "en"),
                match_score=exp["overall_match_pct"],
                explanation=exp
            )

        # 1. Top Picks
        top_picks = [to_movie_item(s, m, exp) for s, m, exp in scored_movies[:limit]]

        # 2. Hollywood Picks
        hw_movies = [to_movie_item(s, m, exp) for s, m, exp in scored_movies if m.get("category") == "Hollywood"][:8]

        # 3. Bollywood Picks
        bw_movies = [to_movie_item(s, m, exp) for s, m, exp in scored_movies if m.get("category") == "Bollywood"][:8]

        # 4. Vintage Classics (category == Vintage or year <= 1980)
        vintage_movies = [to_movie_item(s, m, exp) for s, m, exp in scored_movies if m.get("category") == "Vintage" or m.get("year", 2000) <= 1980][:8]

        # 5. Hidden Gems (category == "Hidden Gem" or popularity <= 75 and rating >= 7.2)
        hidden_gems = [to_movie_item(s, m, exp) for s, m, exp in scored_movies if m.get("category") == "Hidden Gem" or (m.get("popularity", 100) < 75 and m.get("rating", 0) >= 7.5)][:8]

        # 6. Wildcard Pick (unexpected high quality choice outside dominant preference)
        # Choose a high rated movie from middle of pack to surprise user
        wildcard_candidates = [to_movie_item(s, m, exp) for s, m, exp in scored_movies[6:20] if m["id"] not in [x.id for x in top_picks[:3]]]
        wildcard_pick = wildcard_candidates[0] if wildcard_candidates else (top_picks[-1] if top_picks else None)

        return RecommendResponse(
            profile=profile,
            top_picks=top_picks,
            hollywood_picks=hw_movies,
            bollywood_picks=bw_movies,
            vintage_picks=vintage_movies,
            hidden_gems=hidden_gems,
            wildcard_pick=wildcard_pick
        )

# Global recommender singleton
recommender = MovieRecommender()
