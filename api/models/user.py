from sqlmodel import Field, SQLModel
from datetime import datetime

class Users(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True) # optional, system create id
    roleId: int | None = Field(default=None, index=True) # optional
    name: str = Field(index=True) # required
    location: str = Field(index=True)  # required
    education: str = Field(index=True) # required
    
class UsersUpdate(SQLModel): # to update all the fields are optional
    roleId: int | None = None
    name: str | None = None
    location: str | None = None
    education: str | None = None
