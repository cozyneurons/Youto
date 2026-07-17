from sqlalchemy import (
    Column, Integer, Float, Boolean, Text, DateTime,
    ForeignKey, UniqueConstraint, func,
)
from sqlalchemy.orm import relationship
from app.models.base import Base


class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False, index=True)
    completed = Column(Boolean, default=False)
    completion_date = Column(DateTime)
    time_spent = Column(Integer, default=0)        # seconds
    watched_percentage = Column(Float, default=0.0)
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson"),
    )

    user = relationship("User", back_populates="progress")
    lesson = relationship("Lesson", back_populates="progress")
