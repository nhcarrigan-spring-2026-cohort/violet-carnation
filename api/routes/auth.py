import logging
import sqlite3
from datetime import timedelta

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from db import get_connection
from models.auth import RequestResetBody, ResetPasswordBody, SignupRequest, SignupResponse
from utils.auth import get_current_user
from utils.security import create_access_token, decode_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, conn: sqlite3.Connection = Depends(get_connection)):
    """
    Register a new user.
    """
    # Check for duplicate email
    existing = conn.execute(
        "SELECT user_id FROM users WHERE email = ?",
        (payload.email,),
    ).fetchone()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    # Create the user
    user_cursor = conn.execute(
        "INSERT INTO users (email, first_name, last_name) VALUES (?, ?, ?)",
        (payload.email, payload.first_name, payload.last_name),
    )
    user_id = user_cursor.lastrowid

    # Store hashed password in credentials table
    conn.execute(
        "INSERT INTO credentials (user_id, hashed_password) VALUES (?, ?)",
        (user_id, hash_password(payload.password)),
    )

    conn.commit()

    return SignupResponse(
        user_id=user_id,
        email=payload.email,
        first_name=payload.first_name,
        last_name=payload.last_name,
    )


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    conn: sqlite3.Connection = Depends(get_connection),
):
    """
    Authenticate a user and return a JWT access token.

    Accepts `username` (the user's email) and `password` via OAuth2 form data.
    """
    # Look up user by email 
    # Note: Auth2 spec uses "username" field
    user = conn.execute(
        "SELECT user_id, email FROM users WHERE email = ?",
        (form_data.username,),
    ).fetchone()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password from credentials table
    cred = conn.execute(
        "SELECT hashed_password FROM credentials WHERE user_id = ?",
        (user["user_id"],),
    ).fetchone()
    if cred is None or not verify_password(form_data.password, cred["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": str(user["user_id"])})
    return {"access_token": token, "token_type": "bearer"}


RESET_TOKEN_EXPIRE_MINUTES = 15
logger = logging.getLogger(__name__)


@router.post("/request-reset")
def request_reset(payload: RequestResetBody, conn: sqlite3.Connection = Depends(get_connection)):
    """
    Request a password reset. If the email exists, a short-lived reset token is
    generated and logged to the console.

    Always returns 200 with a generic message to prevent email enumeration.
    """
    user = conn.execute(
        "SELECT user_id FROM users WHERE email = ?",
        (payload.email,),
    ).fetchone()

    if user:
        reset_token = create_access_token(
            {"sub": str(user["user_id"]), "purpose": "password_reset"},
            expires_delta=timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES),
        )
        print(f"PASSWORD RESET TOKEN for {payload.email}: {reset_token}")

    return {"message": "If that email exists, a reset link has been sent"}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordBody, conn: sqlite3.Connection = Depends(get_connection)):
    """
    Reset a user's password using a valid reset token.
    """
    try:
        claims = decode_access_token(payload.token)
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    # Ensure this token was created for password reset
    if claims.get("purpose") != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token",
        )

    user_id = claims.get("sub")

    # Update the hashed password in credentials
    result = conn.execute(
        "UPDATE credentials SET hashed_password = ? WHERE user_id = ?",
        (hash_password(payload.new_password), user_id),
    )
    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    conn.commit()

    return {"message": "Password has been reset successfully"}


@router.delete("/delete-account")
def delete_account(
    current_user: dict = Depends(get_current_user),
    conn: sqlite3.Connection = Depends(get_connection),
):
    """
    Delete the currently authenticated user's account.

    Removes credentials and the user record.
    """
    user_id = current_user["user_id"]

    # Delete credentials (password hash)
    conn.execute("DELETE FROM credentials WHERE user_id = ?", (user_id,))

    # Delete the user record
    conn.execute("DELETE FROM users WHERE user_id = ?", (user_id,))

    conn.commit()

    return {"message": "Account deleted successfully"}
