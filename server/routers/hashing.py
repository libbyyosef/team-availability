from passlib.context import CryptContext

_pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Return bcrypt hash for storage in DB."""
    return _pwd_ctx.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compare a plain password against a stored hash."""
    if not hashed_password:
        return False
    return _pwd_ctx.verify(plain_password, hashed_password)
