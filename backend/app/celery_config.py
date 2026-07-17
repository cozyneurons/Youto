import os
from celery.schedules import crontab

broker_url = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
result_backend = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

beat_schedule = {
    "check-overdue-courses-daily": {
        "task": "check_overdue_courses_task",
        "schedule": crontab(hour=0, minute=0),  # Midnight UTC daily
    },
}
