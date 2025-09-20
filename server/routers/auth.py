# server/api/routes/auth.py
from __future__ import annotations
import os
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from server.sql_db.db import get_db
from server.crud import user_crud
from server.schemas.user_schema import UserPublic
from server.routers.hashing import verify_password  
from server.routers.cookies import encrypt_cookie, decrypt_cookie  

router = APIRouter(prefix="/auth", tags=["Auth"])

# ---- Cookie settings ----


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


@router.post("/login", response_model=UserPublic, summary="Login & set cookie")
def login(payload: LoginPayload, response: Response, db: Session = Depends(get_db)):
    user = user_crud.get_user_by_email(db, str(payload.email))
    if not user or not verify_password(payload.password, user.password or ""):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Encrypt {"uid": <int>} as cookie value
    token = encrypt_cookie({"uid": user.id})
    response.set_cookie(
        key=os.getenv("COOKIE_NAME"),
        value=token,
        max_age=os.getenv("COOKIE_MAX_AGE_SECONDS"),
        httponly=True,
        secure=os.getenv("COOKIE_SECURE"),
        samesite=os.getenv("SAMESITE"),
        path="/",
    )
    return user


@router.post("/logout", summary="Logout & clear cookie")
def logout(response: Response):
    response.delete_cookie(
        key=os.getenv("COOKIE_NAME"),
        path="/",
        samesite=os.getenv("SAMESITE"),
        secure=os.getenv("COOKIE_SECURE"),
    )
    return {"ok": True}


