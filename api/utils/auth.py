import sqlite3

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from db import get_connection
from utils.security import decode_access_token

# Points to our login endpoint so Swagger UI knows where to send credentials. We are telling FastAPI to look for a bearer token in the Auth header.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    conn: sqlite3.Connection = Depends(get_connection),
) -> dict:
    """
    Decode the JWT from the Authorization header, fetch the user from the DB,
    and return a dict with user info and role.

    Raises 401 if the token is invalid/expired or the user no longer exists.
    """
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
