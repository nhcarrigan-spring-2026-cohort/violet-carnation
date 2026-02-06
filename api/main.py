from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/check")
async def check():
    return {"content:": "I work, from Next.js too... how cool?"}

