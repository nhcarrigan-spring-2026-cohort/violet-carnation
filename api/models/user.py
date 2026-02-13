from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, PositiveInt

Availability = Literal["Full-time", "Part-time", "Weekends", "Evenings"]


class UserIn(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    availability: Availability = "Part-time"


class User(BaseModel):
    user_id: PositiveInt
    email: EmailStr
    first_name: str
    last_name: str
    availability: Availability = "Part-time"


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    availability: Optional[Availability] = None

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
    # skills: Optional[str] = None
    # active: bool = True
    # registration_date: Optional[datetime] = None
