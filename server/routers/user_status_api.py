from __future__ import annotations
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.routers.deps import get_current_user, require_uid_match
from server.schemas.user_statuses_schema import (
    Status,
    UserStatusCreate,
    UserStatusPublic,
)
from server.crud import user_status_crud
from server.models.user_model import User
from server.routers.responses import load_responses
from server.sql_db.db import get_db

router = APIRouter(prefix="/user_statuses", tags=["User Statuses"])

status_responses = load_responses("user_status_responses.yaml")
common_error_responses = load_responses("common_error_responses.yaml")


# --- wrapper for payload-based UID (calls your existing require_uid_match) ---
def require_uid_match_from_payload(
    payload: UserStatusCreate,
    current: User = Depends(get_current_user),
) -> User:
    return require_uid_match(payload.user_id, current)



# ------------------ UPDATE (self-only) ------------------
@router.put(
    "/update_current_user_status",
    response_model=UserStatusPublic,
    summary="Update existing user status (self-only; cookie auth)",
    responses={
        200: status_responses.get("update_status_200", {}),
        401: common_error_responses[401],
        403: common_error_responses[403],
        404: status_responses.get("update_status_404", {}),
        422: common_error_responses[422],
        500: common_error_responses[500],
    },
)
def update_current_user_status(
    user_id: Annotated[int, Query(..., ge=1, alias="user_id")],
    status: Annotated[
        Status,
        Query(
            ...,
            alias="status",
            description="working | on_vacation | working_remotely | business_trip",
        ),
    ],
    current: Annotated[
        User, Depends(require_uid_match)
    ],  
    db: Annotated[Session, Depends(get_db)],
):
    row = user_status_crud.update_user_status(db, user_id, status)
    if not row:
        raise HTTPException(status_code=404, detail="Status not found")
    return row
