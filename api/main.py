# instruccion to connect fastapi to sqlite in https://fastapi.tiangolo.com/tutorial/sql-databases/#install-sqlmodel
from typing import Annotated
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, Query, Response
from sqlmodel import Field, Session, SQLModel, create_engine, select

#
# creating the Users Model
#

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

#
# creating Organizations Model
#

class Organizations(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    roleId: int | None = Field(default=None, index=True)
    name: str = Field(index=True)
    type: str = Field(index=True)
    description: str = Field(index=True)

#
# creating Projects Model
#

class Projects(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    taskDescription: str = Field(index=True)
    isRemote: bool = Field(index=True)
    location: str = Field(index=True)
    hoursWeek: int = Field(index=True)
    startDate: datetime = Field(index=True)
    expectedEndDate: datetime = Field(index=True)
    expertiseAreas: str = Field(index=True)
    specializationArea: str = Field(index=True)
    language: str = Field(index=True)
    requiredEducation: str = Field(index=True)
    requiredSkillExperience: str = Field(index=True)
    requiredDrivingLicense: str = Field(index=True)
    livingConditions: str = Field(index=True)
    url: str = Field(index=True)

#
# Creating Roles Model
#

class Roles(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)

#
# Configuration parameters
#

sqlite_file_name = "./vmp.db"
sql_url = f"sqlite:///{sqlite_file_name}"
connect_args = {"check_same_thread": False}
engine = create_engine(sql_url, connect_args=connect_args)

#
# helping functions to create databases and session dependency
#

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]

#
# API
#

app = FastAPI()

#
# When app starts, create tables
#

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

#
# Home
#

@app.get("/")
async def root():
    return {"message": "Wellcome to Volunteer Match-Up"}

#
# Get users endpoint
#

@app.get("/users/")
async def read_users(
    session: SessionDep,
    offset: int=0,
    limit: Annotated[int, Query(le=100)] = 100
) -> list[Users]:
    users = session.exec( select(Users).offset(offset).limit(limit)).all()
    return users

#
# Get organizations endpoint
# 

@app.get("/orgs/")
async def read_orgs(
    session: SessionDep,
    offset: int=0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[Organizations]:
    orgs = session.exec( select(Organizations).offset(offset).limit(limit)).all()
    return orgs

#
# Get projects endpoint
#

@app.get("/projects/")
async def read_projects(
    session: SessionDep,
    offset: int=0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[Projects]:
    projects = session.exec( select(Projects).offset(offset).limit(limit)).all()
    return projects 

#
# Get Roles endpoint
#

@app.get("/roles/")
async def read_roles(
    session: SessionDep,
    offset: int=0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[Roles]:
    roles = session.exec( select(Roles).offset(offset).limit(limit)).all()
    return roles

#
# Get the length of each Table
#

@app.get("/info/")
async def get_info():
    with Session(engine) as session:
        users = session.exec( select(Users)).all()
        orgs =  session.exec( select(Organizations)).all()
        projects = session.exec( select(Projects)).all()
        roles = session.exec( select(Roles)).all()
    return { "message": f"There are {len(users)} users, {len(roles)} roles, {len(orgs)} organization available and {len(projects)} projects waiting for help"}

#
# GET user by id
#

@app.get("/users/{id}", response_model=Users)
async def get_user_by_id(id: int):
    with Session(engine) as session:
        user = session.get(Users, id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

#
# CREATE a new user
#

@app.post("/users/", response_model=Users)
async def create_user(user: Users):
    with Session(engine) as session:
        db_user = Users.model_validate(user)
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user

#
# DELETE user by id
#

@app.delete("/users/{user_id}")
async def delete_user(user_id: int):
    with Session(engine) as session:
        user = session.get(Users, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        session.delete(user)
        session.commit()
        return {"ok": True}

#
# UPDATE users by id
#

@app.patch("/users/{user_id}", response_model=Users)
async def update_user(user_id : int, user: UsersUpdate):
    with Session(engine) as session:
        db_user = session.get(Users, user_id)
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        user_data = user.model_dump(exclude_unset=True)
        db_user.sqlmodel_update(user_data)
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user
    
@app.get("/.well-known/appspecific/com.chrome.devtools.json")
def chrome_devtools_discovery():
    return Response(content="{}", media_type="application/json")