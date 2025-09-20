# server/scripts/create_db.py
from __future__ import annotations
from pathlib import Path
from datetime import datetime, timezone
from dotenv import load_dotenv
import json, time, bcrypt

from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

# engine + session
from ..sql_db.db import engine, SessionLocal

# your CRUD
from ..crud.user_crud import create_user
from ..crud.user_status_crud import upsert_user_status

# schemas / model (adjust paths if needed)
from ..schemas.user_schema import UserCreate
from ..schemas.user_statuses_schema import UserStatusCreate
from ..models.user_model import User

DEFAULT_SCHEMA_PATH = Path(__file__).resolve().parents[1] / "sql_db" / "schema.sql"

def read_sql(path: Path) -> str:
    if not path.is_file():
        raise FileNotFoundError(f"Schema file not found: {path}")
    return path.read_text(encoding="utf-8-sig")

def apply_schema(sql_text: str) -> None:
    with engine.begin() as conn:
        conn.exec_driver_sql(sql_text)

def naive_statement_count(sql_text: str) -> int:
    return sum(1 for chunk in sql_text.split(";") if chunk.strip())

def log_json(metrics: dict) -> None:
    print(json.dumps(metrics, ensure_ascii=False))

# -------- seed data (NO password fields here) --------
USERS = [
    {"first_name": "Libby",  "last_name": "Yosef",    "email": "libby.yosef@pubplus.com",    "status": "Working"},
    {"first_name": "Avi",    "last_name": "Cohen",    "email": "avi.cohen@pubplus.com",      "status": "Working"},
    {"first_name": "Diana",  "last_name": "Tesler",   "email": "diana.tesler@pubplus.com",   "status": "OnVacation"},
    {"first_name": "Yossi",  "last_name": "Morris",   "email": "yossi.morris@pubplus.com",   "status": "Working"},
    {"first_name": "Danny",  "last_name": "Rodin",    "email": "danny.rodin@pubplus.com",    "status": "BusinessTrip"},
    {"first_name": "Efi",    "last_name": "Shmidt",   "email": "efi.shmidt@pubplus.com",     "status": "OnVacation"},
    {"first_name": "Inbal",  "last_name": "Goldfarb", "email": "inbal.goldfarb@pubplus.com", "status": "Working"},
    {"first_name": "Dolev",  "last_name": "Aufleger", "email": "dolev.aufleger@pubplus.com", "status": "Working"},
]

def _make_initial_password(first_name: str) -> str:
    # per your request: "user name123!?" → we use the first name token
    return f"{first_name}123!?"

def _hash_pw(plain: str) -> str:
    # create_user expects an already-hashed password
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def seed_users_and_statuses(db: Session) -> None:
    for u in USERS:
        # derive & hash password
        derived_pw = _make_initial_password(u["first_name"])
        user_create = UserCreate(
            email=u["email"],
            password=_hash_pw(derived_pw),   # pass HASH to create_user
            first_name=u["first_name"],
            last_name=u["last_name"],
        )
        try:
            user = create_user(db, user_create)
        except IntegrityError:
            db.rollback()
            user = db.execute(select(User).where(User.email == u["email"])).scalar_one()

        # upsert status
        status_create = UserStatusCreate(user_id=user.id, status=u["status"])
        upsert_user_status(db, status_create)

def main() -> None:
    load_dotenv()
    start = time.monotonic()
    ts = datetime.now(timezone.utc)
    success = 0
    error_type = ""
    stmt_count = 0
    try:
        sql_text = read_sql(DEFAULT_SCHEMA_PATH)
        stmt_count = naive_statement_count(sql_text)
        apply_schema(sql_text)
        # seed via CRUD
        with SessionLocal() as db:
            seed_users_and_statuses(db)
        success = 1
    except Exception as e:
        error_type = e.__class__.__name__
        raise
    finally:
        duration = time.monotonic() - start
        metrics = {
            "event": "apply_schema_and_seed_users",
            "schema_path": str(DEFAULT_SCHEMA_PATH),
            "duration_seconds": round(duration, 6),
            "success": success,
            "schema_statements": stmt_count,
            "error_type": error_type,
            "ts": ts.isoformat(),
            "ts_unix": int(ts.timestamp()),
        }
        log_json(metrics)
        if success:
            print(f"Schema applied + users & statuses seeded via CRUD. Source: {DEFAULT_SCHEMA_PATH}")
        else:
            print(f"Failed to apply schema/seed from: {DEFAULT_SCHEMA_PATH} ({error_type})")

if __name__ == "__main__":
    main()
