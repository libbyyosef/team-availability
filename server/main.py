from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.routers.user_api import router as users_router
from server.routers.user_status_api import router as users_statuses_router


app = FastAPI(title="Gallery Votes (counters-only)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(users_router)
app.include_router(users_statuses_router)

