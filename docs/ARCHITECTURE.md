# MoodScape System Architecture

## 1. Overview
MoodScape is an intelligent social movie discovery platform that bridges two distinct paradigms:
1. **Solo Mood Discovery**: Understanding individual immediate emotional intent via a 7-question interactive psychological quiz, vectorized through TF-IDF and Cosine Similarity into personalized recommendation buckets.
2. **Collaborative Group Matching**: Multi-participant live rooms where friends swipe independently, while a group consensus algorithm calculates compatibility, protects minority preferences, and settles group movie night.

---

## 2. Architecture Diagram

```
                      ┌──────────────────────────────────────┐
                      │          React 19 Frontend           │
                      │  (Vite + TypeScript + Tailwind CSS)  │
                      └──────────────────┬───────────────────┘
                                         │ REST & WebSockets
                                         ▼
                      ┌──────────────────────────────────────┐
                      │          FastAPI Backend             │
                      │       (Python 3.11 / Uvicorn)        │
                      └──────────┬────────────────┬──────────┘
                                 │                │
            ┌────────────────────┴───┐       ┌────┴────────────────────────┐
            │   ML Recommender       │       │    Group Matching Engine    │
            │   (scikit-learn NLP)   │       │    (Consensus & Variance)   │
            └────────────┬───────────┘       └─────────────┬───────────────┘
                         │                                 │
                         ▼                                 ▼
            ┌────────────────────────┐       ┌─────────────────────────────┐
            │   TF-IDF Matrix &      │       │     Room Manager State      │
            │   Movie Knowledge Base │       │  (Presence, Deck & Votes)   │
            └────────────────────────┘       └─────────────────────────────┘
```

---

## 3. Key Components

### Frontend (`frontend/`)
- **React 19 + TypeScript**: Type-safe component architecture.
- **Tailwind CSS**: Glassmorphic, modern cinematic UI with dark mode support.
- **Framer Motion**: Smooth swipe gesture cards with drag physics, threshold stamps, and responsive feedback.
- **Context API**: Client-side state persistence across sessions and local fallback mode.

### Backend (`backend/`)
- **FastAPI**: Asynchronous high-performance REST API and WebSocket broadcast service.
- **Pydantic v2**: Strict schema validation for quiz answers, movie items, room participants, and votes.
- **Recommender Service**: NLP feature engineering (genres + keywords + overview + mood tags + cast + director) transformed via `TfidfVectorizer` (2,500 features, unigram & bigram).
- **Group Matcher**: Algorithmic scoring evaluating individual vectors, consensus standard deviation, and minimum compatibility floors.
