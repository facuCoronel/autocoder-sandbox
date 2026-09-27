from fastapi import FastAPI

app = FastAPI(title="Auto-Coder sandbox")


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Auto-Coder sandbox"}


@app.get("/api/health")
def health() -> dict[str, str]:
    """Health check endpoint returning simple status."""
    return {"status": "ok"}

