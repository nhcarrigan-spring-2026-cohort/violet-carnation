from typing import List, Optional

from pydantic import BaseModel, EmailStr, PositiveInt


class UserIn(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    # TODO: resolve availability mismatch — frontend sends string[] (e.g. ["Mornings", "Weekends"]) but DB stores a single TEXT
    availability: Optional[str] = None
    skills: str = ""
    interests: list[str] = []


class User(BaseModel):
    user_id: PositiveInt
    email: EmailStr
    first_name: str
    last_name: str
    # TODO: resolve availability mismatch — frontend sends string[] (e.g. ["Mornings", "Weekends"]) but DB stores a single TEXT
    availability: Optional[str] = None
    skills: str = ""
    interests: list[str] = []


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    # TODO: resolve availability mismatch — frontend sends string[] (e.g. ["Mornings", "Weekends"]) but DB stores a single TEXT
    availability: Optional[str] = None
    skills: Optional[str] = None
    interests: Optional[list[str]] = None

    # removed for simplification
    # phone: Optional[str] = None
    # birth_date: Optional[str] = None
    # gender: Gender = "Prefer not to say"
    # identification_number: Optional[str] = None
    # country: Optional[str] = None
    # city: Optional[str] = None
    # address: Optional[str] = None
    # profile_picture: Optional[str] = None
    # education: Optional[str] = None
    # active: bool = True
    # registration_date: Optional[datetime] = None
