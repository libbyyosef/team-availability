from __future__ import annotations

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from server.sql_db.db import get_db
from server.crud import user_crud
from server.routers.cookies import decrypt_cookie  # Fernet helpers

COOKIE_NAME = "uid"

def get_current_user(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        data = decrypt_cookie(token)  # {"uid": int}
        uid = data.get("uid")
        if not isinstance(uid, int):
            raise ValueError("bad uid")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bad session")

    user = user_crud.get_user_by_id(db, uid)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session user not found")
    return user
