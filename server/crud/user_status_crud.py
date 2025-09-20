# crud/user_status_crud.py
from __future__ import annotations

from typing import List, Optional
from datetime import datetime, timezone

from sqlalchemy.orm import Session
from sqlalchemy import select

from models.user_status_model import UserStatus
from schemas.user_schema import UserStatusCreate, UserStatusUpdate


# <------------------ UPSERT/CREATE -------------------->
def upsert_user_status(db: Session, data: UserStatusCreate) -> UserStatus:
    existing = db.get(UserStatus, data.user_id)
    if existing:
        existing.status = data.status
        # updated_at is bumped by onupdate=func.now(); but we also protect in app side
        existing.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(existing)
        return existing

    row = UserStatus(
        user_id=data.user_id,
        status=data.status,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


# <------------------ READ -------------------->
def get_user_status(db: Session, user_id: int) -> Optional[UserStatus]:
    return db.get(UserStatus, user_id)


def list_user_statuses_by_status(db: Session, status: str, limit: int = 200, offset: int = 0) -> List[UserStatus]:
    stmt = select(UserStatus).where(UserStatus.status == status).limit(limit).offset(offset)
    return list(db.execute(stmt).scalars())


# <------------------ UPDATE -------------------->
def update_user_status(db: Session, user_id: int, data: UserStatusUpdate) -> Optional[UserStatus]:
    row = db.get(UserStatus, user_id)
    if not row:
        return None
    row.status = data.status
    row.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(row)
    return row


# <------------------ DELETE -------------------->
def delete_user_status(db: Session, user_id: int) -> bool:
    row = db.get(UserStatus, user_id)
    if not row:
        return False
    db.delete(row)
    db.commit()
    return True
