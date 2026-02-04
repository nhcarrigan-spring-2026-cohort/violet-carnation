# instruccion to connect fastapi to sqlite in https://fastapi.tiangolo.com/tutorial/sql-databases/#install-sqlmodel
from typing import Annotated
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, Query
from sqlmodel import Field, Session, SQLModel, create_engine, select

#
# creating the Users Model
#

class Users(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    roleId: int | None = Field(default=None, index=True)
    name: str = Field(index=True)
    location: str = Field(index=True)
    education: str = Field(index=True)

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
# Auxiliar functions
#

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

#
# Session setup
#

SessionDep = Annotated[Session, Depends(get_session)]

#
# API routes
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
    return {"message": "Hello World"}

#
# Get users endpoint
#

@app.get("/users/")
def read_users(
    session: SessionDep,
    offset: int=0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[Users]:
    users = session.exec( select(Users).offset(offset).limit(limit)).all()
    return users

#
# Get organizations endpoint
# 

@app.get("/orgs/")
def read_orgs(
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
def read_projects(
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
def read_endpoints(
    session: SessionDep,
    offset: int=0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[Roles]:
    roles = session.exec( select(Roles).offset(offset).limit(limit)).all()
    return roles 