from fastapi import FastAPI

from app.auth.controller import router as auth_router

app = FastAPI(title="Auto-Coder sandbox")

app.include_router(auth_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Auto-Coder sandbox"}
