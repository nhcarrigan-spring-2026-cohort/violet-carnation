import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status

from db import get_connection
from models import User
from models.user import Availability, UserIn

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[User])
def list_users(
    conn: sqlite3.Connection = Depends(get_connection),
    skip: int = 0,
    limit: int = 10,
    query: str | None = None,
    availability: Availability | None = None,
):
    """
    List users with pagination, optional search query and the ability to filter by specific properties, currently supporting:

    - availability

    :param conn: the connection to the database
    :type conn: sqlite3.Connection
    :param skip: number of records to skip for pagination, defaults to 0
    :type skip: int, optional
    :param limit: maximum number of records to return, defaults to 10
    :type limit: int, optional
    :param query: optional search query to filter users by email, first name, or last name, defaults to None
    :type query: str | None, optional
    """

    base_sql = """
        SELECT user_id, email, first_name, last_name, availability
        FROM users
    """
    params: list[object] = []
    conditions: list[str] = []

    if query:
        conditions.append(
            "(lower(email) LIKE ? OR lower(first_name) LIKE ? OR lower(last_name) LIKE ?)"
        )
        term = f"%{query.lower()}%"
        params.extend([term, term, term])

    if availability:
        conditions.append("availability = ?")
        params.append(availability)

    if conditions:
        base_sql += " WHERE " + " AND ".join(conditions)

    base_sql += " ORDER BY user_id LIMIT ? OFFSET ?"
    params.extend([limit, skip])

    rows = conn.execute(base_sql, params).fetchall()
    return [
        User(
            user_id=row["user_id"],
            email=row["email"],
            first_name=row["first_name"],
            last_name=row["last_name"],
            availability=row["availability"],
        )
        for row in rows
    ]


@router.get("/{user_id}", response_model=User)
def get_user(user_id: int, conn: sqlite3.Connection = Depends(get_connection)):
    """
    Get a single user by their user ID. This should be mostly used for the current logged in user to get
    their own information, but again might change.

    :param user_id: Description
    :type user_id: int
    :param conn: the connection to the database
    :type conn: sqlite3.Connection
    """
    row = conn.execute(
        "SELECT user_id, email, first_name, last_name, availability FROM users WHERE user_id = ?",
        (user_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return User(
        user_id=row["user_id"],
        email=row["email"],
        first_name=row["first_name"],
        last_name=row["last_name"],
        availability=row["availability"],
    )


@router.post("", response_model=User, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserIn, conn: sqlite3.Connection = Depends(get_connection)):
    """
    TEMPORARY endpoint to create a new user in the database.
    This will change completely/get deleted once auth is implemented, as part of a registration flow, as
    that will create a user in the database

    TODO: document how to handle duplicate emails, which will result in an error currently.
    :param payload: Description
    :type payload: UserIn
    :param conn: Description
    :type conn: sqlite3.Connection
    """
    cursor = conn.execute(
        "INSERT INTO users (email, first_name, last_name, availability) VALUES (?, ?, ?, ?)",
        (payload.email, payload.first_name, payload.last_name, payload.availability),
    )
    conn.commit()
    return User(
        user_id=cursor.lastrowid,
        email=payload.email,
        first_name=payload.first_name,
        last_name=payload.last_name,
        availability=payload.availability,
    )
