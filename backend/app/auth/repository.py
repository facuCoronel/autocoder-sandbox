from __future__ import annotations

from collections.abc import Iterable
from typing import Protocol

from app.auth.models import User


class UserRepository(Protocol):
    """Repository protocol for retrieving users.

    Only the operation required for the login flow is defined.
    """

    def get_by_email(self, email: str) -> User | None:
        """Return a :class:`User` matching *email* case‑insensitively.

        If no user exists, ``None`` is returned.
        """


class InMemoryUserRepository:
    """In‑memory implementation of :class:`UserRepository`.

    The repository is initialized with an iterable of :class:`User` instances.  Emails are
    normalized to lower‑case for case‑insensitive look‑ups.  The class does not depend on any
    FastAPI components.
    """

    def __init__(self, users: Iterable[User] | None = None) -> None:
        self._users: dict[str, User] = {}
        if users:
            for user in users:
                # Ensure the stored key is lower‑case regardless of the user's email case.
                self._users[user.email.lower()] = user

    def get_by_email(self, email: str) -> User | None:
        """Retrieve a user by e‑mail address.

        The lookup is case‑insensitive; the provided *email* is normalised to lower‑case before
        searching the internal dictionary.
        """
        return self._users.get(email.lower())
