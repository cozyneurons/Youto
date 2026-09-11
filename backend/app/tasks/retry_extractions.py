from fastapi import BackgroundTasks
from app.services.database import SessionLocal
from app.models.lesson import Lesson
from app.tasks.extract_video import extract_video_task
from app.utils.logger import logger
from sqlalchemy import or_

def retry_incomplete_extractions(background_tasks: BackgroundTasks):
    """Find and re-queue any lessons that failed to extract or got stuck processing."""
    db = SessionLocal()
    try:
        # Find lessons that are pending_retry, or stuck in processing/pending
        # (Assuming if they are stuck in processing for a while, we should just retry them. 
        from datetime import datetime, timedelta, timezone
        from sqlalchemy import or_, and_
        
        one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)

        # Find lessons that are pending, pending_retry, or stuck in processing for > 1 hour
        lessons_to_retry = db.query(Lesson).filter(
            or_(
                Lesson.extraction_status == "pending",
                Lesson.extraction_status == "pending_retry",
                and_(
                    Lesson.extraction_status == "processing",
                    Lesson.processing_started_at < one_hour_ago
                )
            ),
            Lesson.extraction_attempts < 3
        ).all()
        
        count = 0
        for lesson in lessons_to_retry:
            if lesson.video_url:
                # Extract the video ID from the URL. Example: https://www.youtube.com/watch?v=VIDEO_ID
                video_id = lesson.video_url.split("v=")[-1] if "v=" in lesson.video_url else None
                if video_id:
                    background_tasks.add_task(extract_video_task, video_id, lesson.id)
                    count += 1
                    
        logger.info(f"Queued {count} lessons for retry extraction.")
        return count
    finally:
        db.close()
