from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.routers.user_api import router as users_router
from server.routers.user_status_api import router as users_statuses_router
from server.routers.auth import router as auth_router



app = FastAPI(title="Team Availabilty")

origins = [
    "http://localhost:5173",  # Vite
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,           # important for cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(users_statuses_router)
