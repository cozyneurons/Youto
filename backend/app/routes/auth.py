from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from app.services.database import get_db
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
)
from app.services.email_service import send_welcome_email
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.models.user import User
from app.models.user_stats import UserStats
from app.middleware.auth_middleware import get_current_user

router = APIRouter()


@router.post("/signup", response_model=TokenResponse)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    """Create a new user account and return JWT tokens."""
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        name=payload.name or payload.email.split("@")[0],
    )
    db.add(user)
    db.flush()  # populate user.id before creating stats

    db.add(UserStats(user_id=user.id))
    db.commit()
    db.refresh(user)

    send_welcome_email(user.email, user.name or "")

    return TokenResponse(
        access_token=create_access_token({"sub": str(user.id)}),
        refresh_token=create_refresh_token({"sub": str(user.id)}),
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticate a user and return JWT tokens."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return TokenResponse(
        access_token=create_access_token({"sub": str(user.id)}),
        refresh_token=create_refresh_token({"sub": str(user.id)}),
        user=UserResponse.model_validate(user),
    )


@router.post("/google-oauth")
def google_oauth():
    """Google OAuth sign-in — TODO: not yet implemented."""
    # TODO: Implement Google OAuth flow
    raise HTTPException(status_code=501, detail="Google OAuth not yet implemented")


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """Log out — client should discard tokens. Optionally blacklist in Redis."""
    # TODO: Optionally blacklist the token in Redis for strict revocation
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return current_user
