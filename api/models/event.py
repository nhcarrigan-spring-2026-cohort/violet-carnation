from datetime import datetime
from pydantic import BaseModel, PositiveInt
from typing import Optional


class EventIn(BaseModel):
    name: str
    description: str
    location: str
    date_time: datetime
    organization_id: PositiveInt


class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    date_time: Optional[datetime] = None
    organization_id: Optional[PositiveInt] = None


class Event(BaseModel):
    id: PositiveInt
    name: str
    description: str
    location: str
    date_time: datetime
    organization_id: PositiveInt
