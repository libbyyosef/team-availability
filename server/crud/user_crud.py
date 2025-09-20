from __future__ import annotations

from typing import List, Optional,NamedTuple
from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete

from server.models.user_model import User
from server.schemas.user_schema import (
    UserCreate,
    UserUpdate,
)
from server.models.user_status_model import UserStatus


# <------------------ CREATE -------------------->
def create_user(db: Session, data: UserCreate) -> User:
    user = User(
        email=str(data.email), 
        password=data.password,  # already a HASH
        first_name=data.first_name,
        last_name=data.last_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# <------------------ READ -------------------->
def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.get(User, user_id)


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    # Case-sensitive match
    stmt = select(User).where(User.email == email)
    return db.execute(stmt).scalar_one_or_none()


def list_users(db: Session, limit: int = 100, offset: int = 0) -> List[User]:
    stmt = select(User).limit(limit).offset(offset)
    return list(db.execute(stmt).scalars())


# <------------------ UPDATE -------------------->
def update_user(db: Session, user_id: int, data: UserUpdate) -> Optional[User]:
    user = db.get(User, user_id)
    if not user:
        return None
    if data.first_name is not None:
        user.first_name = data.first_name
    if data.last_name is not None:
        user.last_name = data.last_name
    db.commit()
    db.refresh(user)
    return user



class UserWithStatus(NamedTuple):
    id: int
    first_name: str
    last_name: str
    status: Optional[str]


def get_user_status_by_id(db: Session, user_id: int) -> Optional[UserWithStatus]:
    """
    Get a specific user's information along with their status.
    Returns None if user doesn't exist.
    Status will be None if user has no status record.
    """
    stmt = (
        select(User.id, User.first_name, User.last_name, UserStatus.status)
        .select_from(User)
        .join(UserStatus, UserStatus.user_id == User.id, isouter=True)
        .where(User.id == user_id)
        .limit(1)
    )
    row = db.execute(stmt).first()
    if not row:
        return None
    
    return UserWithStatus(
        id=row.id,
        first_name=row.first_name,
        last_name=row.last_name,
        status=row.status
    )


def list_all_users_with_statuses(db: Session) -> List[UserWithStatus]:
    """
    List all users with their current status.
    Users without status records will have status=None.
    Results are ordered by first_name, then last_name.
    """
    stmt = (
        select(User.id, User.first_name, User.last_name, UserStatus.status)
        .select_from(User)
        .join(UserStatus, UserStatus.user_id == User.id, isouter=True)
        .order_by(User.first_name.asc(), User.last_name.asc())
    )
    rows = db.execute(stmt).all()
    
    return [
        UserWithStatus(
            id=row.id,
            first_name=row.first_name,
            last_name=row.last_name,
            status=row.status
        )
        for row in rows
    ]