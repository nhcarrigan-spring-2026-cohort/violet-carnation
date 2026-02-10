from contextlib import asynccontextmanager
from fastapi import FastAPI

from db import init_db
from routes.users import router as users_router
from routes.organization import router as organization_router
from routes.events import router as events_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager to initialize the database when the app starts.

    This appears to be blocking, unsure if init_db should be async, as it should be blocking
    otherwise without a DB connection the server is useless.
    """
    init_db()
    yield

app = FastAPI(lifespan=lifespan)


# Helper/demo endpoints below
@app.get("/api")
async def root():
    return {"message": "Hello World"}


@app.get("/api/check")
async def check():
    return {"content:": "I work, from Next.js too... how cool?"}


# include nested routers here 
app.include_router(users_router, prefix="/api")
app.include_router(organization_router, prefix="/api")
app.include_router(events_router, prefix='/api')

