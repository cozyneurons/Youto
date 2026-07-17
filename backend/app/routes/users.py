from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.models.user_stats import UserStats
from app.schemas.user import UserResponse
from app.services.database import get_db

router = APIRouter()


class ProfileUpdate(BaseModel):
    name: str | None = None
    avatar_url: str | None = None


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.name is not None:
        current_user.name = payload.name
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
    if not stats:
        return {"total_courses_completed": 0, "achievements": []}
    return {
        "total_courses_completed": stats.total_courses_completed,
        "achievements": stats.achievements or [],
    }
