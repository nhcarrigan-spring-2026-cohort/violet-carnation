from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import users
from .internal import admin


# instance of the app
app = FastAPI()



# origins for cors
origins = [
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    middleware_class= CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=origins,
    allow_headers=origins
)

# Admin router
app.include_router(admin.router)

app.include_router(users.router) # user router


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/check")
async def check():
    return {"content:": "I work, from Next.js too... how cool?"}

