import sqlite3
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from db import get_connection
from models import Event, EventIn, EventUpdate
from utils.auth import get_current_user

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=None)
def list_events(
    # TODO: improve type
    begin_time: Optional[str] = None,
    end_time: Optional[str] = None,
    begin_date: Optional[str] = None,
    end_date: Optional[str] = None,
    is_weekday: Optional[bool] = None,
    organization_id: Optional[List[int]] = Query(default=None),
    availability: Optional[List[str]] = Query(default=None),
    category: Optional[List[str]] = Query(default=None),
    # TODO: Option B — split location into city/state columns for structured filtering
    location: Optional[str] = None,
    limit: Optional[int] = None,
    _conn=Depends(get_connection),
):
    """
    Get a list of all events with optional filtering by date/time and availability matching.
    Supports filtering by time range, date range, weekday/weekend, and organization.

    **note** time values must be in the format 'HH:MM' a value such as "8:00" will not work properly, it should be "08:00"

    :param begin_time: the earliest time of day to filter events by (e.g., '08:00:00'). Only the time portion is compared, ignoring the date
    :type begin_time: Optional[str]
    :param end_time: the latest time of day to filter events by (e.g., '18:00:00'). Only the time portion is compared, ignoring the date
    :type end_time: Optional[str]
    :param begin_date: the earliest date to filter events by. Events on or after this date will be included
    :type begin_date: Optional[str]
    :param end_date: the latest date to filter events by. Events on or before this date will be included
    :type end_date: Optional[str]
    :param is_weekday: filter events by weekday (True for Monday-Friday, False for Saturday-Sunday). If None, no weekday filtering is applied
    :type is_weekday: Optional[bool]
    :param organization_id: one or more organization IDs to filter by. Only events belonging to these organizations will be returned. If omitted, events from all organizations are returned
    :type organization_id: Optional[List[int]]
    :param availability: one or more availability options to filter by. Accepts 'Mornings' (06:00-11:59), 'Afternoons' (12:00-16:59), 'Evenings' (17:00-21:59), 'Weekends', or 'Flexible' (no restriction). Multiple values are combined with OR logic. If not provided or 'Flexible' is included, no availability filtering is applied
    :type availability: Optional[List[str]]
    :param category: one or more category names to filter by. Only events with a matching category will be returned
    :type category: Optional[List[str]]
    :param limit: the maximum number of events to return. If omitted, all matching events are returned
    :type limit: Optional[int]
    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    """
    query = "SELECT id, name, description, location, date_time, organization_id, category FROM events WHERE 1=1"
    params = []

    # Apply time-based filtering - compares only the time portion, ignoring date
    if begin_time is not None:
        query += " AND time(date_time) >= time(?)"
        params.append(begin_time)

    if end_time is not None:
        query += " AND time(date_time) <= time(?)"
        params.append(end_time)

    # Apply date-based filtering
    # Note: This assumes date_time column might contain date information or we use SQLite date functions
    if begin_date is not None:
        query += " AND date(date_time) >= date(?)"
        params.append(begin_date)

    if end_date is not None:
        query += " AND date(date_time) <= date(?)"
        params.append(end_date)

    # Apply weekday filtering using SQLite's strftime function
    # strftime('%w', date) returns 0-6 where 0=Sunday, 6=Saturday
    if is_weekday is not None:
        if is_weekday:
            # Weekdays: Monday(1) through Friday(5)
            query += (
                " AND CAST(strftime('%w', date(date_time)) AS INTEGER) BETWEEN 1 AND 5"
            )
        else:
            # Weekends: Saturday(6) and Sunday(0)
            query += " AND (strftime('%w', date(date_time)) IN ('0', '6'))"

    # Filter by one or more organization IDs
    # Handle empty list case: if organization_id is explicitly an empty list,
    # return no results (user has no orgs to view)
    if organization_id is not None:
        if len(organization_id) == 0:
            # Empty list means no organizations to filter by - return empty result set
            return []
        placeholders = ",".join("?" * len(organization_id))
        query += f" AND organization_id IN ({placeholders})"
        params.extend(organization_id)

    # Filter by availability options using OR logic across all selected options.
    # 'Flexible' means no restriction — skip filtering entirely if present.
    if availability and "Flexible" not in availability:
        availability_conditions = []
        for option in availability:
            if option == "Weekends":
                availability_conditions.append(
                    "(strftime('%w', date(date_time)) IN ('0', '6'))"
                )
            elif option == "Mornings":
                availability_conditions.append(
                    "(time(date_time) BETWEEN '06:00' AND '11:59')"
                )
            elif option == "Afternoons":
                availability_conditions.append(
                    "(time(date_time) BETWEEN '12:00' AND '16:59')"
                )
            elif option == "Evenings":
                availability_conditions.append(
                    "(time(date_time) BETWEEN '17:00' AND '21:59')"
                )
        if availability_conditions:
            query += " AND (" + " OR ".join(availability_conditions) + ")"

    if category:
        placeholders = ",".join("?" * len(category))
        query += f" AND category IN ({placeholders})"
        params.extend(category)

    # Option A: free-text substring match on location field
    if location:
        query += " AND LOWER(location) LIKE LOWER(?)"
        params.append(f"%{location}%")

    query += " ORDER BY date_time ASC"

    if limit is not None:
        query += " LIMIT ?"
        params.append(limit)

    rows = _conn.execute(query, params).fetchall()
    return [
        Event(
            id=row["id"],
            name=row["name"],
            description=row["description"],
            location=row["location"],
            date_time=row["date_time"],
            organization_id=row["organization_id"],
            category=row["category"],
        )
        for row in rows
    ]


@router.get("/recommended", response_model=list[Event])
def recommended_events(
    limit: int = 10,
    _conn: sqlite3.Connection = Depends(get_connection),
    current_user: dict = Depends(get_current_user),
):
    """
    Get a list of events recommended for the currently authenticated user.

    Recommendations are based on the user's interests (stored in the ``user_interests``
    table). Events the user has already registered for are excluded. Results are
    ordered so that events whose ``category`` matches one of the user's interests
    appear first, followed by all other events, both groups sorted by
    ``date_time`` ascending.

    :param limit: maximum number of events to return (default 10)
    :type limit: int
    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    """
    user_id = current_user["user_id"]
    # Load the user's interest categories
    interest_rows = _conn.execute(
        "SELECT category FROM user_interests WHERE user_id = ?", (user_id,)
    ).fetchall()
    interests = [r["category"] for r in interest_rows]

    if interests:
        placeholders = ",".join("?" * len(interests))
        query = f"""
            SELECT id, name, description, location, date_time, organization_id, category
            FROM events
            WHERE id NOT IN (
                SELECT event_id FROM event_registrations WHERE user_id = ?
            )
            ORDER BY CASE WHEN category IN ({placeholders}) THEN 0 ELSE 1 END,
                     date_time ASC
            LIMIT ?
        """
        params: list = [user_id] + interests + [limit]
    else:
        query = """
            SELECT id, name, description, location, date_time, organization_id, category
            FROM events
            WHERE id NOT IN (
                SELECT event_id FROM event_registrations WHERE user_id = ?
            )
            ORDER BY date_time ASC
            LIMIT ?
        """
        params = [user_id, limit]

    rows = _conn.execute(query, params).fetchall()
    return [Event(**dict(row)) for row in rows]


@router.get("/{event_id}", response_model=Event)
def get_event(event_id: int, _conn=Depends(get_connection)):
    """
    Get a single event by its ID.

    :param event_id: the ID of the event to retrieve
    :type event_id: int
    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    """
    row = _conn.execute(
        "SELECT id, name, description, location, date_time, organization_id, category FROM events WHERE id = ?",
        (event_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
        )
    return Event(
        id=row["id"],
        name=row["name"],
        description=row["description"],
        location=row["location"],
        date_time=row["date_time"],
        organization_id=row["organization_id"],
        category=row["category"],
    )


@router.post("", status_code=status.HTTP_201_CREATED)
def add_event(
    payload: EventIn,
    _conn=Depends(get_connection),
    _current_user: dict = Depends(get_current_user),
):
    """
    Create a new event and add it to the database.
    Only admins of the target organization may create events.

    :param payload: the event data to create
    :type payload: EventIn
    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    """
    role_row = _conn.execute(
        "SELECT permission_level FROM roles WHERE organization_id = ? AND user_id = ?",
        (payload.organization_id, _current_user["user_id"]),
    ).fetchone()
    if role_row is None or role_row["permission_level"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organization admins can create events",
        )

    cursor = _conn.execute(
        "INSERT INTO events (name, description, location, date_time, organization_id, category) VALUES (?, ?, ?, ?, ?, ?)",
        (
            payload.name,
            payload.description,
            payload.location,
            payload.date_time,
            payload.organization_id,
            payload.category,
        ),
    )
    _conn.commit()
    return Event(
        id=cursor.lastrowid,
        name=payload.name,
        description=payload.description,
        location=payload.location,
        date_time=payload.date_time,
        organization_id=payload.organization_id,
        category=payload.category,
    )


@router.put("/{event_id}", response_model=Event)
def update_event(
    event_id: int,
    payload: EventUpdate,
    _conn: sqlite3.Connection = Depends(get_connection),
    _current_user: dict = Depends(get_current_user),
):
    """
    Update an existing event with new data. Only fields provided in the payload will be updated.
    Only admins of the event's organization may update it.

    :param event_id: the ID of the event to update
    :type event_id: int
    :param payload: the event data to update
    :type payload: EventUpdate
    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    """
    row = _conn.execute(
        """
        SELECT id, name, description, location, date_time, organization_id, category
        FROM events
        WHERE id = ?
        """,
        (event_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
        )

    role_row = _conn.execute(
        "SELECT permission_level FROM roles WHERE organization_id = ? AND user_id = ?",
        (row["organization_id"], _current_user["user_id"]),
    ).fetchone()
    if role_row is None or role_row["permission_level"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organization admins can update events",
        )

    updated_name = payload.name if payload.name is not None else row["name"]
    updated_description = (
        payload.description if payload.description is not None else row["description"]
    )
    updated_location = (
        payload.location if payload.location is not None else row["location"]
    )
    updated_date_time = (
        payload.date_time if payload.date_time is not None else row["date_time"]
    )
    updated_organization_id = (
        payload.organization_id
        if payload.organization_id is not None
        else row["organization_id"]
    )
    updated_category = (
        payload.category if payload.category is not None else row["category"]
    )

    _conn.execute(
        """
        UPDATE events
        SET name = ?, description = ?, location = ?, date_time = ?, organization_id = ?, category = ?
        WHERE id = ?
        """,
        (
            updated_name,
            updated_description,
            updated_location,
            updated_date_time,
            updated_organization_id,
            updated_category,
            event_id,
        ),
    )
    _conn.commit()

    return Event(
        id=event_id,
        name=updated_name,
        description=updated_description,
        location=updated_location,
        date_time=updated_date_time,
        organization_id=updated_organization_id,
        category=updated_category,
    )


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    _conn=Depends(get_connection),
    _current_user: dict = Depends(get_current_user),
):
    """
    Delete an event from the database. Only admins of the event's organization may delete it.

    :param event_id: the ID of the event to delete
    :type event_id: int
    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    """
    row = _conn.execute(
        """
        SELECT id, name, description, location, date_time, organization_id
        FROM events
        WHERE id = ?
        """,
        (event_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
        )

    role_row = _conn.execute(
        "SELECT permission_level FROM roles WHERE organization_id = ? AND user_id = ?",
        (row["organization_id"], _current_user["user_id"]),
    ).fetchone()
    if role_row is None or role_row["permission_level"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organization admins can delete events",
        )

    _conn.execute(
        "DELETE FROM events WHERE id = ?",
        (event_id,),
    )
    _conn.commit()
