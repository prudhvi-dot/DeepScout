from app.routers import researches, users
from fastapi import FastAPI

# from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# origins = [
#     "https://docu-sense-2-0-wowt.vercel.app/",
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(researches.router, prefix="/api/researches", tags=["researches"])
