from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func, Index
from sqlalchemy.orm import relationship
from app.models.base import Base


class CourseShare(Base):
    __tablename__ = "course_shares"
    
    __table_args__ = (
        Index(
            'ix_unique_course_share_friend',
            'owner_id', 'course_id', 'friend_id',
            unique=True,
            postgresql_where='friend_id IS NOT NULL',
            sqlite_where='friend_id IS NOT NULL'
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    friend_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
    
    course = relationship("Course", foreign_keys=[course_id])
    owner = relationship("User", foreign_keys=[owner_id])
    friend = relationship("User", foreign_keys=[friend_id])
