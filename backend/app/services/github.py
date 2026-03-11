import httpx
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import Repository, Commit, PullRequest, Issue, RepositoryLanguage
import asyncio


BASE_URL = "https://api.github.com"
HEADERS = lambda token: {
    "Authorization": f"Bearer {token}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}


async def fetch_github_repos(token: str) -> list:
    repos = []
    page = 1
    async with httpx.AsyncClient(timeout=30) as client:
        while True:
            res = await client.get(
                f"{BASE_URL}/user/repos",
                headers=HEADERS(token),
                params={"per_page": 100, "page": page, "sort": "updated", "affiliation": "owner"},
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


async def fetch_repo_commits(token: str, full_name: str, username: str) -> list:
    commits = []
    page = 1
    async with httpx.AsyncClient(timeout=30) as client:
        while page <= 5:  # cap at 500 commits per repo
            res = await client.get(
                f"{BASE_URL}/repos/{full_name}/commits",
                headers=HEADERS(token),
                params={"per_page": 100, "page": page, "author": username},
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


async def fetch_repo_pull_requests(token: str, full_name: str) -> list:
    prs = []
    async with httpx.AsyncClient(timeout=30) as client:
        for state in ["open", "closed"]:
            page = 1
            while page <= 3:
                res = await client.get(
                    f"{BASE_URL}/repos/{full_name}/pulls",
                    headers=HEADERS(token),
                    params={"per_page": 100, "page": page, "state": state},
                )
                if res.status_code != 200:
                    break
                data = res.json()
                if not data:
                    break
                prs.extend(data)
                page += 1
                if len(data) < 100:
                    break
    return prs


async def fetch_repo_issues(token: str, full_name: str) -> list:
    issues = []
    async with httpx.AsyncClient(timeout=30) as client:
        for state in ["open", "closed"]:
            page = 1
            while page <= 3:
                res = await client.get(
                    f"{BASE_URL}/repos/{full_name}/issues",
                    headers=HEADERS(token),
                    params={"per_page": 100, "page": page, "state": state},
                )
                if res.status_code != 200:
                    break
                data = res.json()
                if not data:
                    break
                # GitHub returns PRs in issues endpoint — filter them out
                real_issues = [i for i in data if "pull_request" not in i]
                issues.extend(real_issues)
                page += 1
                if len(data) < 100:
                    break
    return issues


async def fetch_repo_languages(token: str, full_name: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.get(
            f"{BASE_URL}/repos/{full_name}/languages",
            headers=HEADERS(token),
        )
        if res.status_code == 200:
            return res.json()
    return {}


def parse_github_datetime(dt_str: str | None) -> datetime | None:
    if not dt_str:
        return None
    try:
        return datetime.strptime(dt_str, "%Y-%m-%dT%H:%M:%SZ")
    except Exception:
        return None


async def sync_github_data(user_id: int, token: str, username: str, db: Session):
    """Main GitHub sync function — fetches all data and stores in DB."""

    # 1. Fetch all repos
    raw_repos = await fetch_github_repos(token)

    for raw_repo in raw_repos:
        full_name = raw_repo["full_name"]

        # Upsert repository
        repo = db.query(Repository).filter(
            Repository.full_name == full_name,
            Repository.user_id == user_id,
        ).first()

        if not repo:
            repo = Repository(user_id=user_id, source="github")
            db.add(repo)

        repo.name = raw_repo["name"]
        repo.full_name = full_name
        repo.description = raw_repo.get("description")
        repo.language = raw_repo.get("language")
        repo.stars = raw_repo.get("stargazers_count", 0)
        repo.forks = raw_repo.get("forks_count", 0)
        repo.is_private = raw_repo.get("private", False)
        repo.last_activity = parse_github_datetime(raw_repo.get("pushed_at"))
        db.commit()
        db.refresh(repo)

        # 2. Languages
        raw_langs = await fetch_repo_languages(token, full_name)
        if raw_langs:
            db.query(RepositoryLanguage).filter(
                RepositoryLanguage.repo_id == repo.id
            ).delete()
            total = sum(raw_langs.values()) or 1
            for lang, bytes_count in raw_langs.items():
                db.add(RepositoryLanguage(
                    repo_id=repo.id,
                    language=lang,
                    percentage=round((bytes_count / total) * 100),
                ))
            db.commit()

        # 3. Commits
        raw_commits = await fetch_repo_commits(token, full_name, username)
        existing_shas = {
            c.sha for c in db.query(Commit).filter(Commit.repo_id == repo.id).all()
        }
        for raw_commit in raw_commits:
            sha = raw_commit.get("sha")
            if sha in existing_shas:
                continue
            commit_data = raw_commit.get("commit", {})
            author_data = commit_data.get("author", {})
            db.add(Commit(
                repo_id=repo.id,
                sha=sha,
                message=commit_data.get("message", "")[:500],
                committed_at=parse_github_datetime(author_data.get("date")),
                author=author_data.get("name"),
            ))
        db.commit()

        # 4. Pull Requests
        raw_prs = await fetch_repo_pull_requests(token, full_name)
        db.query(PullRequest).filter(PullRequest.repo_id == repo.id).delete()
        for raw_pr in raw_prs:
            db.add(PullRequest(
                repo_id=repo.id,
                title=raw_pr.get("title", "")[:255],
                state="merged" if raw_pr.get("merged_at") else raw_pr.get("state", "open"),
                opened_at=parse_github_datetime(raw_pr.get("created_at")),
                merged_at=parse_github_datetime(raw_pr.get("merged_at")),
                closed_at=parse_github_datetime(raw_pr.get("closed_at")),
            ))
        db.commit()

        # 5. Issues
        raw_issues = await fetch_repo_issues(token, full_name)
        db.query(Issue).filter(Issue.repo_id == repo.id).delete()
        for raw_issue in raw_issues:
            db.add(Issue(
                repo_id=repo.id,
                title=raw_issue.get("title", "")[:255],
                state=raw_issue.get("state", "open"),
                opened_at=parse_github_datetime(raw_issue.get("created_at")),
                closed_at=parse_github_datetime(raw_issue.get("closed_at")),
            ))
        db.commit()

        # Small delay to respect GitHub rate limits
        await asyncio.sleep(0.3)
