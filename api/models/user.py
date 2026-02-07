
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field, PositiveInt

Gender = Literal["Male", "Female", "Other", "Prefer not to say"]
Availability = Literal["Full-time", "Part-time", "Weekends", "Evenings"]

class UserIn(BaseModel):
    email: EmailStr
    password_hash: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    birth_date: Optional[str] = None
    gender: Gender = "Prefer not to say"
    identification_number: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    profile_picture: Optional[str] = None
    education: Optional[str] = None
    skills: Optional[str] = None
    availability: Availability = "Part-time"
    active: bool = True


class UserPublic(BaseModel):
    user_id: PositiveInt
    email: EmailStr
    first_name: str
    last_name: str


class User(BaseModel):
    user_id: PositiveInt
    email: EmailStr
    # password_hash: str --- IGNORE do not include in response model ---
    first_name: str
    last_name: str


    phone: Optional[str] = None
    birth_date: Optional[str] = None
    gender: Gender = "Prefer not to say"
    identification_number: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    profile_picture: Optional[str] = None
    education: Optional[str] = None
    skills: Optional[str] = None
    availability: Availability = "Part-time"
    active: bool = True
    registration_date: Optional[datetime] = None
