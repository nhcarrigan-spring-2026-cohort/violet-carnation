import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status

from db import get_connection
from models import EventRegistrationIn

router = APIRouter(prefix="/event-registrations", tags=["event_registrations"])


@router.get("", response_model=list[EventRegistrationIn])
def list_event_registrations(
    organization_id: int | None = None,
    event_id: int | None = None,
    user_id: int | None = None,
    skip: int = 0,
    limit: int = 10,
    conn: sqlite3.Connection = Depends(get_connection),
):
    """
    List event registrations, optionally filtered by organization, event, or user.

    :param organization_id: filter by organization ID
    :type organization_id: int | None
    :param event_id: filter by event ID
    :type event_id: int | None
    :param user_id: filter by user ID
    :type user_id: int | None
    :param conn: the connection to the database
    :type conn: sqlite3.Connection
    :param skip: number of rows to skip before returning results
    :type skip: int
    :param limit: max number of rows to return
    :type limit: int
    """
    if skip < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Skip cannot be negative"
        )
    if limit < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Limit must be at least 1"
        )

    query = """
		SELECT user_id, event_id, organization_id, registration_time
		FROM event_registrations
	"""
    conditions = []
    params: list[int] = []

    if organization_id is not None:
        conditions.append("organization_id = ?")
        params.append(organization_id)
    if event_id is not None:
        conditions.append("event_id = ?")
        params.append(event_id)
    if user_id is not None:
        conditions.append("user_id = ?")
        params.append(user_id)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    query += " ORDER BY registration_time DESC"
    query += " LIMIT ? OFFSET ?"
    params.extend([limit, skip])

    rows = conn.execute(query, params).fetchall()
    return [
        EventRegistrationIn(
            user_id=row["user_id"],
            event_id=row["event_id"],
            organization_id=row["organization_id"],
            registration_time=row["registration_time"],
        )
        for row in rows
    ]


@router.get(
    "/{organization_id}/{event_id}/{user_id}", response_model=EventRegistrationIn
)
def get_event_registration(
    organization_id: int,
    event_id: int,
    user_id: int,
    conn: sqlite3.Connection = Depends(get_connection),
):
    """
    Get a specific event registration by its composite identifiers.

    :param organization_id: the organization ID for the registration
    :type organization_id: int
    :param event_id: the event ID for the registration
    :type event_id: int
    :param user_id: the user ID for the registration
    :type user_id: int
    :param conn: the connection to the database
    :type conn: sqlite3.Connection
    """
    row = conn.execute(
        """
		SELECT user_id, event_id, organization_id, registration_time
		FROM event_registrations
		WHERE organization_id = ? AND event_id = ? AND user_id = ?
		""",
        (organization_id, event_id, user_id),
    ).fetchone()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Registration not found"
        )

    return EventRegistrationIn(
        user_id=row["user_id"],
        event_id=row["event_id"],
        organization_id=row["organization_id"],
        registration_time=row["registration_time"],
    )


@router.post(
    "", response_model=EventRegistrationIn, status_code=status.HTTP_201_CREATED
)
def create_event_registration(
    payload: EventRegistrationIn,
    conn: sqlite3.Connection = Depends(get_connection),
):
    """
    Create a new event registration.

    :param payload: the event registration details
    :type payload: EventRegistrationIn
    :param conn: the connection to the database
    :type conn: sqlite3.Connection
    """
    try:
        conn.execute(
            """
			INSERT INTO event_registrations (user_id, event_id, organization_id, registration_time)
			VALUES (?, ?, ?, ?)
			""",
            (
                payload.user_id,
                payload.event_id,
                payload.organization_id,
                payload.registration_time,
            ),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Registration already exists",
        )

    return payload


@router.delete(
    "/{organization_id}/{event_id}/{user_id}", response_model=EventRegistrationIn
)
def delete_event_registration(
    organization_id: int,
    event_id: int,
    user_id: int,
    conn: sqlite3.Connection = Depends(get_connection),
):
    """
    Delete an event registration.

    :param organization_id: the organization ID for the registration
    :type organization_id: int
    :param event_id: the event ID for the registration
    :type event_id: int
    :param user_id: the user ID for the registration
    :type user_id: int
    :param conn: the connection to the database
    :type conn: sqlite3.Connection
    """
    row = conn.execute(
        """
		SELECT user_id, event_id, organization_id, registration_time
		FROM event_registrations
		WHERE organization_id = ? AND event_id = ? AND user_id = ?
		""",
        (organization_id, event_id, user_id),
    ).fetchone()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Registration not found"
        )

    conn.execute(
        """
		DELETE FROM event_registrations
		WHERE organization_id = ? AND event_id = ? AND user_id = ?
		""",
        (organization_id, event_id, user_id),
    )
    conn.commit()

    return EventRegistrationIn(
        user_id=row["user_id"],
        event_id=row["event_id"],
        organization_id=row["organization_id"],
        registration_time=row["registration_time"],
    )
