from pydantic import BaseModel, PositiveInt


class EventRegistrationIn(BaseModel):
    user_id: PositiveInt
    event_id: PositiveInt
    organization_id: PositiveInt
    # **note** does not include timezone, we completely ignore it and assume all users
    # for an event are in the same timezone as the event itself.
    registration_time: str  # ISO 8601 format, e.g., "2024-06-01T12:00:00"


class EventRegistrationWithEvent(BaseModel):
    user_id: int
    event_id: int
    organization_id: int
    registration_time: str
    event_name: str
    event_location: str
    event_date_time: str
