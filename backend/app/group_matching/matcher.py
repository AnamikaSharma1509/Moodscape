from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from app.models.schemas import Participant, MovieItem, GroupScoreResponse, VoteType
from app.recommender.engine import recommender

class GroupMatcher:
    def __init__(self):
        pass

    def compute_individual_compatibility(self, movie: Dict[str, Any], movie_idx: int, pref_vector: Dict[str, float]) -> float:
        """Calculate compatibility score (0.0 to 1.0) of a movie for an individual's preference vector."""
        if not pref_vector:
            # If no quiz completed, use neutral baseline based on movie quality
            return max(0.5, min(0.9, movie.get("rating", 7.0) / 10.0))

        query_text = recommender._user_vector_to_query_text(pref_vector)
        user_tfidf_vec = recommender.vectorizer.transform([query_text])
        score, _ = recommender.score_movie_for_user(movie, movie_idx, user_tfidf_vec, pref_vector)
        return float(score)

    def calculate_group_movie_score(
        self,
        movie: Dict[str, Any],
        movie_idx: int,
        participants: List[Participant]
    ) -> GroupScoreResponse:
        """Calculate group compatibility using the formula:
           0.40 * Average + 0.35 * Minimum + 0.15 * Consensus + 0.10 * Quality
        """
        if not participants:
            return GroupScoreResponse(
                movie_id=movie["id"],
                average_compatibility=0.7,
                minimum_compatibility=0.7,
                consensus=0.7,
                group_score=0.7,
                individual_matches={},
                consensus_reasons=["Balanced general pick"]
            )

        indiv_matches: Dict[str, float] = {}
        scores_list: List[float] = []

        for p in participants:
            user_vec = p.preference_vector or {}
            score = self.compute_individual_compatibility(movie, movie_idx, user_vec)
            # Normalize to percentage match
            pct = round(min(99.0, max(50.0, score * 100)), 1)
            indiv_matches[p.display_name] = pct
            scores_list.append(score)

        avg_comp = float(np.mean(scores_list))
        min_comp = float(np.min(scores_list))
        std_dev = float(np.std(scores_list))
        # Consensus: high when variance is low
        consensus = max(0.0, 1.0 - (std_dev * 2.0))

        # Movie quality factor
        quality = max(0.0, min(1.0, (movie.get("rating", 7.0) - 5.0) / 5.0))

        # Core formula:
        group_score = (
            0.40 * avg_comp +
            0.35 * min_comp +
            0.15 * consensus +
            0.10 * quality
        )

        # Generate consensus reasons
        reasons = []
        movie_genres = movie.get("genres", [])
        if min_comp >= 0.70:
            reasons.append("High minimum floor: no one will hate this choice")
        if consensus >= 0.80:
            reasons.append(f"Strong unanimous agreement across the group")
        if movie_genres:
            reasons.append(f"Shared appreciation for {movie_genres[0]}")
        if movie.get("rating", 0) >= 8.0:
            reasons.append("Critically acclaimed masterpiece")

        return GroupScoreResponse(
            movie_id=movie["id"],
            average_compatibility=round(avg_comp * 100, 1),
            minimum_compatibility=round(min_comp * 100, 1),
            consensus=round(consensus * 100, 1),
            group_score=round(group_score * 100, 1),
            individual_matches=indiv_matches,
            consensus_reasons=reasons[:3]
        )

    def generate_candidate_pool(
        self,
        participants: List[Participant],
        movie_count: int = 20,
        languages: Optional[List[str]] = None,
        genres: Optional[List[str]] = None,
        min_rating: Optional[float] = 6.0
    ) -> List[MovieItem]:
        """Generate a neutral, genre-diverse candidate deck of genuine movies for group night.
        Ensures representation across multiple genres (Romance, Comedy, Action, Sci-Fi,
        Thriller, Horror, Animation, Drama) without being biased by a single user's solo mood quiz.
        """
        genre_clusters = [
            ("Romance / Rom-Com", ["Romance", "Romantic Comedy"]),
            ("Comedy", ["Comedy"]),
            ("Action / Adventure", ["Action", "Adventure"]),
            ("Sci-Fi / Fantasy", ["Science Fiction", "Sci-Fi", "Fantasy"]),
            ("Mystery / Thriller", ["Mystery", "Thriller"]),
            ("Horror / Chills", ["Horror"]),
            ("Animation / Family", ["Animation", "Family"]),
            ("Drama / Crime", ["Drama", "Crime"])
        ]

        # Filter movies by language, min_rating, and explicit genres filter if provided
        eligible_movies = []
        for idx, movie in enumerate(recommender.movies):
            if min_rating and movie.get("rating", 0) < min_rating:
                continue
            if languages and movie.get("language") not in languages:
                continue
            if genres:
                has_genre = any(g.lower() in [req.lower() for req in genres] for g in movie.get("genres", []))
                if not has_genre:
                    continue
            eligible_movies.append((idx, movie))

        if not eligible_movies:
            eligible_movies = [(idx, movie) for idx, movie in enumerate(recommender.movies)]

        # Stratify by genre clusters
        cluster_buckets: Dict[str, List[Tuple[int, Dict[str, Any]]]] = {label: [] for label, _ in genre_clusters}
        for idx, movie in eligible_movies:
            m_genres = [g.lower() for g in movie.get("genres", [])]
            matched = False
            for label, tag_list in genre_clusters:
                if any(t.lower() in m_genres for t in tag_list):
                    cluster_buckets[label].append((idx, movie))
                    matched = True
                    break
            if not matched:
                cluster_buckets["Drama / Crime"].append((idx, movie))

        # Sort each bucket by quality and popularity
        for label in cluster_buckets:
            cluster_buckets[label].sort(
                key=lambda x: (x[1].get("rating", 0) * 0.7 + (x[1].get("popularity", 0) / 100.0) * 0.3),
                reverse=True
            )

        # Round-robin interleaved selection
        selected_pairs: List[Tuple[int, Dict[str, Any]]] = []
        selected_ids = set()
        labels = list(cluster_buckets.keys())

        round_num = 0
        while len(selected_pairs) < movie_count and round_num < 20:
            added_in_round = False
            for label in labels:
                bucket = cluster_buckets[label]
                if round_num < len(bucket):
                    idx, movie = bucket[round_num]
                    if movie["id"] not in selected_ids:
                        selected_ids.add(movie["id"])
                        selected_pairs.append((idx, movie))
                        added_in_round = True
                        if len(selected_pairs) >= movie_count:
                            break
            if not added_in_round:
                break
            round_num += 1

        # If more items needed to meet movie_count, fill with remaining highest-rated
        if len(selected_pairs) < movie_count:
            remaining = sorted(
                eligible_movies,
                key=lambda x: x[1].get("rating", 0),
                reverse=True
            )
            for idx, movie in remaining:
                if movie["id"] not in selected_ids:
                    selected_ids.add(movie["id"])
                    selected_pairs.append((idx, movie))
                    if len(selected_pairs) >= movie_count:
                        break

        # Convert to MovieItem with group compatibility calculations
        deck: List[MovieItem] = []
        for idx, m in selected_pairs:
            g_res = self.calculate_group_movie_score(m, idx, participants)
            item = MovieItem(
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
                match_score=int(round(g_res.group_score)),
                explanation={
                    "group_score": g_res.group_score,
                    "average_compatibility": g_res.average_compatibility,
                    "minimum_compatibility": g_res.minimum_compatibility,
                    "consensus": g_res.consensus,
                    "individual_matches": g_res.individual_matches,
                    "consensus_reasons": g_res.consensus_reasons
                }
            )
            deck.append(item)

        return deck

    def finalize_group_results(
        self,
        participants: List[Participant],
        deck_movies: List[MovieItem],
        votes: Dict[str, Dict[int, str]] # {user_id: {movie_id: "LIKE"|"DISLIKE"|"SUPERLIKE"}}
    ) -> Dict[str, Any]:
        """Combine swipe votes with ML compatibility scores to generate full match rankings."""
        scored_results = []
        participant_map = {p.user_id: p.display_name for p in participants}

        for movie in deck_movies:
            movie_id = movie.id
            like_count = 0
            superlike_count = 0
            dislike_count = 0
            voters_for_movie = []

            for u_id, p_votes in votes.items():
                if movie_id in p_votes:
                    v_type = p_votes[movie_id]
                    p_name = participant_map.get(u_id, "User")
                    voters_for_movie.append({"name": p_name, "vote": v_type})
                    if v_type == VoteType.SUPERLIKE.value:
                        superlike_count += 1
                        like_count += 1
                    elif v_type == VoteType.LIKE.value:
                        like_count += 1
                    else:
                        dislike_count += 1

            total_voted = like_count + dislike_count
            like_ratio = (like_count / max(1, total_voted)) if total_voted > 0 else 0.5
            superlike_bonus = superlike_count * 5.0

            # Base score from ML candidate score
            base_ml_score = movie.match_score or 75

            # Combined score: 60% Swipe outcome + 40% ML group compatibility + superlike bonus
            final_score = int(round(min(99, max(45, (like_ratio * 100 * 0.6) + (base_ml_score * 0.4) + superlike_bonus))))

            scored_results.append({
                "movie": movie,
                "final_score": final_score,
                "like_count": like_count,
                "dislike_count": dislike_count,
                "superlike_count": superlike_count,
                "total_votes": total_voted,
                "is_unanimous": like_count == len(participants) and len(participants) > 1,
                "is_near_unanimous": like_count >= len(participants) - 1 and len(participants) > 2,
                "divisiveness": abs(like_count - dislike_count) if total_voted > 0 else 0,
                "voter_breakdown": voters_for_movie
            })

        # Sort descending by final score
        scored_results.sort(key=lambda x: (x["final_score"], x["like_count"]), reverse=True)

        winner = scored_results[0]["movie"] if scored_results else None
        everyone_likes = [r["movie"] for r in scored_results if r["like_count"] == len(participants) and len(participants) > 1]
        near_unanimous = [r["movie"] for r in scored_results if r["is_near_unanimous"] and r["movie"] not in everyone_likes]
        best_matches = [r["movie"] for r in scored_results[:6]]

        # Most divisive (highest contest, e.g. 50/50 split)
        divisive_sorted = sorted(scored_results, key=lambda x: (x["total_votes"] > 1, -abs(x["like_count"] - x["dislike_count"])))
        most_divisive = divisive_sorted[0]["movie"] if divisive_sorted and len(participants) > 1 else None

        # Wildcard pick: unexpected movie from bottom half with good rating
        wildcards = [r["movie"] for r in scored_results[3:] if r["movie"].rating >= 7.5]
        wildcard_pick = wildcards[0] if wildcards else (scored_results[-1]["movie"] if scored_results else None)

        # Personal picks: for each participant, pick their favorite movie
        personal_picks = {}
        for p in participants:
            p_votes = votes.get(p.user_id, {})
            liked_ids = [m_id for m_id, v in p_votes.items() if v in [VoteType.LIKE.value, VoteType.SUPERLIKE.value]]
            p_movies = [r["movie"] for r in scored_results if r["movie"].id in liked_ids]
            if p_movies:
                personal_picks[p.display_name] = p_movies[0]

        # Calculate Group Movie DNA (aggregated genre histogram)
        genre_counts: Dict[str, int] = {}
        for r in scored_results[:8]:
            for g in r["movie"].genres:
                genre_counts[g] = genre_counts.get(g, 0) + 1

        total_genre_occurrences = sum(genre_counts.values()) or 1
        group_dna = [
            {"genre": g, "percentage": int(round((c / total_genre_occurrences) * 100))}
            for g, c in sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]

        return {
            "winner": winner,
            "winner_score": scored_results[0]["final_score"] if scored_results else 90,
            "best_matches": best_matches,
            "everyone_likes": everyone_likes,
            "near_unanimous": near_unanimous,
            "most_divisive": most_divisive,
            "wildcard_pick": wildcard_pick,
            "personal_picks": personal_picks,
            "group_dna": group_dna,
            "all_ranked": scored_results,
            "total_participants": len(participants),
            "total_movies_reviewed": len(deck_movies)
        }

group_matcher = GroupMatcher()
