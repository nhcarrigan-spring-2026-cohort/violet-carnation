
from pydantic import BaseModel, PositiveInt

class UserIn(BaseModel):
    name: str


class User(BaseModel):
    id: PositiveInt
    name: str
