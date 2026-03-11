from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import User, SyncStatus
from app.auth import get_current_user
from app.services.github import sync_github_data
from app.services.gitlab import sync_gitlab_data

router = APIRouter()


async def run_sync(user_id: int, db: Session):
    """Background task that syncs GitHub and GitLab data."""

    sync = db.query(SyncStatus).filter(SyncStatus.user_id == user_id).first()
    if not sync:
        sync = SyncStatus(user_id=user_id)
        db.add(sync)

    sync.is_syncing = True
    sync.error_message = None
    db.commit()

    user = db.query(User).filter(User.id == user_id).first()

    try:
        if user.github_access_token:
            await sync_github_data(
                user_id=user_id,
                token=user.github_access_token,
                username=user.github_username,
                db=db,
            )
            sync.github_synced = True

        if user.gitlab_access_token:
            await sync_gitlab_data(
                user_id=user_id,
                token=user.gitlab_access_token,
                db=db,
            )
            sync.gitlab_synced = True

        sync.last_synced_at = datetime.utcnow()

    except Exception as e:
        sync.error_message = str(e)

    finally:
        sync.is_syncing = False
        db.commit()


@router.post("/trigger")
async def trigger_sync(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sync = db.query(SyncStatus).filter(SyncStatus.user_id == current_user.id).first()
    if sync and sync.is_syncing:
        return {"message": "Sync already in progress"}

    background_tasks.add_task(run_sync, current_user.id, db)
    return {"message": "Sync started"}


@router.get("/status")
def get_sync_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sync = db.query(SyncStatus).filter(SyncStatus.user_id == current_user.id).first()
    if not sync:
        return {
            "is_syncing": False,
            "last_synced_at": None,
            "github_synced": False,
            "gitlab_synced": False,
            "error_message": None,
        }
    return {
        "is_syncing": sync.is_syncing,
        "last_synced_at": sync.last_synced_at,
        "github_synced": sync.github_synced,
        "gitlab_synced": sync.gitlab_synced,
        "error_message": sync.error_message,
    }
