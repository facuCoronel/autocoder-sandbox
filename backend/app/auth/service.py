"""Authentication service layer.

Provides a ``LoginService`` that validates credentials against a ``UserRepository`` and
issues an opaque token via a ``TokenIssuer`` abstraction.

The implementation follows the specification:

* Passwords are compared using ``hmac.compare_digest`` against the stored SHA‑256 hex
  digest.
* ``InvalidCredentials`` is raised for any authentication failure (unknown user,
  inactive user, wrong password).
* No FastAPI components are imported – the service is pure Python and can be used by a
  controller.
"""

from __future__ import annotations

import hashlib
import hmac
from dataclasses import dataclass
from typing import Protocol

from app.auth.models import LoginRequest, LoginResponse, User
from app.auth.repository import UserRepository


class InvalidCredentials(Exception):
    """Raised when authentication fails for any reason.

    The exception carries no details to avoid leaking information about the failure
    cause (unknown email, inactive account, wrong password).
    """

    pass


class TokenIssuer(Protocol):
    """Abstraction for issuing opaque access tokens.

    The concrete implementation can be injected, which makes the service easy to test.
    """

    def issue(self, user: User) -> str:  # pragma: no cover - protocol definition
        ...


@dataclass
class SimpleTokenIssuer:
    """Default token issuer used in production code.

    It generates a URL‑safe random token using :func:`secrets.token_urlsafe`.
    """

    # No state required, but a dataclass makes it easy to instantiate and inject.

    def issue(self, user: User) -> str:  # pragma: no cover - simple deterministic wrapper
        import secrets

        # The token does not encode any user data; it is opaque.
+        return secrets.token_urlsafe()
+
+
+class LoginService:
+    """Service responsible for authenticating a user and returning a token.
+
+    The service is deliberately small and pure: it receives a ``UserRepository`` and a
+    ``TokenIssuer`` (defaulting to :class:`SimpleTokenIssuer`).  The ``login`` method raises
+    :class:`InvalidCredentials` for any failure case.
+    """
+
+    def __init__(self, user_repository: UserRepository, token_issuer: TokenIssuer | None = None) -> None:
+        self._repo = user_repository
+        # Allow injection of a custom token issuer for tests; fall back to the simple one.
+        self._issuer = token_issuer or SimpleTokenIssuer()
+
+    def _hash_password(self, password: str) -> str:
+        """Return the SHA‑256 hex digest of *password*.
+
+        The repository stores the hash in hexadecimal form, matching the output of
+        ``hashlib.sha256(...).hexdigest()``.
+        """
+        return hashlib.sha256(password.encode("utf-8")).hexdigest()
+
+    def login(self, request: LoginRequest) -> LoginResponse:
+        """Validate *request* and return a ``LoginResponse``.
+
+        Steps:
+        1. Retrieve the user by e‑mail (case‑insensitive via the repository).
+        2. Ensure the user exists and is active.
+        3. Compute the SHA‑256 hash of the supplied password and compare it with the stored
+           hash using ``hmac.compare_digest`` to mitigate timing attacks.
+        4. If all checks pass, issue a token and return it.
+        """
+        user = self._repo.get_by_email(request.email)
+        if not user or not user.is_active:
+            raise InvalidCredentials()
+
+        supplied_hash = self._hash_password(request.password)
+        # Use constant‑time comparison as required by the specification.
+        if not hmac.compare_digest(supplied_hash, user.password_hash):
+            raise InvalidCredentials()
+
+        token = self._issuer.issue(user)
+        # The token must be non‑empty; the issuer guarantees this, but we defensively check.
+        if not token:
+            raise InvalidCredentials()
+        return LoginResponse(access_token=token, token_type="bearer")
+
*** End of File ***
