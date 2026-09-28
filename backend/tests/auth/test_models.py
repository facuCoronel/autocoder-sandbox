import pytest
from pydantic import ValidationError
from app.auth.models import LoginRequest, LoginResponse, User


def test_login_request_valid():
    req = LoginRequest(email="test@example.com", password="secret")
    assert req.email == "test@example.com"
    assert req.password == "secret"


def test_login_request_invalid_email():
    with pytest.raises(ValidationError):
        LoginRequest(email="not-an-email", password="secret")


def test_login_request_empty_password():
    with pytest.raises(ValidationError):
        LoginRequest(email="test@example.com", password="")


def test_login_response_fields():
    resp = LoginResponse(access_token="abc123", token_type="bearer")
    assert resp.access_token == "abc123"
    assert resp.token_type == "bearer"