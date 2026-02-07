from fastapi import APIRouter, Depends
from routes.organization_roles import router as organization_roles_router

router = APIRouter(prefix="/organization", tags=["organization"])

# no organization routes, bypassing this to focus on roles
@router.get("", response_model=None)
def get_organization(organization_id: int, conn=Depends()):
    """
    TODO: this has no response object as this router is incomplete. Implement
    """
    return {"message": "Not implemented"}

# TODO: add other route handling for organizations themselves, be sure to cleanup "roles" and "events" during deletion!


# TODO: not sure if this is the right pattern or not? 
router.include_router(organization_roles_router, prefix="/{organization_id}/users")