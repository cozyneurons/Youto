from pydantic import BaseModel, ConfigDict
from datetime import datetime


class LessonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    course_id: int
    title: str
    description: str | None = None
    order_index: int
    video_url: str | None = None
    duration: int | None = None
    summary: str | None = None
    created_at: datetime | None = None
