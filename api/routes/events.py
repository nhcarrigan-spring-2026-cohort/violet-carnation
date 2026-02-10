import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status
from db import get_connection
from models import Event, EventIn

router = APIRouter(prefix="/events", tags=["events"])

# Get a list of all events. 
@router.get('', response_model=None)
def list_events(conn=Depends(get_connection)):
    """
    TODO: Empty
    """
    rows = conn.execute("SELECT id, name, description, location, time, organization_id FROM events ORDER BY id").fetchall()
    return [Event(id=row["id"], name=row["name"], description=row['description'], location=row['location'], time=row['time'], organization_id=row['organization_id']) for row in rows]

# Get a single event. 
@router.get("/{event_id}", response_model=None)
def get_event(event_id: int, conn=Depends(get_connection)):
    """
    TODO: this has no response object as this router is incomplete. Implement
    """
    row = conn.execute(
        "SELECT id, name, description, location, time, organization_id FROM events WHERE id = ?",
        (event_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return Event(id=row["id"], name=row["name"], description=row['description'], location=row['location'], time=row['time'], organization_id=row['organization_id'])


# Add an event to the db.
@router.post("", status_code=status.HTTP_201_CREATED)
def add_event(payload: EventIn, conn=Depends(get_connection)):
    cursor = conn.execute("INSERT INTO events (name, description, location, time, organization_id) VALUES (?, ?, ?, ?, ?)", (payload.name, payload.description, payload.location, payload.time, payload.organization_id))
    conn.commit()
    return Event(id=cursor.lastrowid, name=payload.name, description=payload.description, location=payload.location, time=payload.time, organization_id=payload.organization_id)



# Put/update request
@router.put("/{event_id}", response_model=None )
def update_event(event_id: int, conn=Depends(get_connection)):
    return {"message": 'Not implemented'}

# Destroy event
@router.delete("/{event_id}", response_model=None)
def delete_event(event_id: int, conn=Depends(get_connection)):
    return {"message": 'Not implemented'}