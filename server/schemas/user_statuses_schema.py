from __future__ import annotations
from typing import List
from datetime import datetime
from pydantic import BaseModel, Field,  field_validator

# Base with helpful defaults
class AppModel(BaseModel):
    model_config = {
        "extra": "forbid",               # reject unknown fields
        "str_strip_whitespace": True,    # auto-trim strings
        "validate_assignment": True,     # re-validate on attribute set
    }

class UserStatusBase(AppModel):
    # allow simple lowercase words separated by underscores (e.g., working, onVacation)
    status: str = Field(min_length=2, max_length=32, pattern=r"^[a-z_]+$",
                        description="e.g., 'working', 'onVacation'")

    @field_validator("status")
    @classmethod
    def normalize_status(cls, v: str) -> str:
        # collapse inner spaces to underscores, lowercase
        v = "_".join(v.split()).lower()
        return v

class UserStatusCreate(UserStatusBase):
    user_id: int

class UserStatusUpdate(UserStatusBase):
    pass

class UserStatusPublic(AppModel):
    user_id: int
    status: str
    updated_at: datetime

    class Config:
        from_attributes = True

class UserStatusesList(AppModel):
    items: List[UserStatusPublic]
