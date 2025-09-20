from __future__ import annotations
import json
import os
from typing import Any, Dict

from cryptography.fernet import Fernet, InvalidToken
from dotenv import load_dotenv

load_dotenv()

FERNET_SECRET = os.getenv("FERNET_SECRET", "").encode("utf-8")
if not FERNET_SECRET:
    raise RuntimeError("Missing FERNET_SECRET env var (44-char urlsafe base64)")

try:
    fernet = Fernet(FERNET_SECRET)
except Exception as e:
    raise RuntimeError("FERNET_SECRET is not a valid Fernet key") from e


def encrypt_cookie(payload: Dict[str, Any]) -> str:
    raw = json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return fernet.encrypt(raw).decode("utf-8")


def decrypt_cookie(token: str) -> Dict[str, Any]:
    try:
        raw = fernet.decrypt(token.encode("utf-8"))
        return json.loads(raw.decode("utf-8"))
    except (InvalidToken, ValueError, json.JSONDecodeError):
        raise
