# MOODSCAPE 🎬
### *"Your Mood. Your Movie. Your People."*

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-NLP%20TF--IDF-F7931E?style=flat&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 📌 Problem Statement
In today's era of entertainment abundance, movie discovery has become an exhausting chore:
- **Solo Viewers** waste 30+ minutes scrolling through generic feeds that ignore their immediate emotional mood.
- **Groups of Friends** get stuck in decision paralysis ("You choose", "No, you choose") because one wants horror, another wants comedy, and another wants thriller.

**MoodScape** transforms movie discovery from a solitary search chore into an intelligent, social experience through:
1. **Interactive Mood Discovery**: A 7-question psychological movie quiz generating a multi-dimensional emotional profile matched via TF-IDF NLP and Cosine Similarity.
2. **Collaborative Social Matching**: Real-time shared movie rooms where friends swipe independently, while a consensus algorithm computes compatibility, prevents majority tyranny, and reveals the compromise winner.
3. **The Smart Bridge**: Solo mood profiles automatically carry into group sessions to influence candidate decks.

---

## 🚀 Key Features

- **7-Question Mood Quiz**: Exact psychological quiz classifying users into archetypes like *The Curious Thrill-Seeker*, *The Feel-Good Romantic*, *The Horror Addict*, or *The Mystery Solver*.
- **Machine Learning Recommendation Engine**:
  - Combined textual features (genres + keywords + overview + mood tags + cast + director).
  - TF-IDF Vectorizer with unigrams & bigrams (2,500 features).
  - Transparent Hybrid Score: $0.50 \times \text{Content} + 0.20 \times \text{Genre} + 0.15 \times \text{Mood} + 0.10 \times \text{Rating} + 0.05 \times \text{Popularity}$.
  - Detailed *"Why this movie?"* modal with component match percentages.
- **5 Curated Discovery Buckets**:
  - **Top Picks**: Highest overall compatibility.
  - **Hollywood Highlights**: Mainstream & global titles.
  - **Bollywood Picks**: Hindi cinema & Desi classics.
  - **Vintage Classics**: Timeless gems from before 1980.
  - **Hidden Gems**: High-rating indie & under-the-radar films.
  - **The Wildcard**: Surprising stretch recommendation.
- **Real-Time Group Rooms**:
  - Instant 4-character room codes (e.g. `MOOD-7K9X`) and 1-click WhatsApp/link sharing.
  - Live participant lobby with ready status indicators.
  - Tinder-style swipe deck with Framer Motion drag physics and keyboard shortcuts (`← Pass`, `Space Superlike`, `Like →`).
  - Private blind voting (votes are concealed until reveal).
  - Group Consensus Formula: $0.40 \times \mu_{\text{comp}} + 0.35 \times \min_i(\text{comp}_i) + 0.15 \times \text{Consensus} + 0.10 \times \text{Quality}$.
  - Confetti celebration, individual breakdown across friends, Most Divisive pick, Group Movie DNA chart, and Movie Night Recap.
- **1-Click Recruiter Demo Room**:
  - Instant 4-person simulated session (*Anamika, Shreya, Rahul, Priya*) demonstrating multi-user real-time matching with zero configuration.

---

## 🛠️ Project Structure

```
MoodScape/
├── frontend/                     # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/           # Navbar, Footer, MovieCard, Modals, CompatibilityBar
│   │   ├── pages/                # Home, Quiz, Recommendations, RoomsHub, Lobby, Swipe, Results, Search
│   │   ├── context/              # AppContext (Theme, Profile, Favorites, Watchlist)
│   │   ├── services/             # API client with fallback data
│   │   └── types/                # TypeScript interface definitions
│   └── package.json
│
├── backend/                      # Python 3.11 + FastAPI + scikit-learn
│   ├── app/
│   │   ├── main.py               # REST API & WebSocket endpoints
│   │   ├── config.py             # Settings & CORS config
│   │   ├── models/schemas.py     # Pydantic schemas
│   │   ├── recommender/          # TF-IDF Recommender & Mood Mapper
│   │   ├── group_matching/       # Consensus & Compatibility Engine
│   │   └── rooms/manager.py      # Room state, live sessions & demo simulation
│   ├── data/                     # movies.json, TF-IDF vectorizer & matrices
│   ├── scripts/                  # preprocess_movies.py
│   ├── tests/                    # Recommender & Group Matcher unit tests
│   └── requirements.txt
│
├── docs/                         # Technical documentation
│   ├── ARCHITECTURE.md
│   ├── ML_ARCHITECTURE.md
│   ├── GROUP_MATCHING.md
│   └── API.md
└── README.md
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** v18+ (tested on v24)
- **Python** 3.10+ (tested on 3.11)

### 2. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python scripts/preprocess_movies.py
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Backend will be live at `http://127.0.0.1:8000` (Swagger docs at `/docs`).

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Running Backend Unit Tests
```bash
python -m unittest discover backend/tests
```

---

## 👥 Demo Presentation Flow (For Evaluators & Recruiters)
1. **Solo Flow**: On the homepage, click **"Find My Movie"**, complete the 7 mood questions, see your archetype decoded (e.g. *The Curious Thrill-Seeker*), and explore personalized Hollywood, Bollywood, and Hidden Gem recommendations. Click **"Why this movie?"** to inspect the TF-IDF NLP match breakdown.
2. **Bridge Flow**: Click **"Turn Into Group Room"** to carry your mood profile into a collaborative session.
3. **Group Flow**: Click **"Launch 4-Person Demo"** on the Group Rooms page to see an instant simulated live session with Anamika, Shreya, Rahul, and Priya. Inspect the winning film, individual friend compatibility percentages, consensus reasons, Most Divisive pick, and Group Movie DNA!
