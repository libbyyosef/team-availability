from __future__ import annotations
from typing import  List
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr

class UserStatusBase(BaseModel):
    status: str = Field(description="e.g., 'working', 'on_vacation', 'remote'")


class UserStatusCreate(UserStatusBase):
    user_id: int


class UserStatusUpdate(UserStatusBase):
    pass


class UserStatusPublic(BaseModel):
    user_id: int
    status: str
    updated_at: datetime

    class Config:
        from_attributes = True


class UserStatusesList(BaseModel):
    items: List[UserStatusPublic]