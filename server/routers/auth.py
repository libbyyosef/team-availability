# server/api/routes/auth.py
from __future__ import annotations
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
COOKIE_NAME = "uid"
COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60  # 7 days
SAMESITE = "lax"
COOKIE_SECURE = False  # set True only when served over HTTPS (production)

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
        key=COOKIE_NAME,
        value=token,
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


# @router.get("/me", response_model=UserPublic, summary="Return current user by cookie")
# def me(request: Request, db: Session = Depends(get_db)):
#     token = request.cookies.get(COOKIE_NAME)
#     if not token:
#         raise HTTPException(status_code=401, detail="Not authenticated")

#     try:
#         data = decrypt_cookie(token)  # {"uid": int}
#     except Exception:
#         raise HTTPException(status_code=401, detail="Bad session")

#     uid = data.get("uid")
#     if not isinstance(uid, int):
#         raise HTTPException(status_code=401, detail="Bad session")

#     user = user_crud.get_user_by_id(db, uid)
#     if not user:
#         raise HTTPException(status_code=401, detail="Session user not found")
#     return user
