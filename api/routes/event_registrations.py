import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status

from db import get_connection
from models import EventRegistrationIn, EventRegistrationWithEvent
from utils.auth import get_current_user

router = APIRouter(prefix="/event-registrations", tags=["event_registrations"])


@router.get(
    "", response_model=list[EventRegistrationWithEvent] | list[EventRegistrationIn]
)
def list_event_registrations(
    organization_id: int | None = None,
    event_id: int | None = None,
    skip: int = 0,
    limit: int = 10,
    include_event_details: bool = False,
    _conn: sqlite3.Connection = Depends(get_connection),
    current_user: dict = Depends(get_current_user),
):
    """
    List event registrations, optionally filtered by organization or event.
    The user is derived from the current session.

    :param organization_id: filter by organization ID
    :type organization_id: int | None
    :param event_id: filter by event ID
    :type event_id: int | None
    :param skip: number of rows to skip before returning results
    :type skip: int
    :param limit: max number of rows to return
    :type limit: int
    :param include_event_details: when True, JOIN with events table and return enriched rows
    :type include_event_details: bool
    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    """
    user_id = current_user["user_id"]
    if skip < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Skip cannot be negative"
        )
    if limit < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Limit must be at least 1"
        )

    if include_event_details:
        query = """
			SELECT er.user_id, er.event_id, er.organization_id, er.registration_time,
			       e.name AS event_name, e.location AS event_location, e.date_time AS event_date_time
			FROM event_registrations er
			JOIN events e ON er.event_id = e.id
		"""
    else:
        query = """
			SELECT user_id, event_id, organization_id, registration_time
			FROM event_registrations
		"""

    conditions = []
    params: list[int] = []

    if organization_id is not None:
        conditions.append(
            ("er.organization_id" if include_event_details else "organization_id")
            + " = ?"
        )
        params.append(organization_id)
    if event_id is not None:
        conditions.append(
            ("er.event_id" if include_event_details else "event_id") + " = ?"
        )
        params.append(event_id)
    if user_id is not None:
        conditions.append(
            ("er.user_id" if include_event_details else "user_id") + " = ?"
        )
        params.append(user_id)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    query += (
        " ORDER BY "
        + ("er.registration_time" if include_event_details else "registration_time")
        + " DESC"
    )
    query += " LIMIT ? OFFSET ?"
    params.extend([limit, skip])

    rows = _conn.execute(query, params).fetchall()

    if include_event_details:
        return [
            EventRegistrationWithEvent(
                user_id=row["user_id"],
                event_id=row["event_id"],
                organization_id=row["organization_id"],
                registration_time=row["registration_time"],
                event_name=row["event_name"],
                event_location=row["event_location"],
                event_date_time=row["event_date_time"],
            )
            for row in rows
        ]

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
    _conn: sqlite3.Connection = Depends(get_connection),
    current_user: dict = Depends(get_current_user),
):
    """
    Get a specific event registration by its composite identifiers.
    Returns 403 Forbidden if the registration does not belong to the current user.

    :param organization_id: the organization ID for the registration
    :type organization_id: int
    :param event_id: the event ID for the registration
    :type event_id: int
    :param user_id: the user ID for the registration
    :type user_id: int
    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    """
    row = _conn.execute(
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
    if row["user_id"] != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden"
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
    _conn: sqlite3.Connection = Depends(get_connection),
    _current_user: dict = Depends(get_current_user),
):
    """
    Create a new event registration.

    :param payload: the event registration details
    :type payload: EventRegistrationIn
    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    """
    try:
        _conn.execute(
            """
			INSERT INTO event_registrations (user_id, event_id, organization_id, registration_time)
			VALUES (?, ?, ?, ?)
			""",
            (
                _current_user["user_id"],
                payload.event_id,
                payload.organization_id,
                payload.registration_time,
            ),
        )
        _conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Registration already exists",
        )

    return EventRegistrationIn(
        user_id=_current_user["user_id"],
        event_id=payload.event_id,
        organization_id=payload.organization_id,
        registration_time=payload.registration_time,
    )


@router.delete(
    "/{organization_id}/{event_id}/{user_id}", response_model=EventRegistrationIn
)
def delete_event_registration(
    organization_id: int,
    event_id: int,
    user_id: int,
    _conn: sqlite3.Connection = Depends(get_connection),
    _current_user: dict = Depends(get_current_user),
):
    """
    Delete an event registration.

    :param organization_id: the organization ID for the registration
    :type organization_id: int
    :param event_id: the event ID for the registration
    :type event_id: int
    :param user_id: the user ID for the registration
    :type user_id: int
    :param _conn: the connection to the database
    :type _conn: sqlite3.Connection
    """
    if user_id != _current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own registrations",
        )

    row = _conn.execute(
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

    _conn.execute(
        """
		DELETE FROM event_registrations
		WHERE organization_id = ? AND event_id = ? AND user_id = ?
		""",
        (organization_id, event_id, user_id),
    )
    _conn.commit()

    return EventRegistrationIn(
        user_id=row["user_id"],
        event_id=row["event_id"],
        organization_id=row["organization_id"],
        registration_time=row["registration_time"],
    )
