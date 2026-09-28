from fastapi import FastAPI

from app.auth.controller import router as auth_router

app = FastAPI(title="Auto-Coder sandbox")

# Register CORS middleware using allowed origins from config.
from app.config import get_allowed_origins
from fastapi.middleware.cors import CORSMiddleware

origins = get_allowed_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
    allow_credentials=False,
)

app.include_router(auth_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Auto-Coder sandbox"}
