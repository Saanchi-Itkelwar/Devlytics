from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, Repository, Commit, PullRequest, Issue, RepositoryLanguage
from app.auth import get_current_user

router = APIRouter()


@router.get("/")
def get_repositories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repos = db.query(Repository)\
        .filter(Repository.user_id == current_user.id)\
        .order_by(Repository.last_activity.desc())\
        .all()

    result = []
    for repo in repos:
        commit_count = db.query(func.count(Commit.id))\
            .filter(Commit.repo_id == repo.id).scalar() or 0
        pr_count = db.query(func.count(PullRequest.id))\
            .filter(PullRequest.repo_id == repo.id).scalar() or 0
        issue_count = db.query(func.count(Issue.id))\
            .filter(Issue.repo_id == repo.id).scalar() or 0
        languages = db.query(RepositoryLanguage)\
            .filter(RepositoryLanguage.repo_id == repo.id)\
            .order_by(RepositoryLanguage.percentage.desc()).all()

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
            "last_activity": str(repo.last_activity.date()) if repo.last_activity else None,
            "commits": commit_count,
            "pull_requests": pr_count,
            "issues": issue_count,
            "languages": [
                {"language": l.language, "percentage": l.percentage}
                for l in languages[:5]
            ],
        })

    return result


@router.get("/{repo_id}")
def get_repository_detail(
    repo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = db.query(Repository).filter(
        Repository.id == repo_id,
        Repository.user_id == current_user.id
    ).first()

    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    # Commit frequency (last 30 days)
    from datetime import datetime, timedelta
    since = datetime.utcnow() - timedelta(days=30)
    commit_freq = db.query(
        func.date(Commit.committed_at).label("date"),
        func.count(Commit.id).label("count"),
    ).filter(
        Commit.repo_id == repo.id,
        Commit.committed_at >= since,
    ).group_by(func.date(Commit.committed_at))\
     .order_by(func.date(Commit.committed_at)).all()

    # Language breakdown
    languages = db.query(RepositoryLanguage)\
        .filter(RepositoryLanguage.repo_id == repo.id)\
        .order_by(RepositoryLanguage.percentage.desc()).all()

    # PR stats
    total_prs = db.query(func.count(PullRequest.id))\
        .filter(PullRequest.repo_id == repo.id).scalar() or 0
    merged_prs = db.query(func.count(PullRequest.id))\
        .filter(PullRequest.repo_id == repo.id, PullRequest.state == "merged")\
        .scalar() or 0

    # Issue stats
    total_issues = db.query(func.count(Issue.id))\
        .filter(Issue.repo_id == repo.id).scalar() or 0
    closed_issues = db.query(func.count(Issue.id))\
        .filter(Issue.repo_id == repo.id, Issue.state == "closed")\
        .scalar() or 0

    # Recent commits
    recent_commits = db.query(Commit)\
        .filter(Commit.repo_id == repo.id)\
        .order_by(Commit.committed_at.desc())\
        .limit(10).all()

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
        "last_activity": str(repo.last_activity.date()) if repo.last_activity else None,
        "commit_frequency": [
            {"date": str(r.date), "count": r.count} for r in commit_freq
        ],
        "languages": [
            {"language": l.language, "percentage": l.percentage}
            for l in languages
        ],
        "pr_stats": {
            "total": total_prs,
            "merged": merged_prs,
            "open": total_prs - merged_prs,
        },
        "issue_stats": {
            "total": total_issues,
            "closed": closed_issues,
            "open": total_issues - closed_issues,
        },
        "recent_commits": [
            {
                "message": c.message,
                "author": c.author,
                "committed_at": str(c.committed_at),
            }
            for c in recent_commits
        ],
    }
