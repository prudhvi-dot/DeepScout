from app.routers import researches, users
from fastapi import FastAPI

app = FastAPI()


app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(researches.router, prefix="/api/researches", tags=["researches"])
