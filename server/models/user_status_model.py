from __future__ import annotations

from sqlalchemy import Column, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.types import BigInteger
from sqlalchemy.orm import relationship

from . import Base


class UserStatus(Base):
    __tablename__ = "user_statuses"

    user_id = Column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    status = Column(Text, nullable=False)  # e.g., 'working', 'on_vacation'..
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    user = relationship("User", back_populates="status")
