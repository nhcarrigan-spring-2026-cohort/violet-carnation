import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status

from db import get_connection
from models import User, UserIn

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[User])
def list_users(conn: sqlite3.Connection = Depends(get_connection)):
    """
    Returns all users listed by the ID. This should be used to "search" for users to invite into an organization/event.
    
    TODO: pagination, search, filtering by user attributes which don't exist.
    
    
    :param conn: the connection to the database
    :type conn: sqlite3.Connection
    """
    rows = conn.execute("SELECT id, name FROM users ORDER BY id").fetchall()
    return [User(id=row["id"], name=row["name"]) for row in rows]


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
        "SELECT id, name FROM users WHERE id = ?",
        (user_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return User(id=row["id"], name=row["name"])


@router.post("", response_model=User, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserIn, conn: sqlite3.Connection = Depends(get_connection)):
    """
    TEMPORARY endpoint to create a new user in the database. 
    This will change completely/get deleted once auth is implemented, as part of a registration flow, as
    that will create a user in the database
    
    :param payload: Description
    :type payload: UserIn
    :param conn: Description
    :type conn: sqlite3.Connection
    """
    cursor = conn.execute("INSERT INTO users (name) VALUES (?)", (payload.name,))
    conn.commit()
    return User(id=cursor.lastrowid, name=payload.name)
