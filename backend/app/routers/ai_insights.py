from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.auth import get_current_user
from app.services.nlp import get_sentiment_timeline, get_commit_mood_summary
from app.services.ai import (
    generate_weekly_digest,
    generate_insight_cards,
    generate_developer_persona,
)
from app.services.cache import get_cached, set_cache, get_cache_meta, invalidate_cache

router = APIRouter()

CACHE_KEYS = {
    "digest": "weekly_digest",
    "cards": "insight_cards",
    "persona": "developer_persona",
}


# ── Sentiment (no cache — fast NLP, no Gemini) ────────────────────

@router.get("/sentiment-timeline")
def sentiment_timeline(
    days: int = 90,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_sentiment_timeline(current_user.id, db, days)


@router.get("/mood-summary")
def mood_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_commit_mood_summary(current_user.id, db)


# ── Weekly Digest (cached 7 days) ─────────────────────────────────

@router.get("/weekly-digest")
def weekly_digest(
    force_refresh: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    key = CACHE_KEYS["digest"]

    if not force_refresh:
        cached = get_cached(current_user.id, key, db)
        if cached is not None:
            meta = get_cache_meta(current_user.id, key, db)
            return {
                "digest": cached,
                "cached": True,
                "generated_at": meta["generated_at"],
                "expires_at": meta["expires_at"],
            }

    # Generate fresh
    text = generate_weekly_digest(current_user.id, db)
    set_cache(current_user.id, key, text, db)
    meta = get_cache_meta(current_user.id, key, db)

    return {
        "digest": text,
        "cached": False,
        "generated_at": meta["generated_at"],
        "expires_at": meta["expires_at"],
    }


# ── Insight Cards (cached 7 days) ─────────────────────────────────

@router.get("/insight-cards")
def insight_cards(
    force_refresh: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    key = CACHE_KEYS["cards"]

    if not force_refresh:
        cached = get_cached(current_user.id, key, db)
        if cached is not None:
            meta = get_cache_meta(current_user.id, key, db)
            return {
                "cards": cached,
                "cached": True,
                "generated_at": meta["generated_at"],
                "expires_at": meta["expires_at"],
            }

    cards = generate_insight_cards(current_user.id, db)
    set_cache(current_user.id, key, cards, db)
    meta = get_cache_meta(current_user.id, key, db)

    return {
        "cards": cards,
        "cached": False,
        "generated_at": meta["generated_at"],
        "expires_at": meta["expires_at"],
    }


# ── Developer Persona (cached 7 days) ─────────────────────────────

@router.get("/persona")
def developer_persona(
    force_refresh: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    key = CACHE_KEYS["persona"]

    if not force_refresh:
        cached = get_cached(current_user.id, key, db)
        if cached is not None:
            meta = get_cache_meta(current_user.id, key, db)
            return {**cached, "cached": True, "generated_at": meta["generated_at"]}

    persona = generate_developer_persona(current_user.id, db)
    set_cache(current_user.id, key, persona, db)
    meta = get_cache_meta(current_user.id, key, db)

    return {**persona, "cached": False, "generated_at": meta["generated_at"]}


# ── Force refresh all AI cache ────────────────────────────────────

@router.post("/refresh")
def refresh_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Invalidates all AI cache entries — Gemini regenerates on next visit."""
    for key in CACHE_KEYS.values():
        invalidate_cache(current_user.id, key, db)
    return {"message": "AI cache cleared. Fresh insights will generate on next page load."}
