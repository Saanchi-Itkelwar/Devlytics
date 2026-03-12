import httpx
from datetime import datetime
from datetime import timezone
from sqlalchemy.orm import Session
from app.models import Repository, Commit, PullRequest, Issue, RepositoryLanguage
import asyncio


BASE_URL = "https://gitlab.com/api/v4"
HEADERS = lambda token: {"Authorization": f"Bearer {token}"}


async def fetch_gitlab_repos(token: str) -> list:
    repos = []
    page = 1
    async with httpx.AsyncClient(timeout=30) as client:
        while True:
            res = await client.get(
                f"{BASE_URL}/projects",
                headers=HEADERS(token),
                params={
                    "per_page": 100,
                    "page": page,
                    "owned": True,
                    "order_by": "last_activity_at",
                },
            )
            if res.status_code != 200:
                break
            data = res.json()
            if not data:
                break
            repos.extend(data)
            page += 1
            if len(data) < 100:
                break
    return repos


async def fetch_gitlab_commits(token: str, project_id: int) -> list:
    commits = []
    page = 1
    async with httpx.AsyncClient(timeout=30) as client:
        while page <= 5:
            res = await client.get(
                f"{BASE_URL}/projects/{project_id}/repository/commits",
                headers=HEADERS(token),
                params={"per_page": 100, "page": page},
            )
            if res.status_code != 200:
                break
            data = res.json()
            if not data:
                break
            commits.extend(data)
            page += 1
            if len(data) < 100:
                break
    return commits


async def fetch_gitlab_merge_requests(token: str, project_id: int) -> list:
    mrs = []
    async with httpx.AsyncClient(timeout=30) as client:
        for state in ["opened", "merged", "closed"]:
            page = 1
            while page <= 3:
                res = await client.get(
                    f"{BASE_URL}/projects/{project_id}/merge_requests",
                    headers=HEADERS(token),
                    params={"per_page": 100, "page": page, "state": state},
                )
                if res.status_code != 200:
                    break
                data = res.json()
                if not data:
                    break
                mrs.extend(data)
                page += 1
                if len(data) < 100:
                    break
    return mrs


async def fetch_gitlab_issues(token: str, project_id: int) -> list:
    issues = []
    async with httpx.AsyncClient(timeout=30) as client:
        for state in ["opened", "closed"]:
            page = 1
            while page <= 3:
                res = await client.get(
                    f"{BASE_URL}/projects/{project_id}/issues",
                    headers=HEADERS(token),
                    params={"per_page": 100, "page": page, "state": state},
                )
                if res.status_code != 200:
                    break
                data = res.json()
                if not data:
                    break
                issues.extend(data)
                page += 1
                if len(data) < 100:
                    break
    return issues


async def fetch_gitlab_languages(token: str, project_id: int) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.get(
            f"{BASE_URL}/projects/{project_id}/languages",
            headers=HEADERS(token),
        )
        if res.status_code == 200:
            return res.json()
    return {}


def parse_gitlab_datetime(dt_str: str | None) -> datetime | None:
    if not dt_str:
        return None
    try:
        if dt_str.endswith("Z"):
            dt_str = dt_str[:-1] + "+00:00"
        dt = datetime.fromisoformat(dt_str)
        if dt.tzinfo is not None:
            dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
        return dt
    except Exception:
        return None


async def sync_gitlab_data(user_id: int, token: str, db: Session):
    """Main GitLab sync function."""

    raw_repos = await fetch_gitlab_repos(token)

    for raw_repo in raw_repos:
        project_id = raw_repo["id"]
        full_name = raw_repo["path_with_namespace"]

        repo = db.query(Repository).filter(
            Repository.full_name == full_name,
            Repository.user_id == user_id,
        ).first()

        if not repo:
            repo = Repository(user_id=user_id, source="gitlab")
            db.add(repo)

        repo.name = raw_repo["name"]
        repo.full_name = full_name
        repo.description = raw_repo.get("description")
        repo.language = None
        repo.stars = raw_repo.get("star_count", 0)
        repo.forks = raw_repo.get("forks_count", 0)
        repo.is_private = raw_repo.get("visibility") != "public"
        repo.last_activity = parse_gitlab_datetime(raw_repo.get("last_activity_at"))
        db.commit()
        db.refresh(repo)

        # Languages
        raw_langs = await fetch_gitlab_languages(token, project_id)
        if raw_langs:
            db.query(RepositoryLanguage).filter(
                RepositoryLanguage.repo_id == repo.id
            ).delete()
            for lang, pct in raw_langs.items():
                db.add(RepositoryLanguage(
                    repo_id=repo.id,
                    language=lang,
                    percentage=round(pct),
                ))
            db.commit()
            # Set primary language
            if raw_langs:
                repo.language = max(raw_langs, key=raw_langs.get)
                db.commit()

        # Commits
        raw_commits = await fetch_gitlab_commits(token, project_id)
        existing_shas = {
            c.sha for c in db.query(Commit).filter(Commit.repo_id == repo.id).all()
        }
        for raw_commit in raw_commits:
            sha = raw_commit.get("id")
            if sha in existing_shas:
                continue
            db.add(Commit(
                repo_id=repo.id,
                sha=sha,
                message=raw_commit.get("title", "")[:500],
                committed_at=parse_gitlab_datetime(raw_commit.get("committed_date")),
                author=raw_commit.get("author_name"),
            ))
        db.commit()

        # Merge Requests (same as PRs)
        raw_mrs = await fetch_gitlab_merge_requests(token, project_id)
        db.query(PullRequest).filter(PullRequest.repo_id == repo.id).delete()
        for raw_mr in raw_mrs:
            db.add(PullRequest(
                repo_id=repo.id,
                title=raw_mr.get("title", "")[:255],
                state="merged" if raw_mr.get("state") == "merged" else raw_mr.get("state", "open"),
                opened_at=parse_gitlab_datetime(raw_mr.get("created_at")),
                merged_at=parse_gitlab_datetime(raw_mr.get("merged_at")),
                closed_at=parse_gitlab_datetime(raw_mr.get("closed_at")),
            ))
        db.commit()

        # Issues
        raw_issues = await fetch_gitlab_issues(token, project_id)
        db.query(Issue).filter(Issue.repo_id == repo.id).delete()
        for raw_issue in raw_issues:
            db.add(Issue(
                repo_id=repo.id,
                title=raw_issue.get("title", "")[:255],
                state=raw_issue.get("state", "open"),
                opened_at=parse_gitlab_datetime(raw_issue.get("created_at")),
                closed_at=parse_gitlab_datetime(raw_issue.get("closed_at")),
            ))
        db.commit()

        await asyncio.sleep(0.3)
