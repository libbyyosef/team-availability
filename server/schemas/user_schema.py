from __future__ import annotations
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr


# ---------- Common ----------
class MessageResponse(BaseModel):
    detail: str


# ---------- USERS ----------
class UserBase(BaseModel):
    email: EmailStr = Field(description="Case-sensitive email (stored as-is)")
    first_name: str
    last_name: str


class UserCreate(UserBase):
    password: str = Field(min_length=8, description="Password HASH (bcrypt/argon2), not raw")


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserPublic(BaseModel):
    id: int
    email: EmailStr
    first_name: str
    last_name: str

    class Config:
        from_attributes = True


class UsersList(BaseModel):
    users: List[UserPublic]