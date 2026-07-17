"""Email notification service — stub for future Sendgrid/SMTP integration."""
from app.utils.logger import logger


def send_welcome_email(email: str, name: str) -> None:
    # TODO: Implement with Sendgrid SDK or smtplib
    logger.info("[EMAIL STUB] Welcome email → %s (%s)", email, name)


def send_course_completed(email: str, course_title: str) -> None:
    # TODO: Implement with Sendgrid SDK or smtplib
    logger.info("[EMAIL STUB] Course complete email → %s | course: %s", email, course_title)
