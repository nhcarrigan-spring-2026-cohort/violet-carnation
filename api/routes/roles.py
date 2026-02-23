import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status

from db import get_connection
from models import Role

router = APIRouter(prefix="/roles")


@router.get("", response_model=list[Role])
def get_user_roles(user_id: int, conn: sqlite3.Connection = Depends(get_connection)):
    """
    Return all roles for a given user across all organizations.

    TODO: Once authentication is implemented, derive user_id from the token
    instead of accepting it as a query parameter.

    :param user_id: the ID of the user whose roles to retrieve
    :type user_id: int
    :param conn: the connection to the database
    :type conn: sqlite3.Connection
    """
    user_row = conn.execute(
        "SELECT user_id FROM users WHERE user_id = ?", (user_id,)
    ).fetchone()
    if user_row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    rows = conn.execute(
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
