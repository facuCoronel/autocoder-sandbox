"""Authentication controller (FastAPI router).

Provides the ``/auth/login`` endpoint that authenticates a user via the
:class:`~app.auth.service.LoginService`.  The endpoint is deliberately tiny – it
instantiates an in‑memory user repository with a single demo user (as required by
the task) and delegates all logic to the service layer.

The controller returns a ``LoginResponse`` on success and raises a generic
401 ``HTTPException`` on any authentication failure, without exposing whether the
email, password or user status was the problem.
"""

from fastapi import APIRouter, HTTPException, status
from app.auth.models import LoginRequest, LoginResponse, User
from app.auth.repository import InMemoryUserRepository
from app.auth.service import InvalidCredentials, LoginService
import hashlib

router = APIRouter(prefix="/auth")


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest) -> LoginResponse:
    """Login endpoint.

    Uses an in‑memory repository with a single demo user. On success returns a token.
    On any failure raises a generic 401 error.
    """
    # Set up repository with demo user.
    repo = InMemoryUserRepository([_demo_user])
    service = LoginService(repo)
    try:
        return service.login(request)
    except InvalidCredentials:
        # Generic unauthorized response without leaking details.
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")


# Demo user – email ``test@example.com`` with password ``correct-horse``.
# The password is stored as a SHA‑256 hex digest to match the repository expectations.
_demo_user = User(
    email="test@example.com",
    password_hash=""" + """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""