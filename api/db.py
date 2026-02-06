from pathlib import Path
from typing import Annotated
from fastapi import Depends
from sqlmodel import Session, SQLModel, create_engine

DATABSE_PATH = Path(__file__).resolve().parent / "app.db"

#
# Configuration parameters
#

sql_url = f"sqlite:///{DATABSE_PATH}"
connect_args = {"check_same_thread": False}
engine = create_engine(sql_url, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]