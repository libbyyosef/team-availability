from __future__ import annotations

from sqlalchemy import Column, Text
from sqlalchemy.types import BigInteger
from sqlalchemy.orm import relationship

from . import Base


class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    email = Column(Text, nullable=False, unique=True, index=True)
    password = Column(Text, nullable=False)  # store HASH
    first_name = Column(Text, nullable=False)
    last_name = Column(Text, nullable=False)

    # one-to-one
    status = relationship(
        "UserStatus",
        uselist=False,
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
