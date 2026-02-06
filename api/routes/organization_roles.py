import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status

from db import get_connection
from models import RoleAndUser

router = APIRouter(prefix="", tags=["organization_users"])
@router.get("", response_model=list[RoleAndUser])
def list_organization_users(organization_id: int, conn: sqlite3.Connection = Depends(get_connection)):
    """
    List all users in an organization, along with their role. This is used to manage users in an organization, and to display the list of users in an organization.
    
    TODO: add pagination/filtering against role

    :param organization_id: the ID of the organization to list users for
    :type organization_id: int
    :param conn: the connection to the database
    :type conn: sqlite3.Connection
    """
    rows = conn.execute(
        """
        SELECT r.user_id, r.organization_id,  r.permission_level, u.name
        FROM roles r
        JOIN users u ON r.user_id = u.id
        WHERE r.organization_id = ?
        """,
        (organization_id,),
    ).fetchall()

    return [
        RoleAndUser(
            user_id=row["user_id"],
            organization_id=organization_id,
            name=row["name"],
            permission_level=row["permission_level"],
        )
        for row in rows
    ]