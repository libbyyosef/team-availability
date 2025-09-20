from __future__ import annotations
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr, field_validator

# ---- base config (simple, helpful defaults) ----
class AppModel(BaseModel):
    model_config = {
        "extra": "forbid",               # reject unknown fields
        "str_strip_whitespace": True,    # auto-trim strings
        "validate_assignment": True,     # re-validate on attribute set
    }

# ---------- Common ----------
class MessageResponse(AppModel):
    detail: str

# ---------- USERS ----------
class UserBase(AppModel):
    email: EmailStr = Field(description="Case-sensitive email (stored as-is)")
    first_name: str = Field(min_length=1, max_length=50)
    last_name: str  = Field(min_length=1, max_length=50)

    # keep it simple: collapse inner spaces, ensure not empty after trim
    @field_validator("first_name", "last_name")
    @classmethod
    def _normalize_name(cls, v: str) -> str:
        v = " ".join(v.split())
        if not v:
            raise ValueError("name cannot be empty")
        return v

class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128, description="Password HASH (bcrypt/argon2), not raw")

class UserUpdate(AppModel):
    first_name: Optional[str] = Field(default=None, min_length=1, max_length=50)
    last_name: Optional[str]  = Field(default=None, min_length=1, max_length=50)

    @field_validator("first_name", "last_name")
    @classmethod
    def _normalize_optional_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = " ".join(v.split())
        if not v:
            raise ValueError("name cannot be empty")
        return v

class UserPublic(AppModel):
    id: int
    email: EmailStr
    first_name: str
    last_name: str

    class Config:
        from_attributes = True

class UsersList(AppModel):
    users: List[UserPublic]
