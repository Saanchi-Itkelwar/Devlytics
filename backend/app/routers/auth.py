from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from app.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
import httpx
import os

router = APIRouter()

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
GITLAB_CLIENT_ID = os.getenv("GITLAB_CLIENT_ID")
GITLAB_CLIENT_SECRET = os.getenv("GITLAB_CLIENT_SECRET")
FRONTEND_URL = "http://localhost:5173"


# ── Email / Password ──────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        full_name=body.full_name,
        email=body.email,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token}


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


# ── GitHub OAuth ──────────────────────────────────────────────────

@router.get("/github")
def github_login():
    url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&scope=read:user,user:email,repo"
    )
    return RedirectResponse(url)


@router.get("/github/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        # Exchange code for token
        token_res = await client.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
            },
            headers={"Accept": "application/json"},
        )
        token_data = token_res.json()
        github_token = token_data.get("access_token")

        if not github_token:
            raise HTTPException(status_code=400, detail="GitHub OAuth failed")

        # Get GitHub user info
        user_res = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {github_token}"},
        )
        github_user = user_res.json()

        # Get primary email if not public
        email = github_user.get("email")
        if not email:
            emails_res = await client.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"Bearer {github_token}"},
            )
            emails = emails_res.json()
            primary = next((e for e in emails if e.get("primary")), None)
            email = primary["email"] if primary else f"{github_user['login']}@github.local"

    # Find or create user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            github_username=github_user.get("login"),
            github_access_token=github_token,
        )
        db.add(user)
    else:
        user.github_username = github_user.get("login")
        user.github_access_token = github_token

    db.commit()
    db.refresh(user)

    app_token = create_access_token({"sub": str(user.id)})
    return RedirectResponse(f"{FRONTEND_URL}/auth/callback?token={app_token}")


# ── GitLab OAuth ──────────────────────────────────────────────────

@router.get("/gitlab")
def gitlab_login():
    url = (
        f"https://gitlab.com/oauth/authorize"
        f"?client_id={GITLAB_CLIENT_ID}"
        f"&redirect_uri=http://localhost:8000/api/auth/gitlab/callback"
        f"&response_type=code"
        f"&scope=read_user+read_api"
    )
    return RedirectResponse(url)


@router.get("/gitlab/callback")
async def gitlab_callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://gitlab.com/oauth/token",
            json={
                "client_id": GITLAB_CLIENT_ID,
                "client_secret": GITLAB_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": "http://localhost:8000/api/auth/gitlab/callback",
            },
        )
        token_data = token_res.json()
        gitlab_token = token_data.get("access_token")

        if not gitlab_token:
            raise HTTPException(status_code=400, detail="GitLab OAuth failed")

        user_res = await client.get(
            "https://gitlab.com/api/v4/user",
            headers={"Authorization": f"Bearer {gitlab_token}"},
        )
        gitlab_user = user_res.json()
        email = gitlab_user.get("email")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            gitlab_username=gitlab_user.get("username"),
            gitlab_access_token=gitlab_token,
        )
        db.add(user)
    else:
        user.gitlab_username = gitlab_user.get("username")
        user.gitlab_access_token = gitlab_token

    db.commit()
    db.refresh(user)

    app_token = create_access_token({"sub": str(user.id)})
    return RedirectResponse(f"{FRONTEND_URL}/auth/callback?token={app_token}")
