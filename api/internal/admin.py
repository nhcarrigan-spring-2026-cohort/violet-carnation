from fastapi import APIRouter

router = APIRouter(prefix="/admin",tags=["admin"],responses={404: {"description": "Not found"}})


@router.get("/")
def read_users():
    return {"message": "I am an admin"}