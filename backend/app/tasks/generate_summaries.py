from app.tasks.extract_video import celery_app


@celery_app.task(name="generate_summary", bind=True, max_retries=3)
def generate_summary_task(self, lesson_id: int):
    """
    Async task: generate a Gemini summary for a lesson's transcript
    and store it back in the Lesson row.
    """
    from app.services.database import SessionLocal
    from app.services.llm_service import generate_summary
    from app.models.lesson import Lesson

    db = SessionLocal()
    try:
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if lesson and lesson.transcript and not lesson.summary:
            lesson.summary = generate_summary(lesson.transcript)
            db.commit()
    except Exception as exc:
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
    finally:
        db.close()
