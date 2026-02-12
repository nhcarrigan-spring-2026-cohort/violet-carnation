import logging
import sqlite3
from datetime import timedelta

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from db import get_connection
from models.auth import RequestResetBody, ResetPasswordBody, SignupRequest, SignupResponse
from utils.security import create_access_token, decode_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, conn: sqlite3.Connection = Depends(get_connection)):
    """
    Register a new user.

    If `org_name` is provided, an organization is created and the user is registered
    as an org_admin linked to it. Otherwise the user is registered as a volunteer.
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

    is_org_admin = payload.org_name is not None
    org_id = None

    # Create the user first (organizations FK requires a valid user_id)
    user_cursor = conn.execute(
        "INSERT INTO users (email, first_name, last_name) VALUES (?, ?, ?)",
        (payload.email, payload.first_name, payload.last_name),
    )
    user_id = user_cursor.lastrowid

    if is_org_admin:
        # Create the organization linked to the new user
        org_cursor = conn.execute(
            """
            INSERT INTO organizations (name, description, created_by_user_id)
            VALUES (?, ?, ?)
            """,
            (payload.org_name, payload.org_description, user_id),
        )
        org_id = org_cursor.lastrowid
        # Grant admin role on the new org
        conn.execute(
            "INSERT INTO roles (user_id, organization_id, permission_level) VALUES (?, ?, ?)",
            (user_id, org_id, "admin"),
        )

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
        role="org_admin" if is_org_admin else "volunteer",
        org_id=org_id,
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

    # If user has an admin role in any org, they are org_admin.
    role_row = conn.execute(
        "SELECT permission_level FROM roles WHERE user_id = ? AND permission_level = 'admin' LIMIT 1",
        (user["user_id"],),
    ).fetchone()
    role = "org_admin" if role_row else "volunteer"

    token = create_access_token({"sub": str(user["user_id"]), "role": role})
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
