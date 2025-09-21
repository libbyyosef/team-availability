from __future__ import annotations
from enum import Enum
from typing import List
from datetime import datetime
from pydantic import Field, field_validator
from server.schemas.base import AppModel  # your shared base

# ---------- Allowed status values (Py3.10-friendly) ----------
class Status(str, Enum):
    working = "working"
    working_remotely = "working_remotely"
    on_vacation = "on_vacation"
    business_trip = "business_trip"

_ALLOWED = {s.value for s in Status}

# ---------- Schemas ----------
class UserStatusBase(AppModel):
    # Only canonical values are allowed
    status: Status = Field(
        description="one of: working / working_remotely / on_vacation / business_trip"
    )

    @field_validator("status", mode="before")
    @classmethod
    def _validate_status(cls, v):
        if v is None:
            raise ValueError("status is required")
        s = str(v).strip().lower()
        if s not in _ALLOWED:
            allowed = ", ".join(sorted(_ALLOWED))
            raise ValueError(f"status must be one of: {allowed}")
        return s  # pydantic will coerce to Status enum

class UserStatusCreate(UserStatusBase):
    user_id: int

class UserStatusUpdate(UserStatusBase):
    pass

class UserStatusPublic(AppModel):
    user_id: int
    status: Status
    updated_at: datetime

    # pydantic v2: enable ORM conversion here (not globally)
    model_config = {**AppModel.model_config, "from_attributes": True}

class UserStatusesList(AppModel):
    items: List[UserStatusPublic]
