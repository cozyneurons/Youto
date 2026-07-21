from pydantic import BaseModel, ConfigDict
from datetime import datetime


class ProgressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    lesson_id: int
    completed: bool = False
    completion_date: datetime | None = None
    time_spent: int = 0
    watched_percentage: float = 0.0
    notes: str | None = None


class ProgressUpdate(BaseModel):
    watched_percentage: float | None = None
    time_spent: int | None = None


class WatchTimeUpdate(BaseModel):
    lesson_id: int
    time_spent: int
    watched_percentage: float


class CourseProgressResponse(BaseModel):
    completed: int
    total: int
    percentage: float
