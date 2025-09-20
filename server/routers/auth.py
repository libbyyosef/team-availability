# server/api/routes/auth.py
from __future__ import annotations
from datetime import timedelta, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from sql_db.db import get_db
from crud import user_crud
from schemas.user_schema import UserPublic
from server.security.passwords import verify_password  # <--- here

router = APIRouter(prefix="/auth", tags=["Auth"])

COOKIE_NAME = "uid"
COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60  # 7 days
SAMESITE = "lax"
COOKIE_SECURE = False  # ⚠️ set True only behind HTTPS; for localhost dev keep False

class LoginPayload(BaseModel):
    email: EmailStr
    password: str

@router.post("/login", response_model=UserPublic, summary="Login & set cookie")
def login(payload: LoginPayload, response: Response, db: Session = Depends(get_db)):
    user = user_crud.get_user_by_email(db, str(payload.email))
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # DB stores the HASH in user.password (per your create_user contract)
    if not verify_password(payload.password, user.password or ""):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    response.set_cookie(
        key=COOKIE_NAME,
        value=str(user.id),
        max_age=COOKIE_MAX_AGE_SECONDS,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=SAMESITE,
        path="/",
    )
    return user

@router.post("/logout", summary="Logout & clear cookie")
def logout(response: Response):
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        samesite=SAMESITE,
        secure=COOKIE_SECURE,
    )
    return {"ok": True}

@router.get("/me", response_model=UserPublic, summary="Return current user by cookie")
def me(request: Request, db: Session = Depends(get_db)):
    uid = request.cookies.get(COOKIE_NAME)
    if not uid:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        user_id = int(uid)
    except ValueError:
        raise HTTPException(status_code=401, detail="Bad session")

    user = user_crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Session user not found")
    return user
