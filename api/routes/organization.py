import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status

from db import get_connection
from models import Organization, OrganizationCreate, OrganizationUpdate
from routes.organization_roles import router as organization_roles_router
from utils.auth import get_current_user

router = APIRouter(prefix="/organization", tags=["organization"])


@router.get("", response_model=list[Organization])
def list_organizations(
    _conn: sqlite3.Connection = Depends(get_connection),
    skip: int = 0,
    limit: int = 10,
    query: str | None = None,
):
    """
    List organizations with pagination and optional search query.

    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    :param skip: number of records to skip for pagination, defaults to 0
    :type skip: int, optional
    :param limit: maximum number of records to return, defaults to 10
    :type limit: int, optional
    :param query: optional search query to filter organizations by name or description, defaults to None
    :type query: str | None, optional
    """
    base_sql = """
        SELECT organization_id, name, description, category, created_by_user_id
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

    rows = _conn.execute(base_sql, params).fetchall()
    return [
        Organization(
            organization_id=row["organization_id"],
            name=row["name"],
            description=row["description"],
            category=row["category"],
            created_by_user_id=row["created_by_user_id"],
        )
        for row in rows
    ]


@router.post("", response_model=Organization, status_code=status.HTTP_201_CREATED)
def create_organization(
    payload: OrganizationCreate,
    _conn: sqlite3.Connection = Depends(get_connection),
    _current_user: dict = Depends(get_current_user),
):
    """
    Create an organization and grant the creator admin permissions.

    For the 'category' attribute, create your own or copy and paste from the following:
    1. Animal Welfare
    2. Hunger and Food Security
    3. Homelessness and Housing
    4. Education & Tutoring
    5. Youth and Children
    6. Senior Care and Support
    7. Health & Medical
    8. Environmental Conservation
    9. Community Development
    10. Arts & Culture
    11. Disaster Relief
    12. Veterans & Military Families
    13. Immigrants & Refugees
    14. Disability Services
    15. Mental Health & Crisis Support
    16. Advocacy & Human Rights
    17. Faith-Based Services
    18. Sports & Recreation
    19. Job Training & Employment
    20. Technology & Digital Literacy

    :param payload: organization details (name, description, category)
    :type payload: OrganizationCreate
    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    """
    user_id = _current_user["user_id"]

    cursor = _conn.execute(
        """
        INSERT INTO organizations (name, description, category, created_by_user_id)
        VALUES (?, ?, ?, ?)
        """,
        (payload.name, payload.description, payload.category, user_id),
    )
    organization_id = cursor.lastrowid

    _conn.execute(
        """
        INSERT INTO roles (user_id, organization_id, permission_level)
        VALUES (?, ?, ?)
        """,
        (user_id, organization_id, "admin"),
    )
    _conn.commit()

    return Organization(
        organization_id=organization_id,
        name=payload.name,
        description=payload.description,
        category=payload.category,
        created_by_user_id=user_id,
    )


@router.get("/{organization_id}", response_model=Organization)
def get_organization(
    organization_id: int,
    _conn: sqlite3.Connection = Depends(get_connection),
):
    """
    Get a single organization by ID.

    :param organization_id: the ID of the organization to retrieve
    :type organization_id: int
    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    """
    row = _conn.execute(
        """
        SELECT organization_id, name, description, created_by_user_id
        FROM organizations
        WHERE organization_id = ?
        """,
        (organization_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Organization not found")
    return Organization(
        organization_id=row["organization_id"],
        name=row["name"],
        description=row["description"],
        created_by_user_id=row["created_by_user_id"],
    )


@router.delete("/{organization_id}", response_model=Organization)
def delete_organization(
    organization_id: int,
    _conn: sqlite3.Connection = Depends(get_connection),
    _current_user: dict = Depends(get_current_user),
):
    """
    Delete an organization if the requesting user is the creator.

    :param organization_id: the organization to delete
    :type organization_id: int
    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    """
    row = _conn.execute(
        """
        SELECT organization_id, name, description, category, created_by_user_id
        FROM organizations
        WHERE organization_id = ?
        """,
        (organization_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found"
        )

    if row["created_by_user_id"] != _current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the organization creator can delete this organization",
        )

    _conn.execute(
        "DELETE FROM organizations WHERE organization_id = ?",
        (organization_id,),
    )
    _conn.commit()

    return Organization(
        organization_id=row["organization_id"],
        name=row["name"],
        description=row["description"],
        category=row["category"],
        created_by_user_id=row["created_by_user_id"],
    )


@router.put("/{organization_id}", response_model=Organization)
def update_organization(
    organization_id: int,
    payload: OrganizationUpdate,
    _conn: sqlite3.Connection = Depends(get_connection),
    _current_user: dict = Depends(get_current_user),
):
    """
    Update organization name/description if the user is an admin.

    :param organization_id: the organization to update
    :type organization_id: int
    :param payload: updated organization data
    :type payload: OrganizationUpdate
    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    """
    row = _conn.execute(
        """
        SELECT organization_id, name, description, created_by_user_id
        FROM organizations
        WHERE organization_id = ?
        """,
        (organization_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found"
        )

    role_row = _conn.execute(
        """
        SELECT permission_level
        FROM roles
        WHERE organization_id = ? AND user_id = ?
        """,
        (organization_id, _current_user["user_id"]),
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
    updated_category = (
        payload.category if payload.category is not None else row["category"]
    )

    _conn.execute(
        """
        UPDATE organizations
        SET name = ?, description = ?, category = ?
        WHERE organization_id = ?
        """,
        (updated_name, updated_description, updated_category, organization_id),
    )
    _conn.commit()

    return Organization(
        organization_id=row["organization_id"],
        name=updated_name,
        description=updated_description,
        category=updated_category,
        created_by_user_id=row["created_by_user_id"],
    )


# TODO: not sure if this is the right pattern or not?
router.include_router(organization_roles_router, prefix="/{organization_id}/users")
