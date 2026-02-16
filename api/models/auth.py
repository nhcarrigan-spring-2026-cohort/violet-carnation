from pydantic import BaseModel, EmailStr, PositiveInt


class SignupRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    password: str


class SignupResponse(BaseModel):
    user_id: PositiveInt
    email: EmailStr
    first_name: str
    last_name: str


class RequestResetBody(BaseModel):
    email: EmailStr


class ResetPasswordBody(BaseModel):
    token: str
    new_password: str
