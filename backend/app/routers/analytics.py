from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional
from app.database import get_db
from app.models import Repository, Commit, PullRequest, Issue, RepositoryLanguage
from app.auth import get_current_user
from app.models import User

router = APIRouter()


def get_user_repo_ids(user_id: int, db: Session) -> list[int]:
    repos = db.query(Repository.id).filter(Repository.user_id == user_id).all()
    return [r.id for r in repos]


# ── Overview ──────────────────────────────────────────────────────

@router.get("/overview")
def get_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only count non-fork repos for commits
    non_fork_repo_ids = [
        r.id for r in db.query(Repository).filter(
            Repository.user_id == current_user.id,
            Repository.is_fork.is_(False),
        ).all()
    ]

    all_repo_ids = get_user_repo_ids(current_user.id, db)

    total_commits = db.query(func.count(Commit.id)).filter(
        Commit.repo_id.in_(non_fork_repo_ids)
    ).scalar() or 0

    active_repos = db.query(func.count(Repository.id)).filter(
        Repository.user_id == current_user.id,
        Repository.is_fork.is_(False),
    ).scalar() or 0

    prs_merged = db.query(func.count(PullRequest.id)).filter(
        PullRequest.repo_id.in_(all_repo_ids),
        PullRequest.state == "merged",
    ).scalar() or 0

    issues_resolved = db.query(func.count(Issue.id)).filter(
        Issue.repo_id.in_(all_repo_ids),
        Issue.state == "closed",
    ).scalar() or 0

    # Coding streak
    today = datetime.utcnow().date()
    streak = 0
    check_date = today
    while True:
        count = db.query(func.count(Commit.id)).filter(
            Commit.repo_id.in_(non_fork_repo_ids),
            func.date(Commit.committed_at) == check_date,
        ).scalar() or 0
        if count == 0:
            break
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
    repo_ids = get_user_repo_ids(current_user.id, db)

    one_year_ago = datetime.utcnow() - timedelta(days=365)

    rows = (
        db.query(
            func.date(Commit.committed_at).label("date"),
            func.count(Commit.id).label("count"),
        )
        .filter(
            Commit.repo_id.in_(repo_ids),
            Commit.committed_at >= one_year_ago,
        )
        .group_by(func.date(Commit.committed_at))
        .all()
    )

    return [{"date": str(row.date), "count": row.count} for row in rows]


# ── Commit Frequency ──────────────────────────────────────────────

@router.get("/commit-frequency")
def get_commit_frequency(
    range: str = Query("month", enum=["week", "month", "year"]),
    repo_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo_ids = get_user_repo_ids(current_user.id, db)
    if repo_id and repo_id in repo_ids:
        repo_ids = [repo_id]

    delta_map = {"week": 7, "month": 30, "year": 365}
    since = datetime.utcnow() - timedelta(days=delta_map[range])

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

    return [{"date": str(row.date), "count": row.count} for row in rows]


# ── Languages ─────────────────────────────────────────────────────

@router.get("/languages")
def get_languages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo_ids = get_user_repo_ids(current_user.id, db)

    rows = (
        db.query(
            RepositoryLanguage.language,
            func.sum(RepositoryLanguage.percentage).label("total"),
        )
        .filter(RepositoryLanguage.repo_id.in_(repo_ids))
        .group_by(RepositoryLanguage.language)
        .order_by(func.sum(RepositoryLanguage.percentage).desc())
        .limit(8)
        .all()
    )

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
    repo_ids = get_user_repo_ids(current_user.id, db)

    rows = (
        db.query(
            func.extract("hour", Commit.committed_at).label("hour"),
            func.count(Commit.id).label("count"),
        )
        .filter(Commit.repo_id.in_(repo_ids))
        .group_by(func.extract("hour", Commit.committed_at))
        .order_by(func.extract("hour", Commit.committed_at))
        .all()
    )

    hour_map = {int(row.hour): row.count for row in rows}
    return [
        {"hour": h, "label": f"{h:02d}:00", "count": hour_map.get(h, 0)}
        for h in range(24)
    ]


# ── PR Cycle Time ─────────────────────────────────────────────────

@router.get("/pr-cycle-time")
def get_pr_cycle_time(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo_ids = get_user_repo_ids(current_user.id, db)

    prs = (
        db.query(PullRequest)
        .filter(
            PullRequest.repo_id.in_(repo_ids),
            PullRequest.state == "merged",
            PullRequest.opened_at.isnot(None),
            PullRequest.merged_at.isnot(None),
        )
        .all()
    )

    if not prs:
        return {"average_hours": 0, "data": []}

    data = []
    for pr in prs:
        hours = (pr.merged_at - pr.opened_at).total_seconds() / 3600
        data.append({
            "title": pr.title[:40],
            "hours": round(hours, 1),
            "merged_at": str(pr.merged_at.date()),
        })

    avg = round(sum(d["hours"] for d in data) / len(data), 1)
    return {"average_hours": avg, "data": data[-30:]}


# ── Day of Week Activity ──────────────────────────────────────────

@router.get("/day-of-week")
def get_day_of_week(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo_ids = get_user_repo_ids(current_user.id, db)

    rows = (
        db.query(
            func.extract("dow", Commit.committed_at).label("dow"),
            func.count(Commit.id).label("count"),
        )
        .filter(Commit.repo_id.in_(repo_ids))
        .group_by(func.extract("dow", Commit.committed_at))
        .all()
    )

    days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    dow_map = {int(row.dow): row.count for row in rows}
    return [{"day": days[i], "count": dow_map.get(i, 0)} for i in range(7)]
