from typing import Literal
from pydantic import BaseModel, PositiveInt

class Role(BaseModel):
    user_id: PositiveInt
    organization_id: PositiveInt
    permission_level: Literal["admin", "volunteer"]


class RoleCreate(BaseModel):
    user_id: PositiveInt
    permission_level: Literal["admin", "volunteer"]


class RoleUpdate(BaseModel):
    permission_level: Literal["admin", "volunteer"]
  
class RoleAndUser(BaseModel):
    """
    Combination model that includes the role information and some user information. 

    If the UI needs more information about the user, then this should be updated. 
    """
    user_id: PositiveInt
    organization_id: PositiveInt
    name: str
    permission_level: Literal["admin", "volunteer"]