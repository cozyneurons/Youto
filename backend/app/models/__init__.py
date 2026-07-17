# Register all models so SQLAlchemy discovers them for create_all / Alembic
from app.models.user import User
from app.models.course import Course
from app.models.lesson import Lesson
from app.models.progress import Progress
from app.models.user_stats import UserStats
from app.models.notification import Notification

__all__ = ["User", "Course", "Lesson", "Progress", "UserStats", "Notification"]
