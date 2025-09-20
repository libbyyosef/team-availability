# server/routers/user_api.py
from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

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
from server.models.user_status_model import UserStatus  # make sure this exists
from pydantic import BaseModel

router = APIRouter(prefix="/users", tags=["Users"])

user_responses = load_responses("user_responses.yaml")
common_error_responses = load_responses("common_error_responses.yaml")

# Must match your auth router cookie name & policy
COOKIE_NAME = "uid"

# ---------- Auth dependency (session from cookie) ----------
def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    uid = request.cookies.get(COOKIE_NAME)
    if not uid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        user_id = int(uid)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bad session")
    user = user_crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session user not found")
    return user

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
@router.get(
    "/get_user",
    response_model=UserPublic,
    summary="Get user by ID",
    responses={
        200: user_responses.get("get_user_200", {}),
        404: user_responses.get("get_user_404", {}),
        422: common_error_responses[422],
        500: common_error_responses[500],
    },
)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = user_crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get(
    "/list_users",
    response_model=UsersList,
    summary="List users",
    responses={
        200: user_responses.get("list_users_200", {}),
        422: common_error_responses[422],
        500: common_error_responses[500],
    },
)
def list_users(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),  # ✅ must be logged in
):
    users = user_crud.list_users(db, limit=limit, offset=offset)
    return {"users": users}

@router.get(
    "/get_user_by_email",
    response_model=UserPublic,
    summary="Get user by email (case-sensitive)",
    responses={
        200: user_responses.get("get_user_by_email_200", {}),
        404: user_responses.get("get_user_by_email_404", {}),
        422: common_error_responses[422],
        500: common_error_responses[500],
    },
)
def get_user_by_email(email: str, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    user = user_crud.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ---------------- New: list ALL users + their status ----------------
@router.get(
    "/list_users_with_statuses",
    response_model=UsersNameStatusList,
    summary="List all users with their current status (auth required)",
)
def list_users_with_statuses(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),  # ✅ must be logged in
):
    """
    Returns: [{"id", "first_name", "last_name", "status"}...]
    Status is NULL if user has no status row yet.
    """
    stmt = (
        select(
            User.id,
            User.first_name,
            User.last_name,
            UserStatus.status,
        )
        .select_from(User)
        .join(UserStatus, UserStatus.user_id == User.id, isouter=True)
        .order_by(User.first_name.asc(), User.last_name.asc())
    )
    rows = db.execute(stmt).all()
    items = [
        UserNameStatus(id=r.id, first_name=r.first_name, last_name=r.last_name, status=r.status)
        for r in rows
    ]
    return {"users": items}

# --------------- New: get MY status (by cookie) ---------------------
@router.get(
    "/me/status",
    response_model=UserNameStatus,
    summary="Get the current user's status (auth required)",
)
def my_status(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),  # ✅ from cookie
):
    stmt = (
        select(User.id, User.first_name, User.last_name, UserStatus.status)
        .select_from(User)
        .join(UserStatus, UserStatus.user_id == User.id, isouter=True)
        .where(User.id == current.id)
        .limit(1)
    )
    row = db.execute(stmt).first()
    if not row:
        # Shouldn't happen if session is valid, but guard anyway
        raise HTTPException(status_code=404, detail="User not found")
    return UserNameStatus(id=row.id, first_name=row.first_name, last_name=row.last_name, status=row.status)

# --------------- New: get a specific user's status (self-only) ------
@router.get(
    "/get_user_status",
    response_model=UserNameStatus,
    summary="Get a user's status (must be yourself)",
)
def get_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),  # ✅ must be logged in
):
    if user_id != current.id:
        # Enforce: only the logged-in user can request their own status
        raise HTTPException(status_code=403, detail="Forbidden")

    stmt = (
        select(User.id, User.first_name, User.last_name, UserStatus.status)
        .select_from(User)
        .join(UserStatus, UserStatus.user_id == User.id, isouter=True)
        .where(User.id == user_id)
        .limit(1)
    )
    row = db.execute(stmt).first()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return UserNameStatus(id=row.id, first_name=row.first_name, last_name=row.last_name, status=row.status)

# ------------------ UPDATE (kept as-is) --------------------
@router.put(
    "/update_user",
    response_model=UserPublic,
    summary="Update user names",
    responses={
        200: user_responses.get("update_user_200", {}),
        400: user_responses.get("update_user_400", {}),
        404: user_responses.get("update_user_404", {}),
        422: common_error_responses[422],
        500: common_error_responses[500],
    },
)
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    # Optional: ensure users can only update themselves (uncomment if desired)
    # if user_id != current.id:
    #     raise HTTPException(status_code=403, detail="Forbidden")
    user = user_crud.update_user(db, user_id, payload)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
