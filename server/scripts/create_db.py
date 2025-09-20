# server/scripts/create_db.py
from __future__ import annotations

import argparse
import os
from pathlib import Path
from typing import List, Dict, Optional

from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker

# --- engine & session ---
from sql_db.db import engine  # your existing engine (reads DATABASE_URL in sql_db/db.py)
from models.user_model import User
from models.user_status_model import UserStatus  # type: ignore
from sql_db.db import SessionLocal as SessionLocal  # type: ignore


# --- ORM models (try common locations) ---
# Adjust these if your filenames differ.

DEFAULT_SCHEMA_PATH = Path(__file__).resolve().parents[1] / "sql_db" / "schema.sql"
print("def",DEFAULT_SCHEMA_PATH)

USERS: List[Dict] = [
    {"id": 1, "first_name": "Libby",  "last_name": "Yosef",    "email": "libby.yosef@pubplus.com",    "password": "Libby123!",  "status": "working"},
    {"id": 2, "first_name": "Avi",    "last_name": "Cohen",    "email": "avi.cohen@pubplus.com",      "password": "Avi123!",    "status": "working"},
    {"id": 3, "first_name": "Diana",  "last_name": "Tesler",   "email": "diana.tesler@pubplus.com",   "password": "Diana123!",  "status": "on_vacation"},
    {"id": 4, "first_name": "Yossi",  "last_name": "Morris",   "email": "yossi.morris@pubplus.com",   "password": "Yossi123!",  "status": "working"},
    {"id": 5, "first_name": "Danny",  "last_name": "Rodin",    "email": "danny.rodin@pubplus.com",    "password": "Danny123!",  "status": "business_trip"},
    {"id": 6, "first_name": "Efi",    "last_name": "Shmidt",   "email": "efi.shmidt@pubplus.com",     "password": "Efi123!",    "status": "on_vacation"},
    {"id": 7, "first_name": "Inbal",  "last_name": "Goldfarb", "email": "inbal.goldfarb@pubplus.com", "password": "Inbal123!",  "status": "working"},
    {"id": 8, "first_name": "Dolev",  "last_name": "Aufleger", "email": "dolev.aufleger@pubplus.com", "password": "Dolev123!",  "status": "working"},
]


def read_sql(path: Path) -> str:
    if not path.is_file():
        raise FileNotFoundError(f"Schema file not found: {path}")
    return path.read_text(encoding="utf-8-sig")


def hash_password(pw: str) -> str:
    """
    Prefer bcrypt if installed. (pip install bcrypt)
    For real usage, make bcrypt/argon2 mandatory; raw storage is for dev only.
    """
    try:
        import bcrypt  # type: ignore
        salt = bcrypt.gensalt(rounds=12)
        return bcrypt.hashpw(pw.encode("utf-8"), salt).decode("utf-8")
    except Exception:
        return pw  # DEV ONLY fallback


def apply_schema(sql_text: str) -> None:
    # run DDL in one transaction
    with engine.begin() as conn:
        conn.exec_driver_sql(sql_text)


def get_or_create_user_by_email(db: Session, email: str, defaults: Dict) -> User:
    """Upsert-like behavior via ORM using email as the natural key."""
    user: Optional[User] = db.query(User).filter(User.email == email).one_or_none()
    if user:
        # update fields if changed
        user.first_name = defaults.get("first_name", user.first_name)
        user.last_name = defaults.get("last_name", user.last_name)
        user.password = defaults.get("password", user.password)
        return user
    # create new
    user = User(
        id=defaults.get("id"),  # will use explicit id if provided
        email=email,
        password=defaults["password"],
        first_name=defaults["first_name"],
        last_name=defaults["last_name"],
    )
    db.add(user)
    return user


def upsert_status(db: Session, user_id: int, status: str) -> None:
    """Insert/update one row in user_statuses keyed by user_id."""
    us: Optional[UserStatus] = db.get(UserStatus, user_id)
    if us:
        us.status = status
        # updated_at should be handled by DB default/trigger; if not, set here:
        # us.updated_at = datetime.utcnow()
    else:
        us = UserStatus(user_id=user_id, status=status)
        db.add(us)


def seed_users_orm() -> None:
    db = SessionLocal()
    try:
        for u in USERS:
            # hash password (if bcrypt available)
            u_hashed = {**u, "password": hash_password(u["password"])}
            user = get_or_create_user_by_email(db, u["email"], u_hashed)
            db.flush()  # ensures user.id is available if it was just inserted
            upsert_status(db, user.id, u["status"])
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def main() -> None:
    load_dotenv()
    parser = argparse.ArgumentParser(description="Apply schema and seed with ORM models")
    parser.add_argument(
        "-s", "--schema",
        type=str,
        default=os.getenv("SCHEMA_FILE", str(DEFAULT_SCHEMA_PATH)),
        help="Path to schema SQL file (default: server/sql_db/schema.sql or $SCHEMA_FILE)",
    )
    args = parser.parse_args()

    try:
        sql_text = read_sql(Path(args.schema))
        apply_schema(sql_text)
        print(f"✅ Schema applied from: {Path(args.schema).resolve()}")

        seed_users_orm()
        print("✅ Seeded users + user_statuses via ORM models.")
    except (SQLAlchemyError, FileNotFoundError) as e:
        print("❌ Failure:")
        print(e)
        raise SystemExit(1)


if __name__ == "__main__":
    print("start main")
    main()
