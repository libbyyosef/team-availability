# server/api/routes/auth.py
from __future__ import annotations
import os
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from server.sql_db.db import get_db
from server.crud import user_crud
from server.schemas.user_schema import UserPublic
from server.crud.hashing import verify_password
from server.crud.cookies import encrypt_cookie  # decrypt not needed for logout

router = APIRouter(prefix="/auth", tags=["Auth"])

# ---------- Helpers ----------

def _as_bool(v: Optional[str], default: bool = False) -> bool:
    return (v or "").strip().lower() in {"1", "true", "yes", "on"}

def _samesite(v: Optional[str]) -> Literal["Lax", "Strict", "None"]:
    s = (v or "Lax").strip()
    # normalize common lowercase entries
    s_norm = s.capitalize() if s.lower() in {"lax", "strict"} else ("None" if s.lower() == "none" else s)
    if s_norm not in {"Lax", "Strict", "None"}:
        raise ValueError("SAMESITE must be one of: Lax, Strict, None")
    return s_norm  # FastAPI/Starlette expects proper-cased value

def _cookie_settings():
    """
    Central place to define cookie attributes so set/delete always match.
    """
    return {
        "name": os.getenv("COOKIE_NAME", "auth"),
        "path": os.getenv("COOKIE_PATH", "/"),
        "domain": os.getenv("COOKIE_DOMAIN") or None,  # keep None if not set
        "max_age": int(os.getenv("COOKIE_MAX_AGE_SECONDS", "604800")),  # default 7 days
        "secure": _as_bool(os.getenv("COOKIE_SECURE"), False),
        "samesite": _samesite(os.getenv("SAMESITE")),  # Lax/Strict/None
        # httponly is always True for auth cookies
    }

# ---------- Schemas ----------

class LoginPayload(BaseModel):
    email: EmailStr
    password: str

# ---------- Routes ----------

@router.post("/login", response_model=UserPublic, summary="Login & set auth cookie")
def login(payload: LoginPayload, response: Response, db: Session = Depends(get_db)):
    user = user_crud.get_user_by_email(db, str(payload.email))
    if not user or not verify_password(payload.password, user.password or ""):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Encrypt {"uid": <int>} as cookie value
    token = encrypt_cookie({"user_id": user.id})

    cfg = _cookie_settings()
    response.set_cookie(
        key=cfg["name"],
        value=token,
        max_age=cfg["max_age"],
        httponly=True,
        secure=cfg["secure"],
        samesite=cfg["samesite"],
        path=cfg["path"],
        domain=cfg["domain"],
    )
    return user

@router.post("/logout", summary="Logout & clear auth cookie")
def logout(_request: Request, response: Response):
    cfg = _cookie_settings()
    # No need to read/decrypt the cookie. Deletion is by (name, domain, path).
    response.delete_cookie(
        key=cfg["name"],
        path=cfg["path"],
        domain=cfg["domain"],
        samesite=cfg["samesite"],
        secure=cfg["secure"],
    )
    # 204 No Content is also a fine choice; JSON OK for simplicity
    return {"ok": True}
