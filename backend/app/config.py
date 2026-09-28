"""Configuration utilities for the FastAPI application.

Provides a small helper to obtain the list of allowed CORS origins from the
environment variable ``CORS_ALLOWED_ORIGINS``. The variable is interpreted as a
comma‑separated list; surrounding whitespace is stripped and empty entries are
ignored. If the variable is missing or resolves to an empty list, a sensible
default suitable for local development is returned.
"""

import os

DEFAULT_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]


def get_allowed_origins() -> list[str]:
    """Return the list of origins permitted for CORS.

    The environment variable ``CORS_ALLOWED_ORIGINS`` may contain a comma‑separated
    list of origins. Whitespace around each entry is removed and empty entries are
    discarded. If the resulting list is empty, ``DEFAULT_ORIGINS`` is returned.
    """
    raw = os.getenv("CORS_ALLOWED_ORIGINS", "")
    # Split on commas, strip whitespace, filter out empty strings.
    origins = [origin.strip() for origin in raw.split(",") if origin.strip()]
    if not origins:
        origins = DEFAULT_ORIGINS.copy()
    return origins
