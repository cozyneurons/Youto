from app.tasks.extract_video import celery_app
from app.services.llm_service import MIN_TITLE_LEN, MIN_TRANSCRIPT_LEN, MIN_DESCRIPTION_LEN


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
        # Match the route's accepted inputs: content must meet generate_summary's minimums
        has_content = lesson and not lesson.summary and (
            (lesson.transcript and len(lesson.transcript.strip()) >= MIN_TRANSCRIPT_LEN)
            or (lesson.description and len(lesson.description.strip()) >= MIN_DESCRIPTION_LEN)
            or (lesson.title and len(lesson.title.strip()) >= MIN_TITLE_LEN)
        )
        if has_content:
            result = generate_summary(
                lesson.transcript,
                title=lesson.title,
                description=lesson.description,
            )
            if not result:
                # generate_summary returned empty — retry so transient API errors are recovered
                raise ValueError(f"generate_summary returned empty for lesson {lesson_id}")
            lesson.summary = result
            db.commit()
    except Exception as exc:
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
    finally:
        db.close()
