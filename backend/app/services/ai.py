from google import genai
from google.genai import types
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from app.models import Repository, Commit, PullRequest, Issue, RepositoryLanguage, User
import os
import json

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def build_user_context(user_id: int, db: Session) -> dict:
    repo_ids = [
        r.id for r in db.query(Repository).filter(
            Repository.user_id == user_id,
            Repository.is_fork == False,
        ).all()
    ]

    now = datetime.utcnow()
    last_week = now - timedelta(days=7)
    last_month = now - timedelta(days=30)

    weekly_commits = db.query(func.count(Commit.id)).filter(
        Commit.repo_id.in_(repo_ids),
        Commit.committed_at >= last_week,
    ).scalar() or 0

    monthly_commits = db.query(func.count(Commit.id)).filter(
        Commit.repo_id.in_(repo_ids),
        Commit.committed_at >= last_month,
    ).scalar() or 0

    dow_row = (
        db.query(
            extract("dow", Commit.committed_at).label("dow"),
            func.count(Commit.id).label("count"),
        )
        .filter(Commit.repo_id.in_(repo_ids))
        .group_by(extract("dow", Commit.committed_at))
        .order_by(func.count(Commit.id).desc())
        .first()
    )
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    most_active_day = days[int(dow_row.dow)] if dow_row else "Unknown"

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
    peak_hour_raw = int(hour_row.hour) if hour_row else 12
    suffix = "AM" if peak_hour_raw < 12 else "PM"
    peak_hour = f"{peak_hour_raw % 12 or 12}:00 {suffix}"

    lang_row = (
        db.query(
            RepositoryLanguage.language,
            func.sum(RepositoryLanguage.percentage).label("total"),
        )
        .filter(RepositoryLanguage.repo_id.in_(repo_ids))
        .group_by(RepositoryLanguage.language)
        .order_by(func.sum(RepositoryLanguage.percentage).desc())
        .first()
    )
    top_language = lang_row.language if lang_row else "Unknown"

    weekly_prs = db.query(func.count(PullRequest.id)).filter(
        PullRequest.repo_id.in_(repo_ids),
        PullRequest.opened_at >= last_week,
    ).scalar() or 0

    merged_prs = db.query(func.count(PullRequest.id)).filter(
        PullRequest.repo_id.in_(repo_ids),
        PullRequest.state == "merged",
        PullRequest.merged_at >= last_month,
    ).scalar() or 0

    total_repos = db.query(func.count(Repository.id)).filter(
        Repository.user_id == user_id,
        Repository.is_fork == False,
    ).scalar() or 0

    recent_messages = (
        db.query(Commit.message)
        .filter(
            Commit.repo_id.in_(repo_ids),
            Commit.committed_at >= last_week,
        )
        .limit(15)
        .all()
    )
    messages_sample = [m[0] for m in recent_messages if m[0]]

    return {
        "weekly_commits": weekly_commits,
        "monthly_commits": monthly_commits,
        "most_active_day": most_active_day,
        "peak_hour": peak_hour,
        "peak_hour_raw": peak_hour_raw,
        "top_language": top_language,
        "weekly_prs": weekly_prs,
        "merged_prs_month": merged_prs,
        "total_repos": total_repos,
        "recent_messages": messages_sample,
    }


def _call_gemini(prompt: str) -> str:
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=prompt,
    )
    return response.text.strip()


def generate_weekly_digest(user_id: int, db: Session) -> str:
    ctx = build_user_context(user_id, db)

    if ctx["monthly_commits"] == 0:
        return "No coding activity found yet. Sync your GitHub data to get your weekly digest."

    prompt = f"""
You are a developer analytics assistant. Write a short, friendly weekly digest 
for a developer based on their GitHub activity.

Data:
- Commits this week: {ctx['weekly_commits']}
- Commits this month: {ctx['monthly_commits']}
- Most active day: {ctx['most_active_day']}
- Peak coding hour: {ctx['peak_hour']}
- Top language: {ctx['top_language']}
- PRs opened this week: {ctx['weekly_prs']}
- PRs merged this month: {ctx['merged_prs_month']}
- Total repositories: {ctx['total_repos']}
- Recent commit messages: {ctx['recent_messages'][:5]}

Write 2-3 sentences max. Be specific, use real numbers.
Sound like a smart colleague, not a robot.
Start with "This week" or "Last week".
No markdown, no bullet points.
"""

    try:
        return _call_gemini(prompt)
    except Exception as e:
        return f"Unable to generate digest: {str(e)}"


def generate_insight_cards(user_id: int, db: Session) -> list:
    ctx = build_user_context(user_id, db)

    if ctx["monthly_commits"] == 0:
        return []

    prompt = f"""
You are a developer analytics AI. Generate exactly 4 insight cards based on this activity.

Data:
- Commits this week: {ctx['weekly_commits']}
- Commits this month: {ctx['monthly_commits']}
- Most active day: {ctx['most_active_day']}
- Peak coding hour: {ctx['peak_hour']}
- Top language: {ctx['top_language']}
- PRs merged this month: {ctx['merged_prs_month']}
- Total repos: {ctx['total_repos']}

Return ONLY a JSON array, no markdown, no explanation:
[
  {{
    "type": "positive",
    "emoji": "⚡",
    "title": "Short title",
    "insight": "One sentence using real numbers, under 15 words"
  }}
]

Rules:
- type must be: "positive", "warning", or "neutral"
- At least 2 positive, 1 neutral, 1 warning
- Each insight must reference actual numbers
- No markdown in output
"""

    try:
        text = _call_gemini(prompt)
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        cards = json.loads(text.strip())
        return cards if isinstance(cards, list) else _fallback_insight_cards(ctx)
    except Exception:
        return _fallback_insight_cards(ctx)


def _fallback_insight_cards(ctx: dict) -> list:
    cards = []
    if ctx["weekly_commits"] > 0:
        cards.append({
            "type": "positive",
            "emoji": "⚡",
            "title": "Active Week",
            "insight": f"You made {ctx['weekly_commits']} commits this week.",
        })
    cards.append({
        "type": "neutral",
        "emoji": "📅",
        "title": "Peak Day",
        "insight": f"{ctx['most_active_day']} is your most productive day.",
    })
    cards.append({
        "type": "neutral",
        "emoji": "🌙",
        "title": "Coding Hours",
        "insight": f"You code most at {ctx['peak_hour']}.",
    })
    if ctx["top_language"] != "Unknown":
        cards.append({
            "type": "positive",
            "emoji": "🧠",
            "title": "Top Language",
            "insight": f"{ctx['top_language']} dominates your recent commits.",
        })
    return cards


def generate_developer_persona(user_id: int, db: Session) -> dict:
    ctx = build_user_context(user_id, db)

    if ctx["monthly_commits"] == 0:
        return {
            "persona": "Unknown",
            "traits": [],
            "radar": {},
            "peak_time": "—",
            "top_language": "—",
            "most_active_day": "—",
        }

    peak_h = ctx["peak_hour_raw"]
    time_trait = (
        "Night Owl" if peak_h >= 20 or peak_h <= 3
        else "Early Bird" if 6 <= peak_h <= 11
        else "Afternoon Coder"
    )

    backend_langs = {"Python", "Go", "Rust", "Java", "C++", "C", "Ruby", "PHP"}
    frontend_langs = {"JavaScript", "TypeScript", "CSS", "HTML", "Vue", "Svelte"}
    lang = ctx["top_language"]

    focus_trait = (
        "Backend Builder" if lang in backend_langs
        else "Frontend Craftsman" if lang in frontend_langs
        else "Full Stack Developer"
    )

    collab_trait = (
        "High PR Velocity" if ctx["merged_prs_month"] > 5
        else "Commit Machine" if ctx["weekly_commits"] > 10
        else "Steady Contributor"
    )

    persona_map = {
        ("Night Owl", "Backend Builder"): "Night Owl Builder",
        ("Night Owl", "Frontend Craftsman"): "Midnight UI Artist",
        ("Night Owl", "Full Stack Developer"): "Nocturnal Hacker",
        ("Early Bird", "Backend Builder"): "Dawn Engineer",
        ("Early Bird", "Frontend Craftsman"): "Sunrise Designer",
        ("Early Bird", "Full Stack Developer"): "Morning Architect",
        ("Afternoon Coder", "Backend Builder"): "Systematic Engineer",
        ("Afternoon Coder", "Frontend Craftsman"): "Creative Developer",
        ("Afternoon Coder", "Full Stack Developer"): "Balanced Builder",
    }

    return {
        "persona": persona_map.get((time_trait, focus_trait), "Dedicated Developer"),
        "traits": [time_trait, focus_trait, collab_trait, f"{lang} specialist"],
        "radar": {
            "Consistency": min(100, ctx["monthly_commits"] * 2),
            "Speed": min(100, ctx["merged_prs_month"] * 10),
            "Focus": 75 if lang in backend_langs else 65,
            "Collaboration": min(100, ctx["weekly_prs"] * 15),
            "Exploration": min(100, ctx["total_repos"] * 5),
        },
        "peak_time": ctx["peak_hour"],
        "top_language": lang,
        "most_active_day": ctx["most_active_day"],
    }
