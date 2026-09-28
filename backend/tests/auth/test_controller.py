from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_login_success():
    response = client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "correct-horse"},
    )
    assert response.status_code == 200
    json = response.json()
    assert "access_token" in json
    assert json.get("token_type") == "bearer"


def test_login_invalid_credentials():
    # Wrong password
    response = client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "wrong"},
    )
    assert response.status_code == 401
    # Nonexistent email
    response = client.post(
        "/auth/login",
        json={"email": "nonexistent@example.com", "password": "any"},
    )
    assert response.status_code == 401
