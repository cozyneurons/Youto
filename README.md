# YouTube Course Converter (Youto)

Convert any YouTube playlist into a structured course with a curvy path UI, video player, and per-lesson notes.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| State | Zustand |
| Backend | FastAPI (Python 3.11) |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Queue | Celery |
| AI | Google Gemini (transcript summarization & recommendations) |
| Video | yt-dlp (playlist extraction) & YouTube Data API v3 |
| Sentiment | Arctic Shift (PullPush) for historical Reddit data |
| Auth | JWT + bcrypt |
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
| `ALLOWED_ORIGINS` | CORS origins (JSON array) | `["http://localhost:5173"]` |

## Architecture

See [Yt-Cr-Frontend.md](./Yt-Cr-Frontend.md), [Yt-Cr-Backend.md](./Yt-Cr-Backend.md), and [Yt-Cr-System.md](./Yt-Cr-System.md).
