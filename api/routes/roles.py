import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status

from db import get_connection
from models import Role
from utils.auth import get_current_user

router = APIRouter(prefix="/roles")


@router.get("", response_model=list[Role])
def get_user_roles(
    _conn: sqlite3.Connection = Depends(get_connection),
    current_user: dict = Depends(get_current_user),
):
    """
    Return all roles for the currently authenticated user across all organizations.

    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    """
    user_id = current_user["user_id"]

    user_row = _conn.execute(
        "SELECT user_id FROM users WHERE user_id = ?", (user_id,)
    ).fetchone()
    if user_row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    rows = _conn.execute(
        """
        SELECT user_id, organization_id, permission_level
        FROM roles
        WHERE user_id = ?
        """,
        (user_id,),
    ).fetchall()

    return [
        Role(
            user_id=row["user_id"],
            organization_id=row["organization_id"],
            permission_level=row["permission_level"],
        )
        for row in rows
    ]
