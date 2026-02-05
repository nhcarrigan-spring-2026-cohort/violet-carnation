from fastapi import APIRouter

router = APIRouter(prefix="/users",tags=["users"],responses={404: {"description": "Not found"}})


@router.get("/signup")
def read_users():
    return {"message": "welcome...signed up successfully"}
