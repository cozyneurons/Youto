from datetime import date
from sqlalchemy.orm import Session
from app.tasks.extract_video import celery_app
from app.services.database import SessionLocal
from app.models.course import Course
from app.models.notification import Notification
from app.services.email_service import send_overdue_email


@celery_app.task(name="check_overdue_courses_task")
def check_overdue_courses_task():
    """Daily scheduled task to check for overdue courses and notify users."""
    db: Session = SessionLocal()
    try:
        today = date.today()
        # Find courses where deadline has passed
        overdue_courses = db.query(Course).filter(
            Course.deadline != None,
            Course.deadline < today
        ).all()

        for course in overdue_courses:
            # Check if there is already an unread overdue notification for this course
            existing_notif = db.query(Notification).filter(
                Notification.user_id == course.created_by,
                Notification.course_id == course.id,
                Notification.type == "overdue",
                Notification.is_read == False
            ).first()

            if not existing_notif:
                # Create a new notification
                notif = Notification(
                    user_id=course.created_by,
                    course_id=course.id,
                    type="overdue",
                    message=f"Your course '{course.title}' is overdue!"
                )
                db.add(notif)
                db.commit()

                # Send email notification
                # course.creator is the User model, we need their email
                if course.creator and course.creator.email:
                    send_overdue_email(course.creator.email, course.title)
    finally:
        db.close()
