from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.models.base import Base


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    order_index = Column(Integer, nullable=False)  # immutable — from playlist position
    video_url = Column(String)
    duration = Column(Integer)  # seconds
    transcript = Column(Text)
    summary = Column(Text)      # Gemini-generated summary
    phase = Column(String)      # Groq-generated course phase name
    extraction_status = Column(String, default="pending")  # pending, processing, completed, failed, pending_retry
    extraction_attempts = Column(Integer, default=0)
    extraction_error = Column(Text, nullable=True)
    processing_started_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    course = relationship("Course", back_populates="lessons")
    progress = relationship("Progress", back_populates="lesson", cascade="all, delete-orphan")
