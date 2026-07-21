# YouTube Course Converter (Youto)

Convert any YouTube playlist into a structured course with a curvy path UI, video player, and per-lesson notes.

## Features

- **Rich Text Note-Taking**: A fully-featured WYSIWYG editor (powered by TipTap) for taking complex notes with formatting, lists, highlights, and inline code.
- **Interactive Timestamps**: Type a timestamp (e.g. `01:23`) in your notes, and it automatically becomes a clickable button that jumps the video to that exact moment—even if it's styled or highlighted!
- **AI Video Summaries**: Leverage Google's ultra-fast **Gemini 3.1 Flash Lite** model to instantly generate comprehensive summaries for YouTube videos, handling transcripts up to 100k characters.
- **Google OAuth Authentication**: Seamless, one-click sign-in and auto-signup using Google OAuth, integrated directly into the frontend and verified securely on the backend via Google's `userinfo` endpoint.
- **Robust Transcript Fetching**: Uses `youtube-transcript-api` for fast caption retrieval, with an automatic `yt-dlp` fallback to bypass consent walls and download JSON3 subtitles.
- **Curvy Path UI**: Visualize your course progress along a beautifully animated, winding SVG path. The dotted line dynamically turns green up to your currently active video!
- **Course Discovery**: Find new courses with sentiment analysis backed by historical Reddit data (Arctic Shift).

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + TipTap |
| State | Zustand |
| Backend | FastAPI (Python 3.11) |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Queue | Celery |
| AI | Google Gemini 3.1 Flash Lite (summarization & recommendations) |
| Video | yt-dlp, youtube-transcript-api, & YouTube Data API v3 |
| Sentiment | Arctic Shift (PullPush) for historical Reddit data |
| Auth | JWT + bcrypt + Google OAuth (`@react-oauth/google`) |
| Deploy | Oracle Cloud VM + Netlify + Docker |

## Local Development

### Prerequisites
- Docker + Docker Compose
- Node 20+
- Python 3.11+

### 1. Clone & configure env

```bash
git clone <repo>
cd youtube-course-converter

# Set up root environment variables for Docker Compose
cp backend/.env.example .env
# Edit .env and fill in YOUTUBE_API_KEY, GEMINI_API_KEY, and SECRET_KEY
```

### 2. Start all services with Docker Compose

```bash
docker-compose up -d
```

This starts:
- **postgres** on port 5432
- **redis** on port 6379
- **backend** (FastAPI) on port 8000
- **celery-worker** (background tasks)
- **frontend** (Vite) on port 5173

### 3. Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

## Development without Docker

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env — set DATABASE_URL, REDIS_URL, etc.
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env — set VITE_API_URL=http://localhost:8000
npm run dev
```

## Environment Variables

### Project Root (`.env`) for Docker Compose

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/youto` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `SECRET_KEY` | JWT signing secret | *(required)* |
| `YOUTUBE_API_KEY` | YouTube Data API v3 Key | *(required for Discover page)* |
| `GEMINI_API_KEY` | Google Gemini API key | *(required for summaries and AI recommendations)* |
| `GOOGLE_CLIENT_ID` | Client ID for Google OAuth login verification | *(required for Google OAuth)* |
| `VITE_GOOGLE_CLIENT_ID` | Client ID for Google OAuth login button | *(required in frontend .env)* |
| `ALLOWED_ORIGINS` | CORS origins (JSON array) | `["http://localhost:5173"]` |

## Architecture

See [Yt-Cr-Frontend.md](./Yt-Cr-Frontend.md), [Yt-Cr-Backend.md](./Yt-Cr-Backend.md), and [Yt-Cr-System.md](./Yt-Cr-System.md).
