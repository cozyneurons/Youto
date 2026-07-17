from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.middleware.auth_middleware import get_current_user
from app.models.lesson import Lesson
from app.models.progress import Progress
from app.models.user import User
from app.models.user_stats import UserStats
from app.schemas.progress import CourseProgressResponse, WatchTimeUpdate
from app.services.database import get_db

router = APIRouter()


@router.get("/user/{user_id}/course/{course_id}", response_model=CourseProgressResponse)
def get_course_progress(
    user_id: int,
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return completion stats for a user + course pair."""
    lesson_ids = [
        row.id
        for row in db.query(Lesson.id).filter(Lesson.course_id == course_id).all()
    ]
    total = len(lesson_ids)
    completed = (
        db.query(Progress)
        .filter(
            Progress.user_id == current_user.id,
            Progress.lesson_id.in_(lesson_ids),
            Progress.completed == True,  # noqa: E712
        )
        .count()
    )
    percentage = round(completed / total * 100, 1) if total > 0 else 0.0
    return CourseProgressResponse(completed=completed, total=total, percentage=percentage)


@router.post("/lesson/{lesson_id}/complete")
def mark_complete(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a lesson as completed for the current user."""
    prog = (
        db.query(Progress)
        .filter(Progress.user_id == current_user.id, Progress.lesson_id == lesson_id)
        .first()
    )
    if not prog:
        prog = Progress(user_id=current_user.id, lesson_id=lesson_id)
        db.add(prog)

    prog.completed = True
    prog.completion_date = datetime.now(timezone.utc)
    db.commit()
    return {"completed": True}


@router.post("/watch-time")
def update_watch_time(
    payload: WatchTimeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update watch-time / percentage for a lesson."""
    prog = (
        db.query(Progress)
        .filter(Progress.user_id == current_user.id, Progress.lesson_id == payload.lesson_id)
        .first()
    )
    if not prog:
        prog = Progress(user_id=current_user.id, lesson_id=payload.lesson_id)
        db.add(prog)

    prog.time_spent = payload.time_spent
    prog.watched_percentage = payload.watched_percentage
    db.commit()
    return {"updated": True}


@router.get("/user/stats")
def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
    if not stats:
        return {"total_courses_completed": 0, "achievements": []}
    return {
        "total_courses_completed": stats.total_courses_completed,
        "achievements": stats.achievements or [],
    }
