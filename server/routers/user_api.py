# server/routers/user_api.py
from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from pydantic import BaseModel

from server.routers.deps import get_current_user
from server.sql_db.db import get_db
from server.routers.responses import load_responses
from server.schemas.user_schema import (
    UserCreate,
    UserUpdate,
    UserPublic,
    UsersList,
)
from server.crud import user_crud
from server.models.user_model import User
from server.models.user_status_model import UserStatus
from server.routers.cookies import decrypt_cookie  # NEW

router = APIRouter(prefix="/users", tags=["Users"])

user_responses = load_responses("user_responses.yaml")
common_error_responses = load_responses("common_error_responses.yaml")


# ---------- DTOs for name+status responses ----------
class UserNameStatus(BaseModel):
    id: int
    first_name: str
    last_name: str
    status: Optional[str] = None  # if a user has no status yet


class UsersNameStatusList(BaseModel):
    users: List[UserNameStatus]


# ------------------ CREATE (kept as-is) -------------------
@router.post(
    "/create_user",
    response_model=UserPublic,
    status_code=201,
    summary="Create user",
    responses={
        201: user_responses.get("create_user_201", {}),
        400: user_responses.get("create_user_400", {}),
        409: user_responses.get("create_user_409", {}),
        422: common_error_responses[422],
        500: common_error_responses[500],
    },
)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    """
    Create a user. **password** must be a HASH (bcrypt/argon2).
    Email uniqueness is case-sensitive (DB-level).
    """
    if user_crud.get_user_by_email(db, str(payload.email)):
        raise HTTPException(status_code=409, detail="Email already exists")
    return user_crud.create_user(db, payload)


# ------------------ READ (existing) ----------------------
# @router.get(
#     "/get_user",
#     response_model=UserPublic,
#     summary="Get user by ID",
#     responses={
#         200: user_responses.get("get_user_200", {}),
#         404: user_responses.get("get_user_404", {}),
#         422: common_error_responses[422],
#         500: common_error_responses[500],
#     },
# )
# def get_user(user_id: int, db: Session = Depends(get_db)):
#     user = user_crud.get_user_by_id(db, user_id)
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
#     return user


# @router.get(
#     "/list_users",
#     response_model=UsersList,
#     summary="List users",
#     responses={
#         200: user_responses.get("list_users_200", {}),
#         422: common_error_responses[422],
#         500: common_error_responses[500],
#     },
# )
# def list_users(
#     limit: int = Query(100, ge=1, le=500),
#     offset: int = Query(0, ge=0),
#     db: Session = Depends(get_db),
#     current: User = Depends(get_current_user),  # ✅ must be logged in
# ):
#     users = user_crud.list_users(db, limit=limit, offset=offset)
#     return {"users": users}


# @router.get(
#     "/get_user_by_email",
#     response_model=UserPublic,
#     summary="Get user by email (case-sensitive)",
#     responses={
#         200: user_responses.get("get_user_by_email_200", {}),
#         404: user_responses.get("get_user_by_email_404", {}),
#         422: common_error_responses[422],
#         500: common_error_responses[500],
#     },
# )
# def get_user_by_email(
#     email: str,
#     db: Session = Depends(get_db),
#     current: User = Depends(get_current_user),
# ):
#     user = user_crud.get_user_by_email(db, email)
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
#     return user


# ---------------- New: list ALL users + their status ----------------
@router.get(
    "/list_users_with_statuses",
    response_model=UsersNameStatusList,
    summary="List all users with their current status (auth required)",
)
def list_users_with_statuses(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """
    Returns: [{"id", "first_name", "last_name", "status"}...]
    Status is NULL if user has no status row yet.
    """
    users_with_status = user_crud.list_all_users_with_statuses(db)
    items = [
        UserNameStatus(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            status=user.status
        )
        for user in users_with_status
    ]
    return {"users": items}


# --------------- New: get MY status (by cookie) ---------------------

# --------------- New: get a specific user's status (self-only) ------
@router.get(
    "/get_user_status",
    response_model=UserNameStatus,
    summary="Get a user's status (must be yourself)",
)
def get_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if user_id != current.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    user_with_status = user_crud.get_user_status_by_id(db, user_id)
    if not user_with_status:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserNameStatus(
        id=user_with_status.id,
        first_name=user_with_status.first_name,
        last_name=user_with_status.last_name,
        status=user_with_status.status
    )
# ------------------ UPDATE (kept as-is) --------------------
# @router.put(
#     "/update_user",
#     response_model=UserPublic,
#     summary="Update user names",
#     responses={
#         200: user_responses.get("update_user_200", {}),
#         400: user_responses.get("update_user_400", {}),
#         404: user_responses.get("update_user_404", {}),
#         422: common_error_responses[422],
#         500: common_error_responses[500],
#     },
# )
# def update_user(
#     user_id: int,
#     payload: UserUpdate,
#     db: Session = Depends(get_db),
#     current: User = Depends(get_current_user),
# ):
#     # Optional: restrict to self
#     # if user_id != current.id:
#     #     raise HTTPException(status_code=403, detail="Forbidden")
#     user = user_crud.update_user(db, user_id, payload)
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
#     return user
