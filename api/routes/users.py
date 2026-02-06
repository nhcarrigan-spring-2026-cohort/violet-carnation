from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from models.user import Users, UsersUpdate
from db import get_session # Assuming you have this defined

router = APIRouter(prefix="/users", tags=["users"])

#
# Get all the users
#

@router.get("/", response_model=list[Users])
async def read_users(session: Session = Depends(get_session)):
    users = session.exec(select(Users)).all()
    return users

#
# Get the number of users in DB
#

@router.get("/info/")
async def get_info(session: Session = Depends(get_session)):
    users = session.exec( select(Users)).all()
    return { "message": f"There are {len(users)} users helping"}

#
# Get a user by id
#

@router.get("/{id}", response_model=Users)
async def get_user_by_id(id: int, session: Session = Depends(get_session)):
  user = session.get(Users, id)
  if not user:
      raise HTTPException(status_code=404, detail="User not found")
  return user

#
# Create a new user
#

@router.post("/", response_model=Users)
async def create_user(*, session: Session = Depends(get_session), user: Users):
    db_user = Users.model_validate(user)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

#
# Delete user by id
#

@router.delete("/{user_id}")
async def delete_user(user_id: int, session: Session = Depends(get_session)):
  user = session.get(Users, user_id)
  if not user:
      raise HTTPException(status_code=404, detail="User not found")
  session.delete(user)
  session.commit()
  return {"ok": True}

#
# Update user by id
#

@router.patch("/users/{user_id}", response_model=Users)
async def update_user(user_id : int, user: UsersUpdate, session: Session = Depends(get_session)):
  db_user = session.get(Users, user_id)
  if not db_user:
      raise HTTPException(status_code=404, detail="User not found")
  user_data = user.model_dump(exclude_unset=True)
  db_user.sqlmodel_update(user_data)
  session.add(db_user)
  session.commit()
  session.refresh(db_user)
  return db_user
