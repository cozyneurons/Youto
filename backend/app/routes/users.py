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


@router.get("/activity")
def get_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import func
    from app.models.progress import Progress
    from datetime import date, timedelta, datetime, timezone
    
    # Normalize completion_date to UTC calendar date to avoid timezone shift inconsistencies near midnight
    utc_date_expr = func.date(func.timezone('UTC', Progress.completion_date))
    
    # Query daily completion counts for the user
    daily_counts = (
        db.query(
            utc_date_expr.label("comp_date"),
            func.count(Progress.id).label("count")
        )
        .filter(Progress.user_id == current_user.id, Progress.completed == True, Progress.completion_date.isnot(None))
        .group_by(utc_date_expr)
        .order_by(utc_date_expr.desc())
        .all()
    )

    heatmap = {str(row.comp_date): row.count for row in daily_counts}
    
    # Calculate streaks safely (handle if DB returns string or date object)
    def parse_date(val):
        if isinstance(val, str):
            return datetime.strptime(val, "%Y-%m-%d").date()
        return val

    parsed_dates = [parse_date(row.comp_date) for row in daily_counts]
    sorted_dates = sorted(parsed_dates, reverse=True)
    
    current_streak = 0
    longest_streak = 0
    
    # Enforce explicit UTC timezone to align with database timestamps
    today = datetime.now(timezone.utc).date()
    yesterday = today - timedelta(days=1)
    
    # Calculate current streak
    if sorted_dates:
        if sorted_dates[0] == today or sorted_dates[0] == yesterday:
            current_streak = 1
            expected_date = sorted_dates[0] - timedelta(days=1)
            for d in sorted_dates[1:]:
                if d == expected_date:
                    current_streak += 1
                    expected_date -= timedelta(days=1)
                else:
                    break
                    
    # Calculate longest streak
    if sorted_dates:
        temp_longest = 1
        expected_date = sorted_dates[0] - timedelta(days=1)
        for d in sorted_dates[1:]:
            if d == expected_date:
                temp_longest += 1
            else:
                if temp_longest > longest_streak:
                    longest_streak = temp_longest
                temp_longest = 1
            expected_date = d - timedelta(days=1)
        if temp_longest > longest_streak:
            longest_streak = temp_longest
            
    return {
        "heatmap": heatmap,
        "current_streak": current_streak,
        "longest_streak": longest_streak
    }
