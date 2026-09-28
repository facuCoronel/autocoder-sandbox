---
id: SPEC-LOGIN-001
title: Implementar login con token opaco
base_branch: main
allowed_paths:
  - backend/app/auth/**
  - backend/app/main.py
  - backend/tests/auth/**
tasks:
  - id: TASK-LOGIN-001
    title: Crear contratos y modelos de autenticación
    depends_on: []
    allowed_paths:
      - backend/app/auth/__init__.py
      - backend/app/auth/models.py
      - backend/tests/auth/test_models.py
    create:
      - backend/app/auth/__init__.py
      - backend/app/auth/models.py
      - backend/tests/auth/test_models.py
    modify: []
    acceptance:
      - LoginRequest valida email no vacío y contraseña no vacía
      - LoginResponse expone access_token y token_type con valor bearer
      - User conserva email, password_hash y estado activo sin exponer la contraseña original
    instructions: >-
      Crear modelos Pydantic pequeños para LoginRequest y LoginResponse, y un modelo de dominio
      User. Mantener los nombres de campos indicados por los criterios. Agregar pruebas unitarias
      para valores válidos e inválidos. No agregar dependencias externas.

  - id: TASK-LOGIN-002
    title: Crear repository de usuarios en memoria
    depends_on:
      - TASK-LOGIN-001
    allowed_paths:
      - backend/app/auth/repository.py
      - backend/tests/auth/test_repository.py
    create:
      - backend/app/auth/repository.py
      - backend/tests/auth/test_repository.py
    modify: []
    acceptance:
      - UserRepository define la operación get_by_email
      - InMemoryUserRepository busca emails sin distinguir mayúsculas de minúsculas
      - Un email inexistente devuelve None
    instructions: >-
      Definir un Protocol UserRepository y una implementación InMemoryUserRepository. La
      implementación recibe usuarios al construirse y no conoce FastAPI. Agregar pruebas de
      usuario encontrado, normalización de email y usuario inexistente.

  - id: TASK-LOGIN-003
    title: Implementar el caso de uso de login
    depends_on:
      - TASK-LOGIN-001
      - TASK-LOGIN-002
    allowed_paths:
      - backend/app/auth/service.py
      - backend/tests/auth/test_service.py
    create:
      - backend/app/auth/service.py
      - backend/tests/auth/test_service.py
    modify: []
    acceptance:
      - Credenciales válidas producen un token opaco no vacío
      - Usuario inexistente, inactivo o contraseña incorrecta producen InvalidCredentials
      - La comparación de credenciales usa hmac.compare_digest
      - El servicio depende de UserRepository y no de FastAPI
    instructions: >-
      Crear LoginService, InvalidCredentials y una abstracción TokenIssuer. Para este fixture,
      comparar el SHA-256 hexadecimal de la contraseña recibida con password_hash mediante
      hmac.compare_digest. Proveer un token issuer inyectable para tests y cubrir todos los casos
      de aceptación. No registrar credenciales ni tokens.

  - id: TASK-LOGIN-004
    title: Exponer POST /auth/login
    depends_on:
      - TASK-LOGIN-003
    allowed_paths:
      - backend/app/auth/controller.py
      - backend/app/main.py
      - backend/tests/auth/test_controller.py
    create:
      - backend/app/auth/controller.py
      - backend/tests/auth/test_controller.py
    modify:
      - backend/app/main.py
    acceptance:
      - POST /auth/login devuelve 200, access_token y token_type bearer con credenciales válidas
      - Credenciales inválidas devuelven 401 con un mensaje genérico
      - La respuesta 401 no revela si falló el email, la contraseña o el estado del usuario
      - El router se registra en la aplicación FastAPI existente
    instructions: >-
      Crear un APIRouter bajo /auth y conectarlo con LoginService mediante una composición simple
      para el sandbox. Incluir un usuario de demostración test@example.com cuya contraseña de test
      sea correct-horse. Usar secrets.token_urlsafe para emitir tokens opacos. Registrar el router
      en app/main.py y agregar tests HTTP para 200 y 401.
acceptance:
  - El flujo completo POST /auth/login devuelve 200 y un token para credenciales válidas
  - Email desconocido, contraseña incorrecta y usuario inactivo devuelven 401
  - Las respuestas nunca contienen password_hash ni la contraseña original
  - Todos los comandos lint, test y build declarados en .autocoder.yaml terminan correctamente
---

# Contexto

El sandbox necesita un flujo de login backend pequeño para validar la ejecución secuencial de una
spec con varias tasks. El objetivo no es construir un sistema de sesiones productivo: el token es
opaco, efímero y se genera únicamente para demostrar la integración completa.

# Restricciones

- Mantener la separación repository → service → controller.
- No modificar dependencias, configuración, frontend ni archivos fuera de `allowed_paths`.
- No persistir usuarios, contraseñas o tokens.
- No escribir credenciales ni tokens en logs.
- No implementar refresh tokens, registro de usuarios ni autorización de endpoints.
