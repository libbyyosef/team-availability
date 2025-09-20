from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from routers.responses import load_responses
from sql_db.db import get_db


from schemas.user_schema import (
    UserCreate,
    UserUpdate,
    UserPublic,
    UsersList,
)
from crud import user_crud

router = APIRouter(prefix="/users", tags=["Users"])

user_responses = load_responses("user_responses.yaml")
common_error_responses = load_responses("common_error_responses.yaml")


# <------------------ CREATE -------------------->
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


# <------------------ READ -------------------->
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
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    user = user_crud.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# <------------------ UPDATE -------------------->
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
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db)):
    user = user_crud.update_user(db, user_id, payload)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

