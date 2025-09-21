from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from pydantic import BaseModel

from server.routers.deps import get_current_user, require_uid_match
from server.sql_db.db import get_db
from server.routers.responses import load_responses

from server.crud import user_crud
from server.models.user_model import User
from server.models.user_status_model import UserStatus
from server.crud.cookies import decrypt_cookie  # NEW

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





# ------------------ GET  -------------------

@router.get("/list_users_with_statuses", response_model=UsersNameStatusList)
def list_users_with_statuses(
    user_id: int = Query(..., ge=1),
    db: Session = Depends(get_db),
    current: User = Depends(require_uid_match),
):
    rows = user_crud.list_all_users_with_statuses(db)
    items = [UserNameStatus(id=r.id, first_name=r.first_name, last_name=r.last_name, status=r.status) for r in rows]
    return {"users": items}



