from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, timedelta
from typing import Optional
from app.database import get_db
from app.models import User, Repository, Commit, PullRequest, Issue
from app.auth import get_current_user

router = APIRouter()


@router.get("/")
def get_timeline(
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    filter: Optional[str] = Query(None, enum=["commit", "pr", "issue"]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo_map = {
        r.id: r.name for r in db.query(Repository).filter(
            Repository.user_id == current_user.id
        ).all()
    }
    repo_ids = list(repo_map.keys())

    events = []

    if not filter or filter == "commit":
        commits = (
            db.query(Commit)
            .filter(Commit.repo_id.in_(repo_ids))
            .order_by(Commit.committed_at.desc())
            .limit(100)
            .all()
        )
        for c in commits:
            if c.committed_at:
                events.append({
                    "type": "commit",
                    "id": f"commit-{c.id}",
                    "title": c.message.split("\n")[0][:80] if c.message else "Commit",
                    "repo": repo_map.get(c.repo_id, "Unknown"),
                    "timestamp": c.committed_at.isoformat(),
                    "meta": c.author or "",
                })

    if not filter or filter == "pr":
        prs = (
            db.query(PullRequest)
            .filter(PullRequest.repo_id.in_(repo_ids))
            .order_by(PullRequest.opened_at.desc())
            .limit(100)
            .all()
        )
        for pr in prs:
            ts = pr.merged_at or pr.opened_at
            if ts:
                events.append({
                    "type": "pr",
                    "id": f"pr-{pr.id}",
                    "title": pr.title[:80] if pr.title else "Pull Request",
                    "repo": repo_map.get(pr.repo_id, "Unknown"),
                    "timestamp": ts.isoformat(),
                    "meta": pr.state,
                })

    if not filter or filter == "issue":
        issues = (
            db.query(Issue)
            .filter(Issue.repo_id.in_(repo_ids))
            .order_by(Issue.opened_at.desc())
            .limit(100)
            .all()
        )
        for issue in issues:
            if issue.opened_at:
                events.append({
                    "type": "issue",
                    "id": f"issue-{issue.id}",
                    "title": issue.title[:80] if issue.title else "Issue",
                    "repo": repo_map.get(issue.repo_id, "Unknown"),
                    "timestamp": issue.opened_at.isoformat(),
                    "meta": issue.state,
                })

    events.sort(key=lambda x: x["timestamp"], reverse=True)

    return {
        "total": len(events),
        "events": events[offset: offset + limit],
    }
