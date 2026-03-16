from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, Repository, Commit
from app.auth import get_current_user

router = APIRouter()


def get_non_fork_repo_ids(user_id: int, db: Session) -> list[int]:
    return [
        r.id for r in db.query(Repository).filter(
            Repository.user_id == user_id,
            Repository.is_fork.is_(False),
        ).all()
    ]


@router.get("/coding-hours")
def coding_hours_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Commits grouped by hour of day — shows when the developer codes."""
    repo_ids = get_non_fork_repo_ids(current_user.id, db)

    rows = (
        db.query(
            extract("hour", Commit.committed_at).label("hour"),
            func.count(Commit.id).label("count"),
        )
        .filter(Commit.repo_id.in_(repo_ids))
        .group_by(extract("hour", Commit.committed_at))
        .all()
    )

    hour_map = {int(row.hour): row.count for row in rows}
    return [
        {
            "hour": h,
            "label": f"{h % 12 or 12}{'am' if h < 12 else 'pm'}",
            "count": hour_map.get(h, 0),
            "period": (
                "Night" if h < 6
                else "Morning" if h < 12
                else "Afternoon" if h < 18
                else "Evening"
            ),
        }
        for h in range(24)
    ]


@router.get("/streak-history")
def streak_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Daily commit counts for the past 60 days to show streaks."""
    repo_ids = get_non_fork_repo_ids(current_user.id, db)
    since = datetime.utcnow() - timedelta(days=60)

    rows = (
        db.query(
            func.date(Commit.committed_at).label("date"),
            func.count(Commit.id).label("count"),
        )
        .filter(
            Commit.repo_id.in_(repo_ids),
            Commit.committed_at >= since,
        )
        .group_by(func.date(Commit.committed_at))
        .order_by(func.date(Commit.committed_at))
        .all()
    )

    daily = {str(row.date): row.count for row in rows}

    # Current streak
    today = datetime.utcnow().date()
    current_streak = 0
    check = today
    while True:
        if daily.get(str(check), 0) > 0:
            current_streak += 1
            check -= timedelta(days=1)
        else:
            break

    # Longest streak
    all_dates = sorted(daily.keys())
    longest = 0
    run = 0
    prev = None
    for d in all_dates:
        if daily[d] > 0:
            dt = datetime.strptime(d, "%Y-%m-%d").date()
            if prev and (dt - prev).days == 1:
                run += 1
            else:
                run = 1
            prev = dt
            longest = max(longest, run)
        else:
            run = 0
            prev = None

    return {
        "current_streak": current_streak,
        "longest_streak": longest,
        "daily": [{"date": str(r.date), "count": r.count} for r in rows],
    }


@router.get("/commit-burst")
def commit_burst_detection(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Detects days with unusually high commit activity (bursts)."""
    repo_ids = get_non_fork_repo_ids(current_user.id, db)
    since = datetime.utcnow() - timedelta(days=90)

    rows = (
        db.query(
            func.date(Commit.committed_at).label("date"),
            func.count(Commit.id).label("count"),
        )
        .filter(
            Commit.repo_id.in_(repo_ids),
            Commit.committed_at >= since,
        )
        .group_by(func.date(Commit.committed_at))
        .order_by(func.count(Commit.id).desc())
        .all()
    )

    if not rows:
        return {"average": 0, "burst_days": [], "threshold": 0}

    counts = [r.count for r in rows]
    average = sum(counts) / len(counts)
    threshold = average * 2

    burst_days = [
        {"date": str(r.date), "count": r.count}
        for r in rows
        if r.count >= threshold
    ]

    return {
        "average": round(average, 1),
        "threshold": round(threshold, 1),
        "burst_days": burst_days[:10],
    }


@router.get("/summary")
def productivity_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """High level productivity stats."""
    repo_ids = get_non_fork_repo_ids(current_user.id, db)

    now = datetime.utcnow()
    this_week = now - timedelta(days=7)
    last_week_start = now - timedelta(days=14)
    last_week_end = now - timedelta(days=7)
    this_month = now - timedelta(days=30)

    commits_this_week = db.query(func.count(Commit.id)).filter(
        Commit.repo_id.in_(repo_ids),
        Commit.committed_at >= this_week,
    ).scalar() or 0

    commits_last_week = db.query(func.count(Commit.id)).filter(
        Commit.repo_id.in_(repo_ids),
        Commit.committed_at >= last_week_start,
        Commit.committed_at < last_week_end,
    ).scalar() or 0

    commits_this_month = db.query(func.count(Commit.id)).filter(
        Commit.repo_id.in_(repo_ids),
        Commit.committed_at >= this_month,
    ).scalar() or 0

    week_change = 0
    if commits_last_week > 0:
        week_change = round(((commits_this_week - commits_last_week) / commits_last_week) * 100)

    # Most active hour
    hour_row = (
        db.query(
            extract("hour", Commit.committed_at).label("hour"),
            func.count(Commit.id).label("count"),
        )
        .filter(Commit.repo_id.in_(repo_ids))
        .group_by(extract("hour", Commit.committed_at))
        .order_by(func.count(Commit.id).desc())
        .first()
    )

    peak_h = int(hour_row.hour) if hour_row else 12
    suffix = "AM" if peak_h < 12 else "PM"
    peak_label = f"{peak_h % 12 or 12}:00 {suffix}"

    return {
        "commits_this_week": commits_this_week,
        "commits_last_week": commits_last_week,
        "commits_this_month": commits_this_month,
        "week_change_pct": week_change,
        "peak_coding_hour": peak_label,
    }
