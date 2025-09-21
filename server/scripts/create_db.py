from __future__ import annotations
from pathlib import Path
import sys
REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from datetime import datetime, timezone
from dotenv import load_dotenv
import json, time

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from server.sql_db.db import engine, SessionLocal
from server.crud.user_crud import create_user
from server.crud.user_status_crud import upsert_user_status
from server.schemas.user_schema import UserCreate
from server.schemas.user_statuses_schema import UserStatusCreate
from server.models.user_model import User
from server.crud.hashing import hash_password

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

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def log_json(metrics: dict) -> None:
    print(json.dumps(metrics, ensure_ascii=False))

USERS = [
    {"first_name": "Libby",  "last_name": "Yosef",    "email": "libby.yosef@pubplus.com",    "status": "working"},
    {"first_name": "Avi",    "last_name": "Cohen",    "email": "avi.cohen@pubplus.com",      "status": "working"},
    {"first_name": "Diana",  "last_name": "Tesler",   "email": "diana.tesler@pubplus.com",   "status": "on_vacation"},
    {"first_name": "Yossi",  "last_name": "Morris",   "email": "yossi.morris@pubplus.com",   "status": "working_remotely"},
    {"first_name": "Danny",  "last_name": "Rodin",    "email": "danny.rodin@pubplus.com",    "status": "business_trip"},
    {"first_name": "Efi",    "last_name": "Shmidt",   "email": "efi.shmidt@pubplus.com",     "status": "on_vacation"},
    {"first_name": "Inbal",  "last_name": "Goldfarb", "email": "inbal.goldfarb@pubplus.com", "status": "working"},
    {"first_name": "Dolev",  "last_name": "Aufleger", "email": "dolev.aufleger@pubplus.com", "status": "working"},
]

def _make_initial_password(first_name: str) -> str:
    # convention: FirstName123!?
    return f"{first_name}123!?"

def seed_users_and_statuses(db: Session) -> None:
    for u in USERS:
        # 1) create user
        user_create = UserCreate(
            email=u["email"],
            password=hash_password(_make_initial_password(u["first_name"])),  # bcrypt hash
            first_name=u["first_name"],
            last_name=u["last_name"],
        )
        try:
            user = create_user(db, user_create)
            log_json({
                "event": "user_create",
                "ts": _now_iso(),
                "action": "created",
                "user_id": user.id,
                "email": u["email"],
                "first_name": u["first_name"],
                "last_name": u["last_name"],
            })
        except IntegrityError:
            # If someone re-runs the script, keep it idempotent
            db.rollback()
            log_json({
                "event": "user_create",
                "ts": _now_iso(),
                "action": "exists",
                "email": u["email"],
                "first_name": u["first_name"],
                "last_name": u["last_name"],
            })
            # Pull existing instance only to get id for status write
            from sqlalchemy import select
            user = db.execute(select(User).where(User.email == u["email"])).scalar_one()

        # 2) create status (assume created on empty DB; idempotent on re-run)
        status_create = UserStatusCreate(user_id=user.id, status=u["status"])
        upsert_user_status(db, status_create)
        log_json({
            "event": "user_status_create",
            "ts": _now_iso(),
            "action": "created",   # fresh DB assumption
            "user_id": user.id,
            "first_name": u["first_name"],
            "status": u["status"],
        })

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
        with SessionLocal() as db:
            seed_users_and_statuses(db)
        success = 1
    except Exception as e:
        error_type = e.__class__.__name__
        raise
    finally:
        duration = time.monotonic() - start
        log_json({
            "event": "apply_schema_and_seed_users",
            "schema_path": str(DEFAULT_SCHEMA_PATH),
            "duration_seconds": round(duration, 6),
            "success": success,
            "schema_statements": stmt_count,
            "error_type": error_type,
            "ts": ts.isoformat(),
            "ts_unix": int(ts.timestamp()),
        })
        if success:
            print(f"Schema applied + users & statuses seeded via CRUD. Source: {DEFAULT_SCHEMA_PATH}")
        else:
            print(f"Failed to apply schema/seed from: {DEFAULT_SCHEMA_PATH} ({error_type})")

if __name__ == "__main__":
    main()
