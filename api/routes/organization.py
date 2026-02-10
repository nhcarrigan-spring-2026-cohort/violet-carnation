import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status

from db import get_connection
from models import Organization, OrganizationCreate, OrganizationUpdate
from routes.organization_roles import router as organization_roles_router

router = APIRouter(prefix="/organization", tags=["organization"])

@router.get("", response_model=list[Organization])
def list_organizations(
    conn: sqlite3.Connection = Depends(get_connection),
    skip: int = 0,
    limit: int = 10,
    query: str | None = None,
):
    """
    List organizations with pagination and optional search query.

    :param conn: the connection to the database
    :type conn: sqlite3.Connection
    :param skip: number of records to skip for pagination, defaults to 0
    :type skip: int, optional
    :param limit: maximum number of records to return, defaults to 10
    :type limit: int, optional
    :param query: optional search query to filter organizations by name or description, defaults to None
    :type query: str | None, optional
    """
    base_sql = """
        SELECT organization_id, name, description, created_by_user_id
        FROM organizations
    """
    params: list[object] = []
    if query:
        base_sql += """
            WHERE lower(name) LIKE ?
               OR lower(description) LIKE ?
        """
        term = f"%{query.lower()}%"
        params.extend([term, term])

    base_sql += " ORDER BY organization_id LIMIT ? OFFSET ?"
    params.extend([limit, skip])

    rows = conn.execute(base_sql, params).fetchall()

    return [
        Organization(
            organization_id=row["organization_id"],
            name=row["name"],
            description=row["description"],
            created_by_user_id=row["created_by_user_id"],
        )
        for row in rows
    ]


@router.post("", response_model=Organization, status_code=status.HTTP_201_CREATED)
def create_organization(
    payload: OrganizationCreate,
    conn: sqlite3.Connection = Depends(get_connection),
):
    """
    Create an organization and grant the creator admin permissions.

    TODO: replace user_id with current user from authentication middleware.

    :param payload: organization details and user ID for the creator
    :type payload: OrganizationCreate
    :param conn: the connection to the database
    :type conn: sqlite3.Connection
    """
    user_row = conn.execute(
        "SELECT user_id FROM users WHERE user_id = ?",
        (payload.user_id,),
    ).fetchone()
    if user_row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    cursor = conn.execute(
        """
        INSERT INTO organizations (name, description, created_by_user_id)
        VALUES (?, ?, ?)
        """,
        (payload.name, payload.description, payload.user_id),
    )
    organization_id = cursor.lastrowid

    conn.execute(
        """
        INSERT INTO roles (user_id, organization_id, permission_level)
        VALUES (?, ?, ?)
        """,
        (payload.user_id, organization_id, "admin"),
    )
    conn.commit()

    return Organization(
        organization_id=organization_id,
        name=payload.name,
        description=payload.description,
        created_by_user_id=payload.user_id,
    )


@router.delete("/{organization_id}", response_model=Organization)
def delete_organization(
    organization_id: int,
    user_id: int,
    conn: sqlite3.Connection = Depends(get_connection),
):
    """
    Delete an organization if the requesting user is the creator.

    TODO: replace user_id with current user from authentication middleware.

    :param organization_id: the organization to delete
    :type organization_id: int
    :param user_id: the user attempting deletion
    :type user_id: int
    :param conn: the connection to the database
    :type conn: sqlite3.Connection
    """
    row = conn.execute(
        """
        SELECT organization_id, name, description, created_by_user_id
        FROM organizations
        WHERE organization_id = ?
        """,
        (organization_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    if row["created_by_user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the organization creator can delete this organization",
        )

    conn.execute(
        "DELETE FROM organizations WHERE organization_id = ?",
        (organization_id,),
    )
    conn.commit()

    return Organization(
        organization_id=row["organization_id"],
        name=row["name"],
        description=row["description"],
        created_by_user_id=row["created_by_user_id"],
    )


@router.put("/{organization_id}", response_model=Organization)
def update_organization(
    organization_id: int,
    payload: OrganizationUpdate,
    conn: sqlite3.Connection = Depends(get_connection),
):
    """
    Update organization name/description if the user is an admin.

    TODO: replace user_id with current user from authentication middleware.

    :param organization_id: the organization to update
    :type organization_id: int
    :param payload: updated organization data and user ID
    :type payload: OrganizationUpdate
    :param conn: the connection to the database
    :type conn: sqlite3.Connection
    """
    row = conn.execute(
        """
        SELECT organization_id, name, description, created_by_user_id
        FROM organizations
        WHERE organization_id = ?
        """,
        (organization_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    role_row = conn.execute(
        """
        SELECT permission_level
        FROM roles
        WHERE organization_id = ? AND user_id = ?
        """,
        (organization_id, payload.user_id),
    ).fetchone()
    if role_row is None or role_row["permission_level"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organization admins can update this organization",
        )

    updated_name = payload.name if payload.name is not None else row["name"]
    updated_description = (
        payload.description if payload.description is not None else row["description"]
    )

    conn.execute(
        """
        UPDATE organizations
        SET name = ?, description = ?
        WHERE organization_id = ?
        """,
        (updated_name, updated_description, organization_id),
    )
    conn.commit()

    return Organization(
        organization_id=row["organization_id"],
        name=updated_name,
        description=updated_description,
        created_by_user_id=row["created_by_user_id"],
    )


# TODO: not sure if this is the right pattern or not? 
router.include_router(organization_roles_router, prefix="/{organization_id}/users")