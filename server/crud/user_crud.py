# crud/user_crud.py
from __future__ import annotations

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete

from models.user_model import User
from schemas.user_schema import (
    UserCreate,
    UserUpdate,
)


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


