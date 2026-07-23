from celery import Celery
from app.config import settings

celery_app = Celery("youto")
celery_app.config_from_object("app.celery_config")

celery_app.conf.task_routes = {
    "extract_video": {"queue": "celery"},
    "generate_summary": {"queue": "celery"},
    "send_notification": {"queue": "celery"},
    "check_overdue_courses_task": {"queue": "celery"},
}


@celery_app.task(name="extract_video", bind=True, max_retries=3)
def extract_video_task(self, video_id: str, lesson_id: int):
    """
    Async task: fetch captions and full metadata (like description) for a video 
    and update the Lesson record.
    Retries up to 3 times on failure with exponential back-off.
    """
    from app.services.database import SessionLocal
    from app.services.youtube_service import get_captions, extract_video_metadata
    from app.models.lesson import Lesson
    from app.utils.logger import logger

    db = SessionLocal()
    try:
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            return

        # Fetch transcript
        transcript_text = get_captions(video_id)
        if transcript_text:
            lesson.transcript = transcript_text
            
        # Fetch individual video metadata for description if it's empty
        if not lesson.description:
            try:
                metadata = extract_video_metadata(f"https://www.youtube.com/watch?v={video_id}")
                if metadata and metadata.get("description"):
                    db.refresh(lesson, attribute_names=["description"])
                    if not lesson.description:
                        lesson.description = metadata["description"]
            except Exception as meta_exc:
                logger.warning(f"Failed to fetch metadata for {video_id}: {meta_exc}")
                
        # Fallback: if we STILL have no description, but we have a transcript, generate one using Gemini
        if not lesson.description and getattr(lesson, 'transcript', None):
            try:
                from app.services.llm_service import generate_summary
                ai_desc = generate_summary(lesson.transcript)
                if ai_desc:
                    lesson.description = f"**AI Generated Description:**\n\n{ai_desc}"
            except Exception as ai_exc:
                logger.warning(f"Failed to generate AI fallback description for {video_id}: {ai_exc}")
                
        db.commit()
    except Exception as exc:
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
    finally:
        db.close()
