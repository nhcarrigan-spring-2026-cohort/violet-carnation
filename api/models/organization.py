from typing import Optional

from pydantic import BaseModel, PositiveInt

from utils.categories import categoriesEnum


class Organization(BaseModel):
    organization_id: PositiveInt
    name: str
    description: Optional[str] = None
    category: categoriesEnum
    created_by_user_id: PositiveInt


class OrganizationCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: categoriesEnum


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: categoriesEnum
