import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import init_db
from routes.auth import router as auth_router
from routes.event_registrations import router as event_registrations_router
from routes.events import router as events_router
from routes.organization import router as organization_router
from routes.users import router as users_router


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

_raw_origins = os.environ.get("ALLOWED_ORIGINS", "")
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

if _allowed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )

# Helper/demo endpoints below
@app.get("/api")
async def root():
    return {"message": "Hello World"}


@app.get("/api/check")
async def check():
    return {"content:": "I work, from Next.js too... how cool?"}


# include nested routers here
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(organization_router, prefix="/api")
app.include_router(events_router, prefix="/api")
app.include_router(event_registrations_router, prefix="/api")
