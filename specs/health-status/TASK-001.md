---
id: TASK-001
title: Show backend health status in the web application
base_branch: main
allowed_paths:
  - backend/**
  - frontend/**
---

Add `GET /api/health`, returning HTTP 200 and the exact JSON object `{"status": "ok"}`.
The React application must request that endpoint on startup and render an accessible status
message for loading, online, and failure states.

Acceptance criteria:

- Backend coverage proves the response status and exact payload.
- Frontend coverage proves loading, online, and failure behavior.
- Existing behavior remains intact.
- Every configured lint, test, and build command passes.

