# YouTube Course Converter - Complete Architecture

## 📁 Project Root Structure

```
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

## 🎨 FRONTEND ARCHITECTURE

```
frontend/
├── public/
│   ├── favicon.svg
│   └── manifest.json
│
├── src/
│   ├── components/                   # Reusable UI components
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   │
│   │   ├── course/                  # Course path components
│   │   │   ├── PathGraph.tsx        # Curvy SVG path with video nodes
│   │   │   ├── VideoNode.tsx        # Single node (thumbnail + title)
│   │   │   └── ProgressBar.tsx      # X of N videos completed
│   │   │
│   │   ├── video/                   # Video player components
│   │   │   ├── VideoPlayer.tsx      # YouTube embed wrapper
│   │   │   └── NotesPanel.tsx       # Right-side notes panel
│   │   │
│   │   ├── auth/                    # Auth components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── GoogleAuth.tsx
│   │   │
│   │   └── dashboard/               # Dashboard components
│   │       ├── CourseGrid.tsx       # Grid of courses
│   │       └── RecentActivity.tsx   # Activity feed
│   │
│   ├── pages/                        # Full page components
│   │   ├── HomePage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── CoursePage.tsx           # Curvy path + nodes view
│   │   ├── LessonPage.tsx           # Video (left) + Notes (right)
│   │   ├── ProfilePage.tsx
│   │   ├── UploadPage.tsx           # Upload YouTube playlist URL
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useProgress.ts           # Get user progress
│   │   ├── useLessons.ts            # Fetch lessons
│   │   ├── useCourse.ts             # Fetch course
│   │   ├── useAuth.ts               # Auth context hook
│   │   ├── useVideoPlayer.ts        # Video player logic
│   │   ├── useScrollReveal.ts       # Intersection observer for node reveal
│   │   └── useMediaQuery.ts         # Responsive queries
│   │
│   ├── services/                     # API services
│   │   ├── api.ts                   # Axios instance + base URL
│   │   ├── authService.ts           # Login, signup, logout
│   │   ├── courseService.ts         # Fetch courses, lessons
│   │   ├── progressService.ts       # Track user progress
│   │   ├── notesService.ts          # Save/fetch notes per lesson
│   │   └── uploadService.ts         # Upload YouTube playlist URL
│   │
│   ├── store/                        # Zustand state management
│   │   ├── authStore.ts             # User auth state
│   │   ├── courseStore.ts           # Course/lesson data
│   │   ├── progressStore.ts         # User progress
│   │   ├── uiStore.ts               # UI state (modal open, etc)
│   │   └── index.ts                 # Export all stores
│   │
│   ├── types/                        # TypeScript types
│   │   ├── index.ts
│   │   ├── course.ts
│   │   ├── lesson.ts
│   │   ├── user.ts
│   │   ├── progress.ts
│   │   └── api.ts
│   │
│   ├── utils/                        # Utility functions
│   │   ├── formatters.ts            # Format time, etc
│   │   ├── validators.ts            # Validate forms
│   │   ├── constants.ts             # App constants
│   │   └── localStorage.ts          # Local storage helpers
│   │
│   ├── styles/                       # Global styles
│   │   ├── globals.css              # Tailwind imports
│   │   └── variables.css            # CSS variables
│   │
│   ├── App.tsx                       # Main App component
│   ├── main.tsx                      # React root
│   └── vite-env.d.ts                # Vite env types
│
├── index.html                        # HTML entry point
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── Dockerfile
├── .dockerignore
└── .env.example
```

### Frontend Component Hierarchy
```
App
├── Router
│   ├── HomePage
│   │   └── Navbar
│   ├── DashboardPage
│   │   ├── Navbar
│   │   ├── CourseGrid
│   │   │   └── CourseCard
│   │   └── RecentActivity
│   ├── UploadPage
│   │   ├── Form (YouTube playlist URL input)
│   │   └── Loading spinner
│   ├── CoursePage
│   │   ├── Navbar
│   │   ├── ProgressBar (X of N completed)
│   │   └── PathGraph
│   │       └── VideoNode[] (one per playlist video, in order)
│   └── LessonPage
│       ├── Navbar
│       ├── VideoPlayer (left, ~70% width — YouTube embed)
│       └── NotesPanel (right, ~30% width — plain text notes)
└── ErrorBoundary
```

### UI/UX Philosophy
```
Keep it minimal. No animations, no decorative elements, no gamification UI.
The goal is a working, functional webapp. Visual polish comes later.

CoursePage:
- Single curvy SVG path drawn top to bottom
- Nodes placed along the path, one per video, in playlist order
- Each node: video thumbnail + title only
- Nodes are revealed progressively as the user scrolls down
  (Intersection Observer — no locking, all nodes freely clickable)
- Completed nodes get a simple visual marker (e.g. filled dot or checkmark)
- Progress bar at the top: plain "X / N completed"

LessonPage:
- Clean two-column layout, no extra chrome
- Left (~70%): YouTube embedded player
- Right (~30%): plain textarea for notes, auto-saved per lesson
- Right panel kept intentionally sparse — built to extend later
```

---

## ⚙️ BACKEND ARCHITECTURE

```
backend/
├── app/
│   ├── main.py                      # FastAPI app initialization
│   ├── config.py                    # Configuration & environment
│   │
│   ├── models/                      # SQLAlchemy ORM models
│   │   ├── base.py                  # Base model class
│   │   ├── user.py                  # User model
│   │   │   ├── id, email, password_hash
│   │   │   ├── name, avatar_url
│   │   │   ├── created_at, updated_at
│   │   │   └── relationships: courses, progress
│   │   │
│   │   ├── course.py                # Course model
│   │   │   ├── id, title, description
│   │   │   ├── created_by (user_id)
│   │   │   ├── youtube_url, thumbnail
│   │   │   ├── total_duration
│   │   │   └── relationships: lessons, progress
│   │   │
│   │   ├── lesson.py                # Lesson model
│   │   │   ├── id, title, description
│   │   │   ├── course_id, order_index  # order_index = playlist video position
│   │   │   ├── video_url, duration
│   │   │   ├── transcript, summary
│   │   │   └── relationships: progress
│   │   │
│   │   ├── progress.py              # User progress tracking
│   │   │   ├── id, user_id, lesson_id
│   │   │   ├── completed, completion_date
│   │   │   ├── time_spent
│   │   │   ├── watched_percentage
│   │   │   └── notes (TEXT)         # User's notes for this lesson
│   │   │
│   │   └── user_stats.py            # Basic stats
│   │       ├── id, user_id
│   │       ├── total_courses_completed
│   │       └── achievements (JSON)
│   │
│   ├── schemas/                     # Pydantic request/response models
│   │   ├── base.py
│   │   ├── user.py
│   │   │   ├── UserCreate
│   │   │   ├── UserLogin
│   │   │   └── UserResponse
│   │   ├── course.py
│   │   │   ├── CourseCreate
│   │   │   ├── CourseResponse
│   │   │   └── CourseDetailResponse
│   │   ├── lesson.py
│   │   ├── progress.py
│   │   └── playlist.py
│   │       └── PlaylistExtractRequest
│   │
│   ├── routes/                      # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py                  # /api/auth/*
│   │   │   ├── POST /signup
│   │   │   ├── POST /login
│   │   │   ├── POST /google-oauth
│   │   │   ├── POST /logout
│   │   │   └── GET /me
│   │   │
│   │   ├── playlists.py             # /api/playlists/*
│   │   │   ├── POST /extract        # Extract playlist → create course + lessons
│   │   │   ├── GET /{id}
│   │   │   └── GET /user/my-uploads
│   │   │
│   │   ├── courses.py               # /api/courses/*
│   │   │   ├── GET / (list all)
│   │   │   ├── GET /{id} (details)
│   │   │   ├── POST / (create)
│   │   │   ├── PUT /{id}
│   │   │   └── DELETE /{id}
│   │   │
│   │   ├── lessons.py               # /api/lessons/*
│   │   │   ├── GET /course/{course_id}   # Returns lessons in order_index order
│   │   │   ├── GET /{id}
│   │   │   └── GET /{id}/summary
│   │   │
│   │   ├── progress.py              # /api/progress/*
│   │   │   ├── GET /user/{user_id}/course/{course_id}
│   │   │   ├── POST /lesson/{lesson_id}/complete
│   │   │   ├── GET /user/stats
│   │   │   └── POST /watch-time
│   │   │
│   │   ├── notes.py                 # /api/notes/*
│   │   │   ├── GET /{lesson_id}     # Get notes for a lesson
│   │   │   └── PUT /{lesson_id}     # Save/update notes for a lesson
│   │   │
│   │   └── users.py                 # /api/users/*
│   │       ├── GET /profile
│   │       ├── PUT /profile
│   │       └── GET /stats
│   │
│   ├── services/                    # Business logic layer
│   │   ├── __init__.py
│   │   ├── youtube_service.py       # YouTube extraction
│   │   │   ├── extract_playlist_info(url)    # Returns videos in playlist order
│   │   │   ├── extract_video_metadata(url)
│   │   │   ├── get_captions(video_id)
│   │   │   └── get_thumbnail(video_id)
│   │   │
│   │   ├── llm_service.py           # Gemini API integration
│   │   │   ├── generate_summary(transcript)  # Per-video summary only
│   │   │   └── _call_gemini(prompt)          # Internal Gemini API wrapper
│   │   │
│   │   ├── database.py              # Database operations
│   │   │   ├── get_user_by_email()
│   │   │   ├── create_course()
│   │   │   ├── create_lesson()
│   │   │   ├── update_progress()
│   │   │   ├── get_user_stats()
│   │   │   ├── get_notes(user_id, lesson_id)
│   │   │   └── save_notes(user_id, lesson_id, notes)
│   │   │
│   │   ├── redis_service.py         # Redis caching
│   │   │   ├── cache_curriculum(key, data)
│   │   │   ├── get_cached_curriculum(key)
│   │   │   ├── cache_progress(user_id, data)
│   │   │   └── invalidate_cache(key)
│   │   │
│   │   ├── auth_service.py          # Authentication
│   │   │   ├── hash_password()
│   │   │   ├── verify_password()
│   │   │   ├── create_access_token()
│   │   │   └── verify_token()
│   │   │
│   │   ├── email_service.py         # Email notifications
│   │   │   ├── send_welcome_email()
│   │   │   └── send_course_completed()
│   │   │
│   │   └── s3_service.py            # (Optional) AWS S3
│   │       ├── upload_file()
│   │       ├── get_file_url()
│   │       └── delete_file()
│   │
│   ├── middleware/
│   │   ├── auth_middleware.py       # JWT verification
│   │   ├── cors_middleware.py       # CORS headers
│   │   └── error_handler.py         # Global error handling
│   │
│   ├── tasks/                       # Celery async tasks
│   │   ├── extract_video.py         # Extract video data from playlist (async)
│   │   ├── generate_summaries.py    # Generate per-video summaries via Gemini (async)
│   │   └── send_notifications.py    # Send emails (async)
│   │
│   ├── utils/
│   │   ├── validators.py            # Form/data validators
│   │   ├── constants.py             # App constants
│   │   ├── logger.py                # Logging setup
│   │   └── helpers.py               # Helper functions
│   │
│   └── __init__.py
│
├── tests/                           # Unit & integration tests
│   ├── test_auth.py
│   ├── test_courses.py
│   ├── test_progress.py
│   └── test_youtube_service.py
│
├── requirements.txt                 # Python dependencies
├── Dockerfile
├── docker-compose.yml              # Local dev database setup
├── .dockerignore
├── .env.example
├── alembic.ini                     # Database migration config
├── alembic/
│   └── versions/                   # Migration files
└── README.md
```

### Backend Request Flow
```
Client Request
    ↓
Nginx (reverse proxy)
    ↓
FastAPI Router
    ↓
Route Handler (routes/*)
    ↓
Service Layer (services/*)
    ├─ Check Redis cache
    ├─ Query PostgreSQL
    ├─ Call Gemini API (if needed — summaries only)
    └─ Update Redis cache
    ↓
Response (Pydantic model)
    ↓
Client
```

---

## 🗄️ DATABASE SCHEMA

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    name VARCHAR,
    avatar_url VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    youtube_url VARCHAR,
    thumbnail_url VARCHAR,
    total_duration INTEGER,  -- in seconds
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Lessons table
-- order_index is set from the video's position in the YouTube playlist
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    title VARCHAR NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,  -- playlist order, immutable
    video_url VARCHAR,
    duration INTEGER,  -- in seconds
    transcript TEXT,
    summary TEXT,      -- Gemini-generated summary of transcript
    created_at TIMESTAMP DEFAULT NOW()
);

-- User progress table
CREATE TABLE progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    lesson_id INTEGER REFERENCES lessons(id),
    completed BOOLEAN DEFAULT FALSE,
    completion_date TIMESTAMP,
    time_spent INTEGER,          -- in seconds
    watched_percentage FLOAT,
    notes TEXT,                  -- user's notes for this lesson
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- User stats
CREATE TABLE user_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id),
    total_courses_completed INTEGER DEFAULT 0,
    achievements JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_courses_created_by ON courses(created_by);
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_lessons_order_index ON lessons(course_id, order_index);
CREATE INDEX idx_progress_user_id ON progress(user_id);
CREATE INDEX idx_progress_lesson_id ON progress(lesson_id);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
```

---

## 🔄 API Request/Response Flow

### Example: Upload YouTube Playlist → Generate Course

```
Frontend:
POST /api/playlists/extract
{
  "youtube_url": "https://youtube.com/playlist?list=PLxxxxx"
}

Backend Route: playlists.py
    ↓
Services:
1. youtube_service.extract_playlist_info(url)
   → Get video list in playlist order
   → For each video: title, duration, thumbnail, video_url

2. For each video (async via Celery):
   llm_service.generate_summary(transcript)
   → Gemini API: "Summarize this video transcript"
   → Response: plain text summary

3. database.create_course() + create_lessons()
   → Lessons stored with order_index matching playlist position
   → Store in PostgreSQL

4. redis_service.cache_curriculum()
   → Cache for 24 hours

Response:
{
  "course_id": 123,
  "title": "Python Fundamentals",
  "lessons": [
    {
      "id": 1,
      "title": "Variables & Types",
      "order_index": 0,
      "duration": 1200,
      "thumbnail_url": "...",
      "summary": "This video covers..."
    },
    ...
  ]
}

Frontend:
Receives course_id → Redirect to /course/123
```

---

## 🔐 Authentication Flow

```
Signup:
1. User enters email + password
2. Frontend: POST /api/auth/signup
3. Backend:
   - Validate email format
   - Hash password (bcrypt)
   - Create user in PostgreSQL
   - Create user_stats record
   - Return JWT token + refresh token
4. Frontend: Store JWT in localStorage + Zustand
5. All future requests include JWT header

Login:
1. POST /api/auth/login
2. Backend:
   - Find user by email
   - Compare password hash
   - Generate JWT token (expires in 1h)
   - Generate refresh token (expires in 30d)
3. Frontend: Store tokens

Protected Routes:
- Middleware checks JWT validity
- If expired: Use refresh token to get new JWT
- If invalid: Redirect to login

Logout:
- Frontend: Clear localStorage + Zustand
- Backend: (Optional) Blacklist token in Redis
```

---

## 📊 State Management Flow (Zustand)

```
Frontend State Structure:

authStore:
├── user { id, email, name, avatar_url }
├── token (JWT)
├── isAuthenticated (boolean)
├── login(email, password)
├── logout()
└── setUser(userData)

courseStore:
├── courses [] (list of all courses)
├── currentCourse {} (viewing course details)
├── lessons [] (lessons in current course, sorted by order_index)
├── fetchCourses()
├── fetchCourse(id)
└── fetchLessons(courseId)

progressStore:
├── userProgress {} (lessons completed, keyed by lesson_id)
├── completedCount (number)
├── totalCount (number)
├── updateProgress(lessonId)
└── markComplete(lessonId)

uiStore:
├── isLoading (boolean)
├── error (string)
└── currentPage (string)
```

---

## 🚀 Deployment Pipeline

```
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

```
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

## 💾 Data Persistence

```
PostgreSQL (Primary Database):
├─ User accounts (emails, hashed passwords)
├─ Courses (metadata)
├─ Lessons (video info, transcripts, summaries — in playlist order)
├─ Progress tracking (including per-lesson notes)
└─ User stats

Redis (Cache Layer):
├─ User sessions
├─ Cached Gemini responses (summaries)
├─ Recent lesson data
└─ Rate limiting buckets

Local Storage (Frontend):
├─ JWT tokens
├─ User preferences
└─ Temporary form data

Oracle Cloud VM Storage (20GB):
├─ PostgreSQL data files
├─ Redis snapshot (RDB)
├─ Application logs
└─ Video metadata/thumbnails
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
