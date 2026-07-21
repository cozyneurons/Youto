"""Email notification service — using smtplib."""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.utils.logger import logger
from app.config import settings

def _send_email(to_email: str, subject: str, html_body: str) -> None:
    if not settings.SMTP_HOST or not settings.SMTP_PORT:
        logger.warning("[EMAIL SKIP] SMTP not configured. Would have sent '%s' to %s", subject, to_email)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM_EMAIL
    msg["To"] = to_email

    msg.attach(MIMEText(html_body, "html"))

    try:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        logger.info("[EMAIL SENT] %s -> %s", subject, to_email)
    except Exception as e:
        logger.error("[EMAIL ERROR] Failed to send email to %s: %s", to_email, str(e))


def send_welcome_email(email: str, name: str) -> None:
    subject = "Welcome to Youto!"
    html_body = f"""
    <html>
      <body>
        <h2>Welcome to Youto, {name}!</h2>
        <p>We are excited to have you on board. Start turning your YouTube distractions into structured courses today.</p>
      </body>
    </html>
    """
    _send_email(email, subject, html_body)


def send_course_completed(email: str, course_title: str) -> None:
    subject = "Congratulations! Course Completed"
    html_body = f"""
    <html>
      <body>
        <h2>You did it!</h2>
        <p>You have successfully completed the course: <strong>{course_title}</strong>.</p>
        <p>Keep up the great work and start your next learning journey!</p>
      </body>
    </html>
    """
    _send_email(email, subject, html_body)


def send_overdue_email(email: str, course_title: str) -> None:
    subject = "Reminder: Your Youto course is overdue!"
    html_body = f"""
    <html>
      <body>
        <h2>Course Overdue Reminder</h2>
        <p>Hey there, just a quick reminder that your course <strong>{course_title}</strong> is overdue.</p>
        <p>Log in to Youto to get back on track and finish what you started!</p>
      </body>
    </html>
    """
    _send_email(email, subject, html_body)
