from app.auth.models import User
from app.auth.repository import InMemoryUserRepository


def test_get_by_email_found():
    user = User(email="test@example.com", password_hash="hash")
    repo = InMemoryUserRepository([user])
    result = repo.get_by_email("test@example.com")
    assert result is user


def test_get_by_email_case_insensitive():
    user = User(email="User@Example.COM", password_hash="hash")
    repo = InMemoryUserRepository([user])
    # Lookup with different case
    result = repo.get_by_email("user@example.com")
    assert result is user


def test_get_by_email_not_found():
    repo = InMemoryUserRepository([])
    assert repo.get_by_email("nonexistent@example.com") is None
