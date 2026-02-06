# instruccion to connect fastapi to sqlite in https://fastapi.tiangolo.com/tutorial/sql-databases/#install-sqlmodel
from typing import Annotated
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, Query
from sqlmodel import Session, select
from db import create_db_and_tables, SessionDep, engine
from routes import users

#
# API
#

from db import init_db
from routes.users import router as users_router

app.include_router(users.router)

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
