from pydantic import BaseModel


class UserIn(BaseModel):
    name: str


class User(BaseModel):
    id: int
    name: str
