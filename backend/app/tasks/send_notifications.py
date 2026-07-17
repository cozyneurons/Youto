from app.tasks.extract_video import celery_app


@celery_app.task(name="send_notification")
def send_notification_task(email: str, notification_type: str, context: dict):
    """Async task: dispatch email notifications via the email service."""
    from app.services.email_service import send_welcome_email, send_course_completed

    if notification_type == "welcome":
        send_welcome_email(email, context.get("name", ""))
    elif notification_type == "course_completed":
        send_course_completed(email, context.get("course_title", ""))
