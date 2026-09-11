def extract_video_task(video_id: str, lesson_id: int):
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

        # Mark as processing
        from datetime import datetime, timezone
        lesson.extraction_status = "processing"
        lesson.extraction_attempts = (lesson.extraction_attempts or 0) + 1
        lesson.processing_started_at = datetime.now(timezone.utc)
        db.commit()

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
                
        # Mark as completed
        lesson.extraction_status = "completed"
        lesson.extraction_error = None
        db.commit()
    except Exception as exc:
        logger.error(f"Failed to extract video {video_id}: {exc}")
        if 'lesson' in locals() and lesson:
            lesson.extraction_error = str(exc)
            if (lesson.extraction_attempts or 0) >= 3:
                lesson.extraction_status = "failed"
            else:
                lesson.extraction_status = "pending_retry"
            db.commit()
    finally:
        db.close()
