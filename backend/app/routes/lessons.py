from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.middleware.auth_middleware import get_current_user
from app.models.lesson import Lesson
from app.models.user import User
from app.schemas.lesson import LessonResponse
from app.services.database import get_db
from app.utils.logger import logger
from app.services.llm_service import MIN_TRANSCRIPT_LEN, MIN_DESCRIPTION_LEN, MIN_TITLE_LEN

# Minimum content thresholds — shared with generate_summary() in llm_service.py
_MIN_TRANSCRIPT_LEN = MIN_TRANSCRIPT_LEN
_MIN_DESCRIPTION_LEN = MIN_DESCRIPTION_LEN
_MIN_TITLE_LEN = MIN_TITLE_LEN

router = APIRouter()


@router.get("/course/{course_id}", response_model=List[LessonResponse])
def get_course_lessons(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all lessons for a course sorted by order_index."""
    return (
        db.query(Lesson)
        .filter(Lesson.course_id == course_id)
        .order_by(Lesson.order_index)
        .all()
    )


@router.get("/{lesson_id}", response_model=LessonResponse)
def get_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@router.get("/{lesson_id}/summary")
def get_lesson_summary(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {"summary": lesson.summary or ""}


@router.post("/{lesson_id}/generate-summary")
def generate_lesson_summary(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    On-demand AI summarization of a lesson's transcript.
    Enforces a safe max duration to prevent huge TPM hits on the LLM API.
    """
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if not lesson.transcript and lesson.video_url:
        # If the background task hasn't finished or failed, try to fetch it synchronously
        from app.services.youtube_service import get_captions, extract_video_id_from_url
        video_id = extract_video_id_from_url(lesson.video_url)
        if video_id:
            transcript = get_captions(video_id)
            if transcript:
                lesson.transcript = transcript
                db.commit()

    # If transcript is unavailable, ensure we have video description
    if not lesson.transcript and not lesson.description and lesson.video_url:
        from app.services.youtube_service import extract_video_metadata
        try:
            metadata = extract_video_metadata(lesson.video_url)
            if metadata and metadata.get("description"):
                lesson.description = metadata["description"]
                try:
                    db.commit()
                except Exception as commit_exc:
                    logger.warning(
                        "Failed to persist fetched description for lesson %s: %s",
                        lesson_id, commit_exc,
                    )
                    db.rollback()
        except Exception as meta_exc:
            logger.warning(
                "Could not fetch video metadata for lesson %s: %s",
                lesson_id, meta_exc,
            )

    has_content = bool(
        (lesson.transcript and len(lesson.transcript.strip()) >= _MIN_TRANSCRIPT_LEN)
        or (lesson.description and len(lesson.description.strip()) >= _MIN_DESCRIPTION_LEN)
        or (lesson.title and len(lesson.title.strip()) >= _MIN_TITLE_LEN)
    )

    if not has_content:
        raise HTTPException(
            status_code=400,
            detail="No transcript or video information available to summarize.",
        )

    # 2 hours = 7200 seconds. 
    # If the video is longer, we reject summarization to preserve tokens/costs.
    if lesson.duration and lesson.duration > 7200:
        raise HTTPException(
            status_code=400, 
            detail="Video is too long to generate a summary safely (limit is 2 hours)."
        )

    from app.services.llm_service import generate_summary
    
    summary_text = generate_summary(
        transcript=lesson.transcript,
        title=lesson.title,
        description=lesson.description,
    )
    if not summary_text:
        raise HTTPException(status_code=503, detail="AI generation failed or is currently unavailable.")

    lesson.summary = summary_text
    db.commit()

    return {"summary": lesson.summary}
