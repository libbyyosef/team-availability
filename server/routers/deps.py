from __future__ import annotations
import os

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from server.models.user_model import User
from server.sql_db.db import get_db
from server.crud import user_crud
from server.crud.cookies import decrypt_cookie  

COOKIE_NAME = os.getenv("COOKIE_NAME", "auth")

def get_current_user(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        data = decrypt_cookie(token)  # {"user_id": int}
        user_id = data.get("user_id")
        if not isinstance(user_id, int):
            raise ValueError("bad user_id")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bad session")

    user = user_crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session user not found")
    return user

def require_uid_match(user_id: int, current: User = Depends(get_current_user)) -> User:
    if user_id != current.id:
        raise HTTPException(status_code=403, detail="token/user mismatch")
    return current
