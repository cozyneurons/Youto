"""
Recommendation API routes.
GET /api/recommendations?topic=X&level=Y
Results are cached in Redis by topic+level to avoid redundant API calls.
"""
from __future__ import annotations

import hashlib

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.services.database import get_db
from app.services.recommendation_service import get_recommendation
from app.services.redis_service import cache_curriculum, get_cached_curriculum
from app.utils.logger import logger

router = APIRouter()

CACHE_TTL_RECOMMENDATIONS = 60 * 60 * 6  # 6 hours


@router.get("/")
def recommend(
    topic: str = Query(..., min_length=1, max_length=100, description="Learning topic, e.g. 'Python'"),
    level: str = Query("Beginner", description="Skill level: Beginner | Intermediate | Advanced"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return an AI-powered playlist recommendation based on Reddit sentiment + YouTube metadata.
    Responses are cached in Redis for 6 hours per topic+level combination.
    """
    cache_key = f"recs:{hashlib.md5(f'{topic.lower()}:{level.lower()}'.encode()).hexdigest()}"

    # Check cache first
    cached = get_cached_curriculum(cache_key)
    if cached:
        logger.info("Serving recommendation from cache for topic='%s'", topic)
        return {**cached, "_cached": True}

    # Generate fresh recommendation
    result = get_recommendation(topic, level)

    if "error" in result:
        status = 424 if "API keys" in result["error"] else 503
        raise HTTPException(status_code=status, detail=result["error"])

    # Cache the result
    cache_curriculum(cache_key, result, ttl=CACHE_TTL_RECOMMENDATIONS)

    return {**result, "_cached": False}
