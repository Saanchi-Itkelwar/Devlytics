from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from datetime import datetime, timedelta
from typing import Optional
from app.database import get_db
from app.models import User, Repository, Commit, PullRequest, Issue, RepositoryLanguage
from app.auth import get_current_user

router = APIRouter()


# ── Overview ──────────────────────────────────────────────────────

@router.get("/overview")
def get_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id

    repo_ids = [
        r.id for r in db.query(Repository.id)
        .filter(Repository.user_id == user_id).all()
    ]

    total_commits = db.query(func.count(Commit.id))\
        .filter(Commit.repo_id.in_(repo_ids)).scalar() or 0

    active_repos = db.query(func.count(Repository.id))\
        .filter(Repository.user_id == user_id).scalar() or 0

    prs_merged = db.query(func.count(PullRequest.id))\
        .filter(
            PullRequest.repo_id.in_(repo_ids),
            PullRequest.state == "merged"
        ).scalar() or 0

    issues_resolved = db.query(func.count(Issue.id))\
        .filter(
            Issue.repo_id.in_(repo_ids),
            Issue.state == "closed"
        ).scalar() or 0

    # ── Coding Streak ─────────────────────────────────────────────────
    from datetime import timezone, date
    import pytz

    rows = db.query(
        func.date(Commit.committed_at).label("date")
    ).filter(
        Commit.repo_id.in_(repo_ids)
    ).distinct().all()

    commit_dates = set()
    for row in rows:
        if row.date:
            if isinstance(row.date, str):
                commit_dates.add(date.fromisoformat(row.date))
            else:
                commit_dates.add(row.date)

    # Use IST for "today" since user is in India
    ist = pytz.timezone("Asia/Kolkata")
    today = datetime.now(ist).date()
    streak = 0
    check_date = today

    # Allow yesterday too in case today's commits haven't happened yet
    if today not in commit_dates:
        check_date = today - timedelta(days=1)

    while check_date in commit_dates:
        streak += 1
        check_date -= timedelta(days=1)

    return {
        "total_commits": total_commits,
        "active_repos": active_repos,
        "prs_merged": prs_merged,
        "issues_resolved": issues_resolved,
        "coding_streak": streak,
    }


# ── Heatmap ───────────────────────────────────────────────────────

@router.get("/heatmap")
def get_heatmap(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id
    repo_ids = [
        r.id for r in db.query(Repository.id)
        .filter(Repository.user_id == user_id).all()
    ]

    one_year_ago = datetime.utcnow() - timedelta(days=365)

    rows = db.query(
        func.date(Commit.committed_at).label("date"),
        func.count(Commit.id).label("count"),
    ).filter(
        Commit.repo_id.in_(repo_ids),
        Commit.committed_at >= one_year_ago,
    ).group_by(
        func.date(Commit.committed_at)
    ).all()

    return [{"date": str(row.date), "count": row.count} for row in rows]


# ── Commit Frequency ──────────────────────────────────────────────

@router.get("/commit-frequency")
def get_commit_frequency(
    period: str = Query("month", enum=["week", "month", "year"]),
    repo_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id

    if repo_id:
        repo = db.query(Repository).filter(
            Repository.id == repo_id,
            Repository.user_id == user_id
        ).first()
        repo_ids = [repo.id] if repo else []
    else:
        repo_ids = [
            r.id for r in db.query(Repository.id)
            .filter(Repository.user_id == user_id).all()
        ]

    if period == "week":
        since = datetime.utcnow() - timedelta(days=7)
    elif period == "month":
        since = datetime.utcnow() - timedelta(days=30)
    else:
        since = datetime.utcnow() - timedelta(days=365)

    rows = db.query(
        func.date(Commit.committed_at).label("date"),
        func.count(Commit.id).label("count"),
    ).filter(
        Commit.repo_id.in_(repo_ids),
        Commit.committed_at >= since,
    ).group_by(
        func.date(Commit.committed_at)
    ).order_by(
        func.date(Commit.committed_at)
    ).all()

    return [{"date": str(row.date), "count": row.count} for row in rows]


# ── Languages ─────────────────────────────────────────────────────

@router.get("/languages")
def get_languages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id
    repo_ids = [
        r.id for r in db.query(Repository.id)
        .filter(Repository.user_id == user_id).all()
    ]

    rows = db.query(
        RepositoryLanguage.language,
        func.sum(RepositoryLanguage.percentage).label("total"),
    ).filter(
        RepositoryLanguage.repo_id.in_(repo_ids),
    ).group_by(
        RepositoryLanguage.language
    ).order_by(
        func.sum(RepositoryLanguage.percentage).desc()
    ).limit(8).all()

    total = sum(r.total for r in rows) or 1
    return [
        {
            "language": row.language,
            "percentage": round((row.total / total) * 100),
        }
        for row in rows
    ]


# ── Coding Time ───────────────────────────────────────────────────

@router.get("/coding-time")
def get_coding_time(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id
    repo_ids = [
        r.id for r in db.query(Repository.id)
        .filter(Repository.user_id == user_id).all()
    ]

    rows = db.query(
        func.extract("hour", Commit.committed_at).label("hour"),
        func.count(Commit.id).label("count"),
    ).filter(
        Commit.repo_id.in_(repo_ids),
    ).group_by(
        func.extract("hour", Commit.committed_at)
    ).order_by(
        func.extract("hour", Commit.committed_at)
    ).all()

    # Build full 24-hour array (fill missing hours with 0)
    hour_map = {int(row.hour): row.count for row in rows}
    return [
        {"hour": h, "count": hour_map.get(h, 0)}
        for h in range(24)
    ]


# ── PR Cycle Time ─────────────────────────────────────────────────

@router.get("/pr-cycle-time")
def get_pr_cycle_time(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id
    repo_ids = [
        r.id for r in db.query(Repository.id)
        .filter(Repository.user_id == user_id).all()
    ]

    merged_prs = db.query(PullRequest).filter(
        PullRequest.repo_id.in_(repo_ids),
        PullRequest.state == "merged",
        PullRequest.opened_at.isnot(None),
        PullRequest.merged_at.isnot(None),
    ).all()

    if not merged_prs:
        return {"average_hours": 0, "data": []}

    durations = []
    for pr in merged_prs:
        delta = pr.merged_at - pr.opened_at
        hours = round(delta.total_seconds() / 3600, 1)
        durations.append({
            "title": pr.title[:40],
            "hours": hours,
            "merged_at": str(pr.merged_at.date()) if pr.merged_at else None,
        })

    durations.sort(key=lambda x: x["merged_at"] or "")
    avg = round(sum(d["hours"] for d in durations) / len(durations), 1)

    return {"average_hours": avg, "data": durations[-30:]}  # last 30 PRs


# ── Day of Week Activity ──────────────────────────────────────────

@router.get("/day-of-week")
def get_day_of_week(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id
    repo_ids = [
        r.id for r in db.query(Repository.id)
        .filter(Repository.user_id == user_id).all()
    ]

    rows = db.query(
        func.extract("dow", Commit.committed_at).label("dow"),
        func.count(Commit.id).label("count"),
    ).filter(
        Commit.repo_id.in_(repo_ids),
    ).group_by(
        func.extract("dow", Commit.committed_at)
    ).all()

    days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    dow_map = {int(row.dow): row.count for row in rows}
    return [
        {"day": days[i], "count": dow_map.get(i, 0)}
        for i in range(7)
    ]
