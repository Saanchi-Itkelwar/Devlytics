from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models import User, SyncStatus
from app.auth import get_current_user, hash_password, verify_password

router = APIRouter()


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None


class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class DisconnectRequest(BaseModel):
    provider: str  # "github" or "gitlab"


@router.get("/profile")
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sync = db.query(SyncStatus).filter(
        SyncStatus.user_id == current_user.id
    ).first()

    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "github_username": current_user.github_username,
        "gitlab_username": current_user.gitlab_username,
        "github_connected": current_user.github_access_token is not None,
        "gitlab_connected": current_user.gitlab_access_token is not None,
        "created_at": current_user.created_at,
        "last_synced_at": sync.last_synced_at if sync else None,
    }


@router.patch("/profile")
def update_profile(
    body: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.full_name is not None:
        current_user.full_name = body.full_name
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated"}


@router.patch("/password")
def update_password(
    body: UpdatePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.hashed_password:
        raise HTTPException(
            status_code=400,
            detail="Password login not set up for OAuth accounts"
        )
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    current_user.hashed_password = hash_password(body.new_password)
    db.commit()
    return {"message": "Password updated"}


@router.post("/disconnect")
def disconnect_provider(
    body: DisconnectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.provider == "github":
        current_user.github_access_token = None
        current_user.github_username = None
    elif body.provider == "gitlab":
        current_user.gitlab_access_token = None
        current_user.gitlab_username = None
    else:
        raise HTTPException(status_code=400, detail="Invalid provider")

    db.commit()
    return {"message": f"{body.provider} disconnected"}
