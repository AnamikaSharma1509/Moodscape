# MoodScape REST & WebSocket API Reference

Base URL: `http://localhost:8000/api`

## Endpoints

### 1. Solo Quiz & Recommendations
- `GET /api/quiz-questions`: Returns the 7 interactive questions with choices, icons, and tags.
- `POST /api/mood-profile`: Computes mood archetype, tagline, and normalized preference vector.
  - Body: `{"q1": "A", "q2": "B", ...}`
- `POST /api/recommend`: Computes hybrid recommendations.
  - Body: `{"answers": {...}, "preference_vector": {...}, "limit": 12}`
  - Returns: `profile`, `top_picks`, `hollywood_picks`, `bollywood_picks`, `vintage_picks`, `hidden_gems`, `wildcard_pick`.

### 2. Movies Catalog
- `GET /api/movies`: Query with `category`, `genre`, `mood`, `min_rating`, `streaming`.
- `GET /api/movies/{id}`: Detailed metadata, cast, director, streaming providers.
- `GET /api/search?q={term}`: Autocomplete search by title, director, cast, or genre.
- `GET /api/watch-providers/{id}`: Available streaming providers by region.

### 3. Collaborative Movie Rooms
- `POST /api/rooms`: Creates room and returns unique code (e.g. `MOOD-7K9X`).
- `GET /api/rooms/{code}`: Fetches current room state, participant list, and voting progress.
- `POST /api/rooms/{code}/join`: Join with display name, avatar, and optional mood profile.
- `POST /api/rooms/{code}/ready`: Toggle ready status.
- `POST /api/rooms/{code}/start`: Host begins swipe session with candidate deck.
- `POST /api/rooms/{code}/vote`: Submit private vote (`LIKE`, `DISLIKE`, `SUPERLIKE`).
- `POST /api/rooms/demo`: Instantly returns pre-simulated 4-person demo room (`MOOD-DEMO`).
- `WebSocket /ws/rooms/{code}`: Real-time presence, state updates, and completion notifications.
