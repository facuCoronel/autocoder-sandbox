"""Tests for CORS configuration.

The tests verify that:

* The default origins are used when ``CORS_ALLOWED_ORIGINS`` is not set.
* The environment variable can override the defaults, spaces are stripped and empty
  entries are ignored.
* Requests from an origin not in the allowed list do not receive the
  ``access-control-allow-origin`` header.
"""

import os
import importlib
from fastapi.testclient import TestClient

# Helper to perform a preflight OPTIONS request.
def preflight(client: TestClient, origin: str) -> dict:
    return client.options(
        "/auth/login",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
        },
    )


def test_default_origins():
    # Ensure the env var is unset.
    os.environ.pop("CORS_ALLOWED_ORIGINS", None)
    # Reload the app to pick up the configuration.
    import app.main as main_module
    importlib.reload(main_module)
    client = TestClient(main_module.app)

    # Test each default origin.
    for origin in ["http://localhost:5173", "http://127.0.0.1:5173"]:
        resp = preflight(client, origin)
        assert resp.status_code == 200
        assert resp.headers.get("access-control-allow-origin") == origin

    # Origin not allowed should not receive the header.
    resp = preflight(client, "http://not-allowed.com")
    assert "access-control-allow-origin" not in resp.headers


def test_env_override_and_cleanup():
    # Set env var with spaces and an empty entry.
    os.environ["CORS_ALLOWED_ORIGINS"] = "http://example.com ,   http://foo.com,"
    import app.main as main_module
    importlib.reload(main_module)
    client = TestClient(main_module.app)

    # Allowed origins from env.
    for origin in ["http://example.com", "http://foo.com"]:
        resp = preflight(client, origin)
        assert resp.status_code == 200
        assert resp.headers.get("access-control-allow-origin") == origin

    # Not allowed origin.
    resp = preflight(client, "http://localhost:5173")
    assert "access-control-allow-origin" not in resp.headers

    # Clean up env var for other tests.
    os.environ.pop("CORS_ALLOWED_ORIGINS", None)
