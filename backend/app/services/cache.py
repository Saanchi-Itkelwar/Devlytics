from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models import AICache
import json


CACHE_TTL_DAYS = 7


def get_cached(user_id: int, cache_key: str, db: Session):
    """
    Returns cached content if it exists and has not expired.
    Returns None if cache is missing or stale.
    """
    record = db.query(AICache).filter(
        AICache.user_id == user_id,
        AICache.cache_key == cache_key,
    ).first()

    if not record:
        return None

    if datetime.utcnow() > record.expires_at:
        return None

    try:
        return json.loads(record.content)
    except Exception:
        return None


def set_cache(user_id: int, cache_key: str, content, db: Session):
    """
    Stores or updates cached content with a TTL of 7 days.
    """
    record = db.query(AICache).filter(
        AICache.user_id == user_id,
        AICache.cache_key == cache_key,
    ).first()

    now = datetime.utcnow()
    expires_at = now + timedelta(days=CACHE_TTL_DAYS)
    serialized = json.dumps(content)

    if record:
        record.content = serialized
        record.generated_at = now
        record.expires_at = expires_at
    else:
        record = AICache(
            user_id=user_id,
            cache_key=cache_key,
            content=serialized,
            generated_at=now,
            expires_at=expires_at,
        )
        db.add(record)

    db.commit()


def get_cache_meta(user_id: int, cache_key: str, db: Session):
    """
    Returns metadata about the cache entry — when it was generated and when it expires.
    """
    record = db.query(AICache).filter(
        AICache.user_id == user_id,
        AICache.cache_key == cache_key,
    ).first()

    if not record:
        return None

    return {
        "generated_at": record.generated_at,
        "expires_at": record.expires_at,
        "is_expired": datetime.utcnow() > record.expires_at,
    }


def invalidate_cache(user_id: int, cache_key: str, db: Session):
    """
    Force-deletes a cache entry so it regenerates on next request.
    """
    db.query(AICache).filter(
        AICache.user_id == user_id,
        AICache.cache_key == cache_key,
    ).delete()
    db.commit()
