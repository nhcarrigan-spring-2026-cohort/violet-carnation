
from pydantic import BaseModel, PositiveInt

class EventIn(BaseModel):
    name: str
    description: str
    location: str
    time: str
    organization_id: PositiveInt


class Event(BaseModel):
    id: PositiveInt
    name: str
    description: str
    location: str
    time: str
    organization_id: PositiveInt