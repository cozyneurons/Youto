"""
Redis caching service.
Gracefully degrades (no-op) when Redis is unavailable.
"""
from __future__ import annotations

import json
from typing import Any, Optional

from app.config import settings
from app.utils.logger import logger

CACHE_TTL_DEFAULT = 86400   # 24 hours
CACHE_TTL_PROGRESS = 300    # 5 minutes

_redis = None

try:
    import redis as redis_lib
    _redis = redis_lib.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=2)
    _redis.ping()
    logger.info("Redis connected: %s", settings.REDIS_URL)
except Exception as exc:
    _redis = None
    logger.warning("Redis unavailable (%s) — caching disabled", exc)


def _get(key: str) -> Optional[str]:
    if not _redis:
        return None
    try:
        return _redis.get(key)
    except Exception as exc:
        logger.debug("Redis GET error: %s", exc)
        return None


def _set(key: str, value: str, ttl: int) -> None:
    if not _redis:
        return
    try:
        _redis.setex(key, ttl, value)
    except Exception as exc:
        logger.debug("Redis SET error: %s", exc)


def cache_curriculum(key: str, data: Any, ttl: int = CACHE_TTL_DEFAULT) -> None:
    _set(key, json.dumps(data), ttl)


def get_cached_curriculum(key: str) -> Optional[Any]:
    raw = _get(key)
    if raw is None:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def cache_progress(user_id: int, data: Any, ttl: int = CACHE_TTL_PROGRESS) -> None:
    _set(f"progress:{user_id}", json.dumps(data), ttl)


def get_cached_progress(user_id: int) -> Optional[Any]:
    return get_cached_curriculum(f"progress:{user_id}")


def invalidate_cache(key: str) -> None:
    if not _redis:
        return
    try:
        _redis.delete(key)
    except Exception as exc:
        logger.debug("Redis DELETE error: %s", exc)


def revoke_refresh_token(jti: str, ttl_days: int = 30) -> None:
    # TTL should ideally match the remaining life of the token, but a fixed upper bound is safe.
    ttl_seconds = ttl_days * 24 * 60 * 60
    _set(f"revoked_token:{jti}", "1", ttl_seconds)


class RedisUnavailableError(Exception):
    pass


def is_refresh_token_revoked(jti: str) -> bool:
    if not _redis:
        raise RedisUnavailableError("Redis is not configured or unavailable")
    try:
        return _redis.get(f"revoked_token:{jti}") is not None
    except Exception as exc:
        logger.error("Redis error checking token revocation: %s", exc)
        raise RedisUnavailableError("Redis encountered an error") from exc
