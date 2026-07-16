from jose import jwt, JWTError
from fastapi import HTTPException, Header
from datetime import datetime, timedelta
import hashlib
import os

SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 hours

def hash_password(password: str) -> str:
    """Simple SHA256 hash — good enough for a demo project."""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain: str, hashed: str) -> bool:
    return hashlib.sha256(plain.encode()).hexdigest() == hashed

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(authorization: str = Header(...)) -> dict:
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid auth scheme")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"sub": payload.get("sub"), "role": payload.get("role")}
    except (JWTError, ValueError, AttributeError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
