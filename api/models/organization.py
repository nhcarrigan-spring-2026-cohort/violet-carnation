from typing import Optional

from pydantic import BaseModel, PositiveInt


class Organization(BaseModel):
    organization_id: PositiveInt
    name: str
    description: Optional[str] = None
    created_by_user_id: PositiveInt


class OrganizationCreate(BaseModel):
    name: str
    description: Optional[str] = None
    user_id: PositiveInt


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    user_id: PositiveInt
