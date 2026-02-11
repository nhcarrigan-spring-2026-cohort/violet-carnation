from pydantic import BaseModel, PositiveInt


class EventRegistrationIn(BaseModel):
    user_id: PositiveInt
    event_id: PositiveInt
    organization_id: PositiveInt
    # **note** does not include timezone, we completely ignore it and assume all users
    # for an event are in the same timezone as the event itself.
    registration_time: str  # ISO 8601 format, e.g., "2024-06-01T12:00:00"
