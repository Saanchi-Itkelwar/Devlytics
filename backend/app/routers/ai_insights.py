from fastapi import APIRouter, Depends
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

router = APIRouter()


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


@router.get("/weekly-digest")
def weekly_digest(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    text = generate_weekly_digest(current_user.id, db)
    return {"digest": text}


@router.get("/insight-cards")
def insight_cards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cards = generate_insight_cards(current_user.id, db)
    return {"cards": cards}


@router.get("/persona")
def developer_persona(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return generate_developer_persona(current_user.id, db)
