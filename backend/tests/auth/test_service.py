import hashlib
import pytest

from app.auth.models import LoginRequest, User
from app.auth.repository import InMemoryUserRepository
from app.auth.service import InvalidCredentials, LoginService, TokenIssuer


class DummyTokenIssuer:
    """Simple token issuer returning a constant token for testing."""

    def issue(self, user: User) -> str:
        return "dummy-token"


def make_user(email: str, password: str, is_active: bool = True) -> User:
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    return User(email=email, password_hash=password_hash, is_active=is_active)


@pytest.fixture
def repo():
    # Create a repository with a single active user.
    user = make_user("test@example.com", "correct-horse")
    return InMemoryUserRepository([user])


def test_login_success(repo):
    service = LoginService(repo, token_issuer=DummyTokenIssuer())
    request = LoginRequest(email="test@example.com", password="correct-horse")
    response = service.login(request)
    assert response.access_token == "dummy-token"
    assert response.token_type == "bearer"


def test_login_invalid_email(repo):
    service = LoginService(repo, token_issuer=DummyTokenIssuer())
    request = LoginRequest(email="nonexistent@example.com", password="any")
    with pytest.raises(InvalidCredentials):
        service.login(request)


def test_login_inactive_user():
    inactive_user = make_user("inactive@example.com", "secret", is_active=False)
    repo = InMemoryUserRepository([inactive_user])
    service = LoginService(repo, token_issuer=DummyTokenIssuer())
    request = LoginRequest(email="inactive@example.com", password="secret")
    with pytest.raises(InvalidCredentials):
        service.login(request)


def test_login_wrong_password(repo):
    service = LoginService(repo, token_issuer=DummyTokenIssuer())
    request = LoginRequest(email="test@example.com", password="wrong")
    with pytest.raises(InvalidCredentials):
        service.login(request)
