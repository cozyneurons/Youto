from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.middleware.error_handler import add_error_handlers
from app.services.database import create_tables

# Import all models so SQLAlchemy registers them before create_all
import app.models  # noqa: F401

app = FastAPI(
    title="YouTube Course Converter",
    description="Convert YouTube playlists into structured courses with AI-powered summaries.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Error handlers ───────────────────────────────────────────────────────────
add_error_handlers(app)

# ── Routers ──────────────────────────────────────────────────────────────────
from app.routes import auth, playlists, courses, lessons, progress, notes, users, recommendations, notifications  # noqa: E402

app.include_router(auth.router,            prefix="/api/auth",            tags=["auth"])
app.include_router(playlists.router,       prefix="/api/playlists",       tags=["playlists"])
app.include_router(courses.router,         prefix="/api/courses",         tags=["courses"])
app.include_router(lessons.router,         prefix="/api/lessons",         tags=["lessons"])
app.include_router(progress.router,        prefix="/api/progress",        tags=["progress"])
app.include_router(notes.router,           prefix="/api/notes",           tags=["notes"])
app.include_router(users.router,           prefix="/api/users",           tags=["users"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(notifications.router,   prefix="/api/notifications",   tags=["notifications"])


# ── Lifecycle ────────────────────────────────────────────────────────────────
@app.on_event("startup")
def startup():
    create_tables()


@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok"}
