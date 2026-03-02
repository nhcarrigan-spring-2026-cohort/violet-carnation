import sqlite3
from typing import Optional

import jwt
from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from db import get_connection
from utils.security import decode_access_token

# Points to our login endpoint so Swagger UI knows where to send credentials. We are telling FastAPI to look for a bearer token in the Auth header.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(
    bearer_token: Optional[str] = Depends(oauth2_scheme),
    session: Optional[str] = Cookie(default=None),
    conn: sqlite3.Connection = Depends(get_connection),
) -> dict:
    """
    Decode the JWT from the session cookie or Authorization header, fetch the
    user from the DB, and return a dict with user info.

    The session cookie is checked first; the Authorization Bearer header is
    kept as a fallback so Swagger UI continues to work.

    Raises 401 if neither is present, the token is invalid/expired, or the
    user no longer exists.
    """
    token = session or bearer_token
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        claims = decode_access_token(token)
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = claims.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token claims",
            headers={"WWW-Authenticate": "Bearer"},
        )

    row = conn.execute(
        "SELECT user_id, email, first_name, last_name FROM users WHERE user_id = ?",
        (user_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "user_id": row["user_id"],
        "email": row["email"],
        "first_name": row["first_name"],
        "last_name": row["last_name"],
    }
