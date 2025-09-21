from __future__ import annotations
from enum import StrEnum
from typing import List
from datetime import datetime
from pydantic import Field, field_validator
from server.schemas.base import AppModel  # <-- shared base

class Status(StrEnum):
    working = "working"
    working_remotely = "working_remotely"
    on_vacation = "on_vacation"
    business_trip = "business_trip"

_ALLOWED = {s.value for s in Status}

class UserStatusBase(AppModel):
    status: Status = Field(
        description="one of: working / working_remotely / on_vacation / business_trip"
    )

    @field_validator("status", mode="before")
    @classmethod
    def _validate_status(cls, v):
        s = str(v).strip().lower()
        if s not in _ALLOWED:
            allowed = ", ".join(sorted(_ALLOWED))
            raise ValueError(f"status must be one of: {allowed}")
        return s

class UserStatusCreate(UserStatusBase):
    user_id: int

class UserStatusUpdate(UserStatusBase):
    pass

class UserStatusPublic(AppModel):
    user_id: int
    status: Status
    updated_at: datetime

    model_config = {**AppModel.model_config, "from_attributes": True}

class UserStatusesList(AppModel):
    items: List[UserStatusPublic]
