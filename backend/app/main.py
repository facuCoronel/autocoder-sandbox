from fastapi import FastAPI

app = FastAPI(title="Auto-Coder sandbox")


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Auto-Coder sandbox"}
