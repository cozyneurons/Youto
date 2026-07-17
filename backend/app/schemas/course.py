from __future__ import annotations
from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import List, TYPE_CHECKING


class CourseCreate(BaseModel):
    title: str
    description: str | None = None
    youtube_url: str
    thumbnail_url: str | None = None
    total_duration: int | None = None
    deadline: date | None = None


class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    youtube_url: str | None = None
    thumbnail_url: str | None = None
    total_duration: int | None = None
    deadline: date | None = None


class CourseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None = None
    youtube_url: str | None = None
    thumbnail_url: str | None = None
    total_duration: int | None = None
    deadline: date | None = None
    created_by: int | None = None
    created_at: datetime | None = None


class CourseDetailResponse(CourseResponse):
    lessons: List[LessonResponse] = []


# Avoid circular import — resolve after LessonResponse is defined
from app.schemas.lesson import LessonResponse  # noqa: E402
CourseDetailResponse.model_rebuild()
