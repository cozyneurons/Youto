from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.middleware.auth_middleware import get_current_user
from app.models.progress import Progress
from app.models.user import User
from app.services.database import get_db

router = APIRouter()


class NotesPayload(BaseModel):
    notes: str


@router.get("/{lesson_id}")
def get_notes(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve the user's notes for a specific lesson."""
    prog = (
        db.query(Progress)
        .filter(Progress.user_id == current_user.id, Progress.lesson_id == lesson_id)
        .first()
    )
    return {"notes": prog.notes if prog else ""}


@router.put("/{lesson_id}")
def save_notes(
    lesson_id: int,
    payload: NotesPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save or update the user's notes for a specific lesson."""
    prog = (
        db.query(Progress)
        .filter(Progress.user_id == current_user.id, Progress.lesson_id == lesson_id)
        .first()
    )
    if not prog:
        prog = Progress(user_id=current_user.id, lesson_id=lesson_id, notes=payload.notes)
        db.add(prog)
    else:
        prog.notes = payload.notes

    db.commit()
    return {"saved": True}
