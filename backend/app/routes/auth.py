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
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse, GoogleOAuthRequest
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


@router.post("/google-oauth", response_model=TokenResponse)
def google_oauth(payload: GoogleOAuthRequest, db: Session = Depends(get_db)):
    """Google OAuth sign-in/up."""
    from google.oauth2 import id_token
    from google.auth.transport import requests
    import uuid
    from app.config import settings
    
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID is not configured on the backend")

    import httpx

    # If the frontend uses Implicit Grant, it sends an access_token instead of an id_token.
    # We fetch the user's profile from the Google UserInfo endpoint using this token.
    token = payload.id_token
    try:
        with httpx.Client() as client:
            response = client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token}"}
            )
        
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Google access token")
            
        user_info = response.json()
        email = user_info.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Google token missing email")
            
        name = user_info.get("name")
        picture = user_info.get("picture")

        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Auto-signup
            user = User(
                email=email,
                password_hash=hash_password(str(uuid.uuid4())),
                name=name or email.split("@")[0],
                avatar_url=picture
            )
            db.add(user)
            db.flush()
            db.add(UserStats(user_id=user.id))
            db.commit()
            db.refresh(user)
            send_welcome_email(user.email, user.name or "")
            
        return TokenResponse(
            access_token=create_access_token({"sub": str(user.id)}),
            refresh_token=create_refresh_token({"sub": str(user.id)}),
            user=UserResponse.model_validate(user),
        )
    except httpx.RequestError as e:
        print(f"Network error verifying token: {e}")
        raise HTTPException(status_code=500, detail="Failed to reach Google verification server")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in google_oauth: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """Log out — client should discard tokens. Optionally blacklist in Redis."""
    # TODO: Optionally blacklist the token in Redis for strict revocation
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return current_user
