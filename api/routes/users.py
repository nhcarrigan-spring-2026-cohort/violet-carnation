import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status

from db import get_connection
from models import User
from models.user import UserUpdate
from utils.auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[User])
def list_users(
    _conn: sqlite3.Connection = Depends(get_connection),
    skip: int = 0,
    limit: int = 10,
    query: str | None = None,
    availability: str | None = None,
):
    """
    List users with pagination, optional search query and the ability to filter by specific properties, currently supporting:

    - availability

    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    :param skip: number of records to skip for pagination, defaults to 0
    :type skip: int, optional
    :param limit: maximum number of records to return, defaults to 10
    :type limit: int, optional
    :param query: optional search query to filter users by email, first name, or last name, defaults to None
    :type query: str | None, optional
    """

    base_sql = """
        SELECT u.user_id, u.email, u.first_name, u.last_name, u.availability, u.skills,
               GROUP_CONCAT(ui.category) as interests_str
        FROM users u
        LEFT JOIN user_interests ui ON u.user_id = ui.user_id
    """
    params: list[object] = []
    conditions: list[str] = []

    if query:
        conditions.append(
            "(lower(u.email) LIKE ? OR lower(u.first_name) LIKE ? OR lower(u.last_name) LIKE ?)"
        )
        term = f"%{query.lower()}%"
        params.extend([term, term, term])

    if availability:
        conditions.append("u.availability = ?")
        params.append(availability)

    if conditions:
        base_sql += " WHERE " + " AND ".join(conditions)

    base_sql += " GROUP BY u.user_id ORDER BY u.user_id LIMIT ? OFFSET ?"
    params.extend([limit, skip])

    rows = _conn.execute(base_sql, params).fetchall()
    return [
        User(
            user_id=row["user_id"],
            email=row["email"],
            first_name=row["first_name"],
            last_name=row["last_name"],
            availability=row["availability"],
            skills=row["skills"] or "",
            interests=row["interests_str"].split(",") if row["interests_str"] else [],
        )
        for row in rows
    ]


@router.get("/{user_id}", response_model=User)
def get_user(user_id: int, _conn: sqlite3.Connection = Depends(get_connection)):
    """
    Get a single user by their user ID. This should be mostly used for the current logged in user to get
    their own information, but again might change.

    :param user_id: Description
    :type user_id: int
    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    """
    row = _conn.execute(
        "SELECT user_id, email, first_name, last_name, availability, skills FROM users WHERE user_id = ?",
        (user_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    interest_rows = _conn.execute(
        "SELECT category FROM user_interests WHERE user_id = ?",
        (user_id,),
    ).fetchall()
    interests = [r["category"] for r in interest_rows]
    return User(
        user_id=row["user_id"],
        email=row["email"],
        first_name=row["first_name"],
        last_name=row["last_name"],
        availability=row["availability"],
        skills=row["skills"] or "",
        interests=interests,
    )



## All the users can modify the data. No permission level check is implemented yet
@router.put(
    "/{user_id}",
    response_model=User,
    summary="Update the user's profile fields",
)
def update_user(
    user_id: int,
    payload: UserUpdate,
    _conn: sqlite3.Connection = Depends(get_connection),
    current_user: dict = Depends(get_current_user),
):
    """
    # Update user profile fields.

    ### TODO: implement restriction to users admin.

    :param **user_id**: the user to update \n
    :type **user_id**: *int* \n
    :param **payload**: updated user data \n
    :type **payload**: *UserUpdate* \n
    :param **_conn**: the connection to the database \n
    :type **_conn**: *sqlite3.Connection* \n
    """
    if current_user.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    row = _conn.execute(
        """
        SELECT user_id, email, first_name, last_name, availability, skills
        FROM users
        WHERE user_id = ?
        """,
        (user_id,),
    ).fetchone()

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    updated_first_name = (
        payload.first_name if payload.first_name is not None else row["first_name"]
    )
    updated_last_name = (
        payload.last_name if payload.last_name is not None else row["last_name"]
    )
    updated_availability = (
        payload.availability
        if payload.availability is not None
        else row["availability"]
    )
    updated_skills = (
        payload.skills if payload.skills is not None else row["skills"] or ""
    )

    _conn.execute(
        """
        UPDATE users
        SET first_name = ?, last_name = ?, availability = ?, skills = ?
        WHERE user_id = ?
        """,
        (
            updated_first_name,
            updated_last_name,
            updated_availability,
            updated_skills,
            user_id,
        ),
    )

    # Upsert user_interests if provided
    if payload.interests is not None:
        _conn.execute(
            "DELETE FROM user_interests WHERE user_id = ?",
            (user_id,),
        )
        for category in payload.interests:
            _conn.execute(
                "INSERT OR IGNORE INTO user_interests (user_id, category) VALUES (?, ?)",
                (user_id, category),
            )

    _conn.commit()

    # Fetch updated interests
    interest_rows = _conn.execute(
        "SELECT category FROM user_interests WHERE user_id = ?",
        (user_id,),
    ).fetchall()
    updated_interests = [r["category"] for r in interest_rows]

    return User(
        user_id=row["user_id"],
        first_name=updated_first_name,
        last_name=updated_last_name,
        email=row["email"],
        availability=updated_availability,
        skills=updated_skills,
        interests=updated_interests,
    )
