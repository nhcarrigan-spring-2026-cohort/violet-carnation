from pydantic import BaseModel, PositiveInt
from typing import Optional


class EventIn(BaseModel):
    name: str
    description: str
    location: str
    time: str
    organization_id: PositiveInt


class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    time: Optional[str] = None
    organization_id: Optional[PositiveInt] = None


class Event(BaseModel):
    id: PositiveInt
    name: str
    description: str
    location: str
    time: str
    organization_id: PositiveInt
