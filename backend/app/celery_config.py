import os
from celery.schedules import crontab

broker_url = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
result_backend = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

# Auto-import all task modules when worker starts
include = [
    "app.tasks.extract_video",
    "app.tasks.send_notifications",
    "app.tasks.check_overdue",
]

beat_schedule = {
    "check-overdue-courses-daily": {
        "task": "check_overdue_courses_task",
        "schedule": crontab(hour=18, minute=30),  # 18:30 UTC = 00:00 IST (midnight India)
    },
}
