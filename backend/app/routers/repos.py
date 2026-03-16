from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Repository, Commit, PullRequest, Issue, RepositoryLanguage
from app.auth import get_current_user
from app.models import User

router = APIRouter()


@router.get("/")
def get_repos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repos = (
        db.query(Repository)
        .filter(Repository.user_id == current_user.id)
        .order_by(Repository.last_activity.desc())
        .all()
    )

    result = []
    for repo in repos:
        commit_count = db.query(func.count(Commit.id)).filter(
            Commit.repo_id == repo.id
        ).scalar() or 0

        pr_count = db.query(func.count(PullRequest.id)).filter(
            PullRequest.repo_id == repo.id
        ).scalar() or 0

        issue_count = db.query(func.count(Issue.id)).filter(
            Issue.repo_id == repo.id
        ).scalar() or 0

        result.append({
            "id": repo.id,
            "name": repo.name,
            "full_name": repo.full_name,
            "description": repo.description,
            "source": repo.source,
            "language": repo.language,
            "stars": repo.stars,
            "forks": repo.forks,
            "is_private": repo.is_private,
            "last_activity": repo.last_activity,
            "commit_count": commit_count,
            "pr_count": pr_count,
            "issue_count": issue_count,
        })

    return result


@router.get("/{repo_id}")
def get_repo_detail(
    repo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = db.query(Repository).filter(
        Repository.id == repo_id,
        Repository.user_id == current_user.id,
    ).first()

    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    # Commit frequency last 30 days
    from datetime import datetime, timedelta
    since = datetime.utcnow() - timedelta(days=30)
    commit_freq = (
        db.query(
            func.date(Commit.committed_at).label("date"),
            func.count(Commit.id).label("count"),
        )
        .filter(Commit.repo_id == repo_id, Commit.committed_at >= since)
        .group_by(func.date(Commit.committed_at))
        .order_by(func.date(Commit.committed_at))
        .all()
    )

    # Languages
    languages = db.query(RepositoryLanguage).filter(
        RepositoryLanguage.repo_id == repo_id
    ).all()

    # PR stats
    total_prs = db.query(func.count(PullRequest.id)).filter(
        PullRequest.repo_id == repo_id
    ).scalar() or 0

    merged_prs = db.query(func.count(PullRequest.id)).filter(
        PullRequest.repo_id == repo_id,
        PullRequest.state == "merged",
    ).scalar() or 0

    # Issue stats
    total_issues = db.query(func.count(Issue.id)).filter(
        Issue.repo_id == repo_id
    ).scalar() or 0

    closed_issues = db.query(func.count(Issue.id)).filter(
        Issue.repo_id == repo_id,
        Issue.state == "closed",
    ).scalar() or 0

    total_commits = db.query(func.count(Commit.id)).filter(
        Commit.repo_id == repo_id
    ).scalar() or 0

    return {
        "id": repo.id,
        "name": repo.name,
        "full_name": repo.full_name,
        "description": repo.description,
        "source": repo.source,
        "language": repo.language,
        "stars": repo.stars,
        "forks": repo.forks,
        "is_private": repo.is_private,
        "last_activity": repo.last_activity,
        "total_commits": total_commits,
        "total_prs": total_prs,
        "merged_prs": merged_prs,
        "total_issues": total_issues,
        "closed_issues": closed_issues,
        "commit_frequency": [
            {"date": str(r.date), "count": r.count} for r in commit_freq
        ],
        "languages": [
            {"language": lang.language, "percentage": lang.percentage} for lang in languages
        ],
    }
