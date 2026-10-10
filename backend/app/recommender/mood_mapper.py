from typing import Dict, Any, List
from app.models.schemas import MoodProfileResponse

# Genre and mood dimensions
ALL_DIMENSIONS = [
    "action", "adventure", "comedy", "romance", "horror",
    "thriller", "mystery", "drama", "emotional", "suspense",
    "psychological", "feelGood", "detective", "supernatural",
    "sliceOfLife", "relaxed"
]

# Question definitions with weights
QUIZ_WEIGHTS = {
    "q1": {
        "A": {"mystery": 1.0, "thriller": 0.9, "detective": 1.0},
        "B": {"horror": 1.0, "supernatural": 1.0, "suspense": 0.7}
    },
    "q2": {
        "A": {"drama": 1.0, "emotional": 1.0, "sad": 0.9},
        "B": {"horror": 0.9, "suspense": 1.0, "thriller": 0.8}
    },
    "q3": {
        "A": {"action": 1.0, "adventure": 0.9},
        "B": {"detective": 1.0, "mystery": 1.0, "thriller": 0.8}
    },
    "q4": {
        "A": {"comedy": 1.0, "feelGood": 0.8},
        "B": {"romance": 1.0, "feelGood": 0.6, "comedy": 0.4}
    },
    "q5": {
        "A": {"adventure": 1.0, "thriller": 0.9, "mystery": 0.7},
        "B": {"sliceOfLife": 1.0, "comedy": 0.7, "relaxed": 1.0}
    },
    "q6": {
        "A": {"comedy": 0.9, "romance": 0.7, "feelGood": 1.0},
        "B": {"drama": 1.0, "psychological": 1.0, "emotional": 0.8, "thriller": 0.6}
    },
    "q7": {
        "A": {"comedy": 1.0, "feelGood": 0.9},
        "B": {"thriller": 1.0, "horror": 0.8, "action": 0.8, "suspense": 1.0}
    }
}

# The 7 exact questions with icons and mood tags
QUIZ_QUESTIONS = [
    {
        "id": "q1",
        "question": "Do you:",
        "options": [
            {
                "id": "A",
                "text": "Want to solve any mystery or case?",
                "icon": "Search",
                "tags": ["Thriller", "Detective", "Mystery"]
            },
            {
                "id": "B",
                "text": "Want to get a follow-up routine of a ghost?",
                "icon": "Ghost",
                "tags": ["Horror", "Supernatural", "Chills"]
            }
        ]
    },
    {
        "id": "q2",
        "question": "Do you want:",
        "options": [
            {
                "id": "A",
                "text": "Goosebumps all over your body and tears gathering in your eyes?",
                "icon": "HeartHandshake",
                "tags": ["Sad", "Emotional", "Drama"]
            },
            {
                "id": "B",
                "text": "A sudden mini heart attack because of someone's presence?",
                "icon": "Zap",
                "tags": ["Horror", "Suspense", "Adrenaline"]
            }
        ]
    },
    {
        "id": "q3",
        "question": "Do you want:",
        "options": [
            {
                "id": "A",
                "text": "Some handsome dude doing some action, falling off a cliff?",
                "icon": "Flame",
                "tags": ["Action", "Adventure", "Spectacle"]
            },
            {
                "id": "B",
                "text": "A nerd detective solving a mystery?",
                "icon": "Glasses",
                "tags": ["Detective", "Mystery", "Thriller"]
            }
        ]
    },
    {
        "id": "q4",
        "question": "Do you want to:",
        "options": [
            {
                "id": "A",
                "text": "LOL, rolling on the bed?",
                "icon": "Laugh",
                "tags": ["Comedy", "Hilarious", "Laugh Out Loud"]
            },
            {
                "id": "B",
                "text": "Get some butterflies in your stomach?",
                "icon": "Heart",
                "tags": ["Romance", "Romantic Comedy", "Sweet"]
            }
        ]
    },
    {
        "id": "q5",
        "question": "Either you want to:",
        "options": [
            {
                "id": "A",
                "text": "Roam all continents while playing mind games",
                "icon": "Compass",
                "tags": ["Adventure", "Thriller", "Mind Game"]
            },
            {
                "id": "B",
                "text": "Do all the chores while being stuck in a town all your life.",
                "icon": "Coffee",
                "tags": ["Slice of Life", "Relaxed", "Cozy Vibes"]
            }
        ]
    },
    {
        "id": "q6",
        "question": "Would you prefer something light-hearted or something with a bit more depth?",
        "options": [
            {
                "id": "A",
                "text": "Something light-hearted",
                "icon": "Sun",
                "tags": ["Comedy", "Romance", "Feel-Good"]
            },
            {
                "id": "B",
                "text": "Something with a bit more depth",
                "icon": "BookOpen",
                "tags": ["Drama", "Psychological", "Emotional"]
            }
        ]
    },
    {
        "id": "q7",
        "question": "Do you want something that will make you laugh out loud or something that will keep you on the edge of your seat?",
        "options": [
            {
                "id": "A",
                "text": "Make me laugh out loud",
                "icon": "Sparkles",
                "tags": ["Comedy", "Feel-Good", "Fun"]
            },
            {
                "id": "B",
                "text": "Keep me on the edge of my seat",
                "icon": "Activity",
                "tags": ["Thriller", "Suspense", "Gripping"]
            }
        ]
    }
]

def calculate_preference_vector(answers: Dict[str, str]) -> Dict[str, float]:
    """Aggregate raw answer weights into a normalized dimension vector."""
    raw_vector: Dict[str, float] = {dim: 0.0 for dim in ALL_DIMENSIONS}

    for q_id, choice in answers.items():
        q_weights = QUIZ_WEIGHTS.get(q_id, {})
        choice_weights = q_weights.get(choice.upper(), {})
        for dim, weight in choice_weights.items():
            if dim in raw_vector:
                raw_vector[dim] += weight
            else:
                raw_vector[dim] = weight

    # Find max weight for min-max normalization
    max_val = max(raw_vector.values()) if raw_vector.values() else 1.0
    if max_val == 0:
        max_val = 1.0

    normalized_vector = {k: round(v / max_val, 3) for k, v in raw_vector.items()}
    return normalized_vector

def generate_mood_profile(answers: Dict[str, str]) -> MoodProfileResponse:
    """Analyze answers to generate human-readable profile, energy level, and emotional tone."""
    vector = calculate_preference_vector(answers)

    # Sort dimensions by strength
    sorted_dims = sorted(vector.items(), key=lambda item: item[1], reverse=True)
    top_dims = [dim for dim, score in sorted_dims if score > 0.35]

    has_mystery = vector.get("mystery", 0) > 0.5 or vector.get("detective", 0) > 0.5
    has_thriller = vector.get("thriller", 0) > 0.5 or vector.get("suspense", 0) > 0.5
    has_horror = vector.get("horror", 0) > 0.5 or vector.get("supernatural", 0) > 0.5
    has_comedy = vector.get("comedy", 0) > 0.5 or vector.get("feelGood", 0) > 0.5
    has_romance = vector.get("romance", 0) > 0.5
    has_drama = vector.get("drama", 0) > 0.5 or vector.get("emotional", 0) > 0.5
    has_action = vector.get("action", 0) > 0.5 or vector.get("adventure", 0) > 0.5
    has_relaxed = vector.get("sliceOfLife", 0) > 0.5 or vector.get("relaxed", 0) > 0.5

    # Determine personality archetype
    if has_mystery and has_thriller and has_action:
        title = "The Curious Thrill-Seeker"
        tagline = "Chasing puzzles, high stakes, and adrenaline."
        description = "Your quiz responses show a strong appetite for gripping tension, layered mysteries, and pulse-pounding escapades."
        primary = ["Mystery", "Thriller"]
        secondary = ["Action", "Adventure"]
        energy = "High"
        tone = "Suspenseful & Electrifying"
    elif has_horror and has_thriller:
        title = "The Horror Addict"
        tagline = "Drawn to the eerie, uncanny, and heart-racing."
        description = "You crave visceral tension, jump scares, and supernatural chills that keep you peeking through your fingers."
        primary = ["Horror", "Supernatural"]
        secondary = ["Suspense", "Psychological Thriller"]
        energy = "High"
        tone = "Chilling & Eerie"
    elif has_mystery and not has_action:
        title = "The Mystery Solver"
        tagline = "Every detail matters; give you a case to crack."
        description = "You enjoy detective intellect, whodunit twists, and psychological puzzles that challenge your deduction skills."
        primary = ["Mystery", "Detective"]
        secondary = ["Psychological", "Crime"]
        energy = "Focused & Analytical"
        tone = "Intriguing & Clever"
    elif has_romance and has_comedy:
        title = "The Feel-Good Romantic"
        tagline = "Warm laughs, swoon-worthy chemistry, and genuine heart."
        description = "Tonight calls for wholesome vibes, witty banter, and comfort cinema that leaves butterflies in your stomach."
        primary = ["Romance", "Comedy"]
        secondary = ["Feel-Good", "Drama"]
        energy = "Medium"
        tone = "Heartwarming & Playful"
    elif has_comedy and has_relaxed:
        title = "The Lazy-Day Comedy Buddy"
        tagline = "Zero stress, endless laughs, and cozy comfort."
        description = "You want pure dopamine and effortless entertainment without having to dissect complex existential plots."
        primary = ["Comedy", "Slice of Life"]
        secondary = ["Feel-Good", "Adventure"]
        energy = "Relaxed"
        tone = "Hilarious & Breezy"
    elif has_drama and has_romance:
        title = "The Emotional Soul"
        tagline = "Ready for tears, deep empathy, and cathartic storytelling."
        description = "You want cinema that touches the heart, explores raw human connections, and lingers long after the credits roll."
        primary = ["Drama", "Emotional"]
        secondary = ["Romance", "Psychological"]
        energy = "Reflective"
        tone = "Poignant & Cathartic"
    elif has_action and has_adventure:
        title = "The Adventure Seeker"
        tagline = "Epic scales, cinematic journeys, and heroic feats."
        description = "You want grand visuals, exhilarating cliffhangers, and expansive horizons that transport you out of reality."
        primary = ["Action", "Adventure"]
        secondary = ["Sci-Fi", "Thriller"]
        energy = "High"
        tone = "Dynamic & Bold"
    elif vector.get("psychological", 0) > 0.5:
        title = "The Deep Thinker"
        tagline = "Philosophical undercurrents and mind-bending narratives."
        description = "You prefer cinema with existential weight, narrative complexity, and questions that provoke late-night debates."
        primary = ["Drama", "Psychological"]
        secondary = ["Mystery", "Sci-Fi"]
        energy = "Introspective"
        tone = "Profound & Thought-Provoking"
    else:
        title = "The Cinematic Wild Card"
        tagline = "Eclectic taste ready for unexpected cinematic brilliance."
        description = "Your mood spans multiple genres. You appreciate bold filmmaking, unique voices, and surprise discoveries."
        primary = ["Diverse", "Curated"]
        secondary = ["Hidden Gems", "Cult Classics"]
        energy = "Flexible"
        tone = "Vibrant & Unpredictable"

    return MoodProfileResponse(
        profile_title=title,
        tagline=tagline,
        description=description,
        primary_genres=primary,
        secondary_genres=secondary,
        energy_level=energy,
        emotional_tone=tone,
        preference_vector=vector
    )
