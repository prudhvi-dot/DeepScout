from app.routers import users, chats
from fastapi import FastAPI

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
app.include_router(chats.router, prefix="/api/chats", tags=["chats"])
