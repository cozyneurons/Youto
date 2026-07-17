import hashlib
from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from app.middleware.auth_middleware import get_current_user
from app.models.course import Course
from app.models.lesson import Lesson
from app.models.user import User
from app.schemas.course import CourseDetailResponse, CourseResponse
from app.schemas.playlist import PlaylistExtractRequest
from app.services.database import get_db
from app.services.redis_service import cache_curriculum, get_cached_curriculum
from app.services.youtube_service import extract_playlist_info
from app.utils.logger import logger

router = APIRouter()


@router.post("/extract", response_model=CourseDetailResponse)
def extract_playlist(
    payload: PlaylistExtractRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Extract a YouTube playlist and persist it as a Course + Lessons.
    Returns the created course with all lessons.
    """
    url = payload.youtube_url

    # ── Cache shortcut ───────────────────────────────────────────────────────
    cache_key = f"playlist:{hashlib.md5(url.encode()).hexdigest()}:{current_user.id}"
    cached = get_cached_curriculum(cache_key)
    if cached:
        existing = db.query(Course).filter(Course.id == cached.get("course_id")).first()
        if existing:
            return existing

    # ── Extract via yt-dlp ───────────────────────────────────────────────────
    try:
        playlist_data = extract_playlist_info(url)
        videos = playlist_data.get("videos", [])
    except Exception as exc:
        logger.error("Playlist extraction failed: %s", exc)
        raise HTTPException(status_code=422, detail=f"Could not extract playlist: {exc}")

    if not videos:
        raise HTTPException(status_code=422, detail="No videos found in the playlist")

    # ── Generate Course Phases via Groq ──────────────────────────────────────
    from app.services.llm_service import generate_course_phases
    
    video_titles = [v["title"] for v in videos]
    playlist_title = playlist_data.get("title", "YouTube Playlist Course")
    
    phases = generate_course_phases(playlist_title, video_titles)
    
    # Create a mapping of video_index to phase_name
    phase_map = {}
    if isinstance(phases, list):
        for item in phases:
            if not isinstance(item, dict):
                continue
            v_idx = item.get("video_index")
            p_name = item.get("phase_name")
            if (
                isinstance(v_idx, int)
                and not isinstance(v_idx, bool)
                and 0 <= v_idx < len(videos)
                and isinstance(p_name, str)
                and p_name.strip()
            ):
                if v_idx not in phase_map:
                    phase_map[v_idx] = p_name.strip()

    # ── Persist course ───────────────────────────────────────────────────────
    course = Course(
        title=playlist_title,
        description=playlist_data.get("description") or f"Auto-generated from: {url}",
        youtube_url=url,
        thumbnail_url=videos[0].get("thumbnail_url"),
        total_duration=sum(v.get("duration", 0) for v in videos),
        created_by=current_user.id,
    )
    db.add(course)
    db.flush()  # get course.id

    # ── Persist lessons ──────────────────────────────────────────────────────
    for idx, v in enumerate(videos):
        db.add(
            Lesson(
                course_id=course.id,
                title=v["title"],
                description=v.get("description", ""),
                order_index=v["order_index"],
                video_url=v["video_url"],
                duration=v.get("duration", 0),
                phase=phase_map.get(idx)  # Apply LLM phase, or None if failed
            )
        )

    db.commit()
    db.refresh(course)

    # ── Trigger async transcript extraction ──────────────────────────────────
    from app.tasks.extract_video import extract_video_task
    # Fetch lessons to get their IDs
    lessons = db.query(Lesson).filter(Lesson.course_id == course.id).all()
    for idx, v in enumerate(videos):
        # Enqueue the Celery task to fetch captions for each video in the background
        extract_video_task.delay(v["video_id"], lessons[idx].id)

    # ── Cache result ─────────────────────────────────────────────────────────
    cache_curriculum(cache_key, {"course_id": course.id})

    return course


@router.get("/user/my-uploads", response_model=List[CourseResponse])
def my_uploads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Course).filter(Course.created_by == current_user.id).all()


@router.get("/{playlist_id}", response_model=CourseDetailResponse)
def get_playlist(
    playlist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.id == playlist_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course
