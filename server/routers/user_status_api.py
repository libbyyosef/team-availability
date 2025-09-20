# api/routes/user_statuses.py
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from schemas.user_statuses_schema import (
    UserStatusCreate,
    UserStatusUpdate,
    UserStatusPublic,
    UserStatusesList,
)
from crud import user_status_crud
from server.routers.responses import load_responses
from sql_db.db import get_db

router = APIRouter(prefix="/user_statuses", tags=["User Statuses"])

status_responses = load_responses("user_status_responses.yaml")
common_error_responses = load_responses("common_error_responses.yaml")


# <------------------ UPSERT/CREATE -------------------->
@router.post(
    "/upsert_user_status",
    response_model=UserStatusPublic,
    status_code=201,
    summary="Upsert user status",
    responses={
        201: status_responses.get("upsert_status_201", {}),
        400: status_responses.get("upsert_status_400", {}),
        404: status_responses.get("upsert_status_404", {}),
        422: common_error_responses[422],
        500: common_error_responses[500],
    },
)
def upsert_user_status(payload: UserStatusCreate, db: Session = Depends(get_db)):
    """
    Create or update a user's status (one row per user).
    """
    return user_status_crud.upsert_user_status(db, payload)


# <------------------ READ -------------------->
@router.get(
    "/get_user_status",
    response_model=UserStatusPublic,
    summary="Get user status by user_id",
    responses={
        200: status_responses.get("get_status_200", {}),
        404: status_responses.get("get_status_404", {}),
        422: common_error_responses[422],
        500: common_error_responses[500],
    },
)
def get_user_status(user_id: int, db: Session = Depends(get_db)):
    row = user_status_crud.get_user_status(db, user_id)
    if not row:
        raise HTTPException(status_code=404, detail="Status not found")
    return row


@router.get(
    "/list_user_statuses_by_status",
    response_model=UserStatusesList,
    summary="List user statuses by status value",
    responses={
        200: status_responses.get("list_by_status_200", {}),
        422: common_error_responses[422],
        500: common_error_responses[500],
    },
)
def list_user_statuses_by_status(
    status: str = Query(..., description="e.g., 'working', 'on_vacation', 'remote'"),
    limit: int = Query(200, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    items = user_status_crud.list_user_statuses_by_status(db, status=status, limit=limit, offset=offset)
    return {"items": items}


# <------------------ UPDATE -------------------->
@router.put(
    "/update_user_status",
    response_model=UserStatusPublic,
    summary="Update existing user status",
    responses={
        200: status_responses.get("update_status_200", {}),
        404: status_responses.get("update_status_404", {}),
        422: common_error_responses[422],
        500: common_error_responses[500],
    },
)
def update_user_status(user_id: int, payload: UserStatusUpdate, db: Session = Depends(get_db)):
    row = user_status_crud.update_user_status(db, user_id, payload)
    if not row:
        raise HTTPException(status_code=404, detail="Status not found")
    return row


