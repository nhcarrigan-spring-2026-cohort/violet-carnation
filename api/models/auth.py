from typing import Optional

from pydantic import BaseModel, EmailStr, PositiveInt


class SignupRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    password: str
    org_name: Optional[str] = None
    org_description: Optional[str] = None


class SignupResponse(BaseModel):
    user_id: PositiveInt
    email: EmailStr
    first_name: str
    last_name: str
    role: str
    org_id: Optional[int] = None
