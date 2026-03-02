import sqlite3
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, PositiveInt

from db import get_connection
from models import RoleAndUser, RoleUpdate
from utils.auth import get_current_user


class RoleCreateRequest(BaseModel):
    user_id: Optional[PositiveInt] = None
    permission_level: Literal["admin", "volunteer"]


router = APIRouter(prefix="")


@router.get("", response_model=list[RoleAndUser])
def list_organization_users(
    organization_id: int, _conn: sqlite3.Connection = Depends(get_connection), _current_user: dict = Depends(get_current_user)
):
    """
    List all users in an organization, along with their role. This is used to manage users in an organization, and to display the list of users in an organization.

    TODO: add pagination/filtering against role

    :param organization_id: the ID of the organization to list users for
    :type organization_id: int
    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    """
    rows = _conn.execute(
        """
        SELECT r.user_id, r.organization_id,  r.permission_level, u.first_name, u.last_name
        FROM roles r
        JOIN users u ON r.user_id = u.user_id
        WHERE r.organization_id = ?
        """,
        (organization_id,),
    ).fetchall()

    return [
        RoleAndUser(
            user_id=row["user_id"],
            organization_id=organization_id,
            name=f"{row['first_name']} {row['last_name']}",
            permission_level=row["permission_level"],
        )
        for row in rows
    ]


@router.post("", response_model=RoleAndUser, status_code=status.HTTP_201_CREATED)
def add_organization_user(
    organization_id: int,
    payload: RoleCreateRequest,
    _conn: sqlite3.Connection = Depends(get_connection),
    _current_user: dict = Depends(get_current_user),
):
    """
    Add a user to an organization by creating a role record. This can currently be done by anyone, even those not in the organization.

    Later this will change to only be able to be performed by admins of the organization and the user themselves, where the user themselves can just make themselves a volunteer.

    :param organization_id: the organization to add the user to
    :type organization_id: int
    :param payload: the user ID and permission level for the role
    :type payload: RoleCreate
    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    """
    effective_user_id = (
        payload.user_id if payload.user_id is not None else _current_user["user_id"]
    )

    user_row = _conn.execute(
        "SELECT user_id, first_name, last_name FROM users WHERE user_id = ?",
        (effective_user_id,),
    ).fetchone()
    if user_row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    try:
        _conn.execute(
            """
            INSERT INTO roles (user_id, organization_id, permission_level)
            VALUES (?, ?, ?)
            """,
            (effective_user_id, organization_id, payload.permission_level),
        )
        _conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already has a role in this organization",
        )

    return RoleAndUser(
        user_id=effective_user_id,
        organization_id=organization_id,
        name=f"{user_row['first_name']} {user_row['last_name']}",
        permission_level=payload.permission_level,
    )


@router.delete(
    "/{user_id}",
    response_model=RoleAndUser,
    summary="Remove a user from an organization",
)
def remove_organization_user(
    organization_id: int,
    user_id: int,
    _conn: sqlite3.Connection = Depends(get_connection),
    _current_user: dict = Depends(get_current_user),
):
    """
    Remove a user from an organization by deleting their role connecting the user and the organization. This can only be performed by users within the organization with the role of admin, or
    the user themselves. This endpoint returns the role and user that was removed, which can be used to display a confirmation message to the user.

    :param organization_id: the organization to remove the user from
    :type organization_id: int
    :param user_id: the user to remove
    :type user_id: int
    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    """

    # Check permission: must be the target user or an org admin
    if user_id != _current_user["user_id"]:
        admin_row = _conn.execute(
            "SELECT permission_level FROM roles WHERE organization_id = ? AND user_id = ? AND permission_level = 'admin'",
            (organization_id, _current_user["user_id"]),
        ).fetchone()
        if admin_row is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins or the user themselves can remove a member",
            )

    row = _conn.execute(
        """
        SELECT r.user_id, r.organization_id, r.permission_level, u.first_name, last_name
        FROM roles r
        JOIN users u ON r.user_id = u.user_id
        WHERE r.organization_id = ? AND r.user_id = ?
        """,
        (organization_id, user_id),
    ).fetchone()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # TODO: verify the organization creator cannot be removed.
    _conn.execute(
        "DELETE FROM roles WHERE organization_id = ? AND user_id = ?",
        (organization_id, user_id),
    )
    _conn.commit()

    return RoleAndUser(
        user_id=row["user_id"],
        organization_id=organization_id,
        name=f"{row['first_name']} {row['last_name']}",
        permission_level=row["permission_level"],
    )


@router.put(
    "/{user_id}",
    response_model=RoleAndUser,
    summary="Update a user's role in an organization",
)
def update_organization_user_role(
    organization_id: int,
    user_id: int,
    payload: RoleUpdate,
    _conn: sqlite3.Connection = Depends(get_connection),
    _current_user: dict = Depends(get_current_user),
):
    """
    Update a user's permission level in an organization.

    :param organization_id: the organization to update the user in
    :type organization_id: int
    :param user_id: the user to update
    :type user_id: int
    :param payload: the new permission level
    :type payload: RoleUpdate
    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    """
    admin_row = _conn.execute(
        "SELECT permission_level FROM roles WHERE organization_id = ? AND user_id = ? AND permission_level = 'admin'",
        (organization_id, _current_user["user_id"]),
    ).fetchone()
    if admin_row is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organization admins can update member roles",
        )

    row = _conn.execute(
        """
        SELECT r.user_id, r.organization_id, r.permission_level, u.first_name, u.last_name
        FROM roles r
        JOIN users u ON r.user_id = u.user_id
        WHERE r.organization_id = ? AND r.user_id = ?
        """,
        (organization_id, user_id),
    ).fetchone()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    _conn.execute(
        """
        UPDATE roles
        SET permission_level = ?
        WHERE organization_id = ? AND user_id = ?
        """,
        (payload.permission_level, organization_id, user_id),
    )
    _conn.commit()

    return RoleAndUser(
        user_id=row["user_id"],
        organization_id=organization_id,
        name=f"{row['first_name']} {row['last_name']}",
        permission_level=payload.permission_level,
    )
