# YouTube Course Converter - System & DevOps Architecture

## 📁 Project Root Structure

```text
youtube-course-converter/
├── frontend/                          # React Vite application
├── backend/                           # FastAPI application
├── .github/
│   └── workflows/
│       ├── build-and-deploy.yml      # Docker build + Oracle deploy
│       └── test.yml                  # Run tests on push
├── docker-compose.yml                 # Local development setup
├── README.md
├── ARCHITECTURE.md
└── .gitignore
```

---

## 🚀 Deployment Pipeline

```text
Developer:
1. git add .
2. git commit -m "feature: add path graph"
3. git push origin main

GitHub Actions Workflow (.github/workflows/build-and-deploy.yml):
1. Checkout code
2. Run tests (npm test, pytest)
3. Build Docker image (Dockerfile)
4. Tag image: youtube-course:latest
5. Push to Docker Hub / GitHub Container Registry
6. SSH into Oracle Cloud VM
7. Execute deploy script:
   - git pull origin main
   - docker-compose pull
   - docker-compose up -d
   - Run database migrations
   - Health check

Oracle Cloud VM:
- Docker container pulls image
- Restarts FastAPI service
- Database migrations applied
- Redis cache invalidated
- API ready

Netlify:
- Detects git push on frontend/
- Runs: npm run build
- Deploys to CDN
- yoursitehere.dev updated

Result:
✅ Both frontend + backend live within 5 minutes
✅ Zero downtime deployment
✅ Automatic rollback on error
```

---

## 🔗 Service Interactions

```text
Frontend ←→ Backend Communication:

1. Video Player
   Frontend → GET /api/lessons/{id}
   Backend → Fetch from PostgreSQL (by order_index)
   Backend → Check Redis cache first
   Response → Video URL, summary, duration

2. Notes
   Frontend → PUT /api/notes/{lesson_id} {notes: "..."}
   Backend → Update progress.notes in PostgreSQL
   Response → { saved: true }

3. Course Progress
   Frontend → GET /api/progress/user/{id}/course/{courseId}
   Backend → Count completed lessons / total lessons
   Response → { completed: 5, total: 10, percentage: 50.0 }

4. Mark Lesson Complete
   Frontend → POST /api/progress/lesson/{lesson_id}/complete
   Backend → Update progress table
   Response → { completed: true }
```

---

## 🎯 Key Architecture Decisions

| Decision | Why |
|----------|-----|
| **Zustand vs Redux** | Simpler, less boilerplate, perfect for this scale |
| **FastAPI vs Django** | 2x faster, async by default, auto API docs |
| **PostgreSQL vs MongoDB** | Relational structure needed, better for joining data |
| **Redis caching** | Speeds up Gemini responses (cache for 24h) |
| **Separate frontend/backend** | Easier deployment, better separation of concerns |
| **Celery for async tasks** | Video processing + Gemini calls shouldn't block requests |
| **JWT + Refresh tokens** | Stateless auth, scales better |
| **Docker containerization** | Consistent environment, easy CI/CD |
| **Playlist order = lesson order** | AI does not decide course structure; order_index is set from YouTube playlist position and never changed |
| **Gemini API (not Claude)** | LLM used only for per-video transcript summarization |
| **Minimal UI first** | No gamification, animations, or decorative elements until core functionality is working |
