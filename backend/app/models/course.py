from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.models.base import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"), index=True)
    youtube_url = Column(String)
    thumbnail_url = Column(String)
    total_duration = Column(Integer)  # seconds
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    creator = relationship("User", back_populates="courses")
    lessons = relationship(
        "Lesson",
        back_populates="course",
        order_by="Lesson.order_index",
        cascade="all, delete-orphan",
    )
