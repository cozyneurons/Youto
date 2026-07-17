from celery import Celery
from app.config import settings

celery_app = Celery(
    "youto",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.task_routes = {
    "extract_video": {"queue": "default"},
    "generate_summary": {"queue": "default"},
    "send_notification": {"queue": "default"},
}


@celery_app.task(name="extract_video", bind=True, max_retries=3)
def extract_video_task(self, video_id: str, lesson_id: int):
    """
    Async task: fetch captions for a video and update the Lesson record.
    Retries up to 3 times on failure with exponential back-off.
    """
    from app.services.database import SessionLocal
    from app.services.youtube_service import get_captions
    from app.models.lesson import Lesson

    db = SessionLocal()
    try:
        caption_url = get_captions(video_id)
        if caption_url:
            lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
            if lesson:
                lesson.transcript = caption_url
                db.commit()
    except Exception as exc:
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
    finally:
        db.close()
