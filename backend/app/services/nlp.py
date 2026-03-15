from textblob import TextBlob
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Commit, Repository
from datetime import datetime, timedelta


POSITIVE_WORDS = {
    "implement", "add", "create", "feature", "improve", "enhance",
    "optimize", "refactor", "complete", "finish", "resolve", "fix",
    "clean", "update", "upgrade", "release", "deploy", "success",
    "done", "working", "initial", "setup", "init",
}

NEGATIVE_WORDS = {
    "bug", "fix", "broken", "error", "fail", "issue", "problem",
    "crash", "revert", "hotfix", "urgent", "hack", "temp", "todo",
    "workaround", "stupid", "wtf", "debug", "patch",
}


def analyze_commit_sentiment(message: str) -> dict:
    """
    Analyze a commit message and return sentiment score and label.
    Returns score between -1 (negative) and 1 (positive).
    """
    if not message or len(message.strip()) < 3:
        return {"score": 0.0, "label": "neutral"}

    msg_lower = message.lower()
    blob = TextBlob(message)
    base_score = blob.sentiment.polarity

    # Boost score based on dev-specific keyword context
    word_boost = 0.0
    words = set(msg_lower.split())

    positive_matches = words.intersection(POSITIVE_WORDS)
    negative_matches = words.intersection(NEGATIVE_WORDS)

    if positive_matches:
        word_boost += 0.15 * len(positive_matches)
    if negative_matches:
        word_boost -= 0.1 * len(negative_matches)

    final_score = max(-1.0, min(1.0, base_score + word_boost))

    if final_score > 0.2:
        label = "positive"
    elif final_score < -0.15:
        label = "negative"
    else:
        label = "neutral"

    return {"score": round(final_score, 3), "label": label}


def get_sentiment_timeline(user_id: int, db: Session, days: int = 90) -> list:
    """
    Returns weekly sentiment averages over the past N days.
    """
    repo_ids = [
        r.id for r in db.query(Repository).filter(
            Repository.user_id == user_id,
            Repository.is_fork == False,
        ).all()
    ]

    if not repo_ids:
        return []

    since = datetime.utcnow() - timedelta(days=days)
    commits = (
        db.query(Commit)
        .filter(
            Commit.repo_id.in_(repo_ids),
            Commit.committed_at >= since,
            Commit.message.isnot(None),
        )
        .order_by(Commit.committed_at)
        .all()
    )

    if not commits:
        return []

    # Group into weekly buckets
    weekly = {}
    for commit in commits:
        if not commit.committed_at:
            continue
        # Get start of the week (Monday)
        dt = commit.committed_at
        week_start = dt - timedelta(days=dt.weekday())
        week_key = week_start.strftime("%Y-%m-%d")

        sentiment = analyze_commit_sentiment(commit.message)

        if week_key not in weekly:
            weekly[week_key] = {"scores": [], "labels": {"positive": 0, "neutral": 0, "negative": 0}}

        weekly[week_key]["scores"].append(sentiment["score"])
        weekly[week_key]["labels"][sentiment["label"]] += 1

    result = []
    for week, data in sorted(weekly.items()):
        scores = data["scores"]
        avg_score = sum(scores) / len(scores) if scores else 0
        total = len(scores)
        result.append({
            "week": week,
            "avg_score": round(avg_score, 3),
            "total_commits": total,
            "positive": data["labels"]["positive"],
            "neutral": data["labels"]["neutral"],
            "negative": data["labels"]["negative"],
        })

    return result


def get_commit_mood_summary(user_id: int, db: Session) -> dict:
    """
    Returns overall sentiment breakdown across all commits.
    """
    repo_ids = [
        r.id for r in db.query(Repository).filter(
            Repository.user_id == user_id,
            Repository.is_fork == False,
        ).all()
    ]

    if not repo_ids:
        return {"positive": 0, "neutral": 0, "negative": 0, "dominant_mood": "neutral"}

    since = datetime.utcnow() - timedelta(days=90)
    commits = (
        db.query(Commit.message)
        .filter(
            Commit.repo_id.in_(repo_ids),
            Commit.committed_at >= since,
        )
        .limit(500)
        .all()
    )

    counts = {"positive": 0, "neutral": 0, "negative": 0}
    for (message,) in commits:
        if message:
            label = analyze_commit_sentiment(message)["label"]
            counts[label] += 1

    dominant = max(counts, key=counts.get)
    total = sum(counts.values()) or 1

    return {
        "positive": round((counts["positive"] / total) * 100),
        "neutral": round((counts["neutral"] / total) * 100),
        "negative": round((counts["negative"] / total) * 100),
        "dominant_mood": dominant,
        "total_analyzed": total,
    }
