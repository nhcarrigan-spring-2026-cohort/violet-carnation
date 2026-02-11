import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status

from db import get_connection
from models.auth import SignupRequest, SignupResponse
from utils.security import hash_password

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
