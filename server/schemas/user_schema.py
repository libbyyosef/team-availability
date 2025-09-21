from __future__ import annotations
from typing import Optional, List
from pydantic import Field, EmailStr, field_validator
from server.schemas.base import AppModel  
class MessageResponse(AppModel):
    detail: str

class UserBase(AppModel):
    email: EmailStr = Field(description="Case-sensitive email (stored as-is)")
    first_name: str = Field(min_length=1, max_length=50)
    last_name:  str = Field(min_length=1, max_length=50)

    @field_validator("first_name", "last_name", mode="before")
    @classmethod
    def _normalize_name(cls, v: str) -> str:
        v = " ".join(str(v).split())
        if not v:
            raise ValueError("name cannot be empty")
        return v

    @field_validator("email", mode="before")
    @classmethod
    def _reject_spaces_in_email(cls, v: str) -> str:
        s = str(v)
        if " " in s:
            raise ValueError("email must not contain spaces")
        return s

class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128, description="Password HASH (bcrypt/argon2), not raw")

class UserUpdate(AppModel):
    first_name: Optional[str] = Field(default=None, min_length=1, max_length=50)
    last_name:  Optional[str] = Field(default=None, min_length=1, max_length=50)

    @field_validator("first_name", "last_name", mode="before")
    @classmethod
    def _normalize_optional_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = " ".join(str(v).split())
        if not v:
            raise ValueError("name cannot be empty")
        return v

class UserPublic(AppModel):
    id: int
    email: EmailStr
    first_name: str
    last_name: str

    # enable ORM/SQLAlchemy attribute support for this model
    model_config = {**AppModel.model_config, "from_attributes": True}

class UsersList(AppModel):
    users: List[UserPublic]
