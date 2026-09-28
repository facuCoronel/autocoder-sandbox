---
id: TASK-CORS-001
title: Habilitar CORS para el frontend de login
base_branch: main
allowed_paths:
  - backend/app/config.py
  - backend/app/main.py
  - backend/tests/test_cors.py
---

# Contexto

El frontend de login se ejecuta en Vite y llama por HTTP a
`http://127.0.0.1:8000/auth/login`. Como el frontend y el backend usan orígenes
distintos durante el desarrollo, el navegador necesita una política CORS explícita y
una respuesta válida a la petición preflight.

# Implementación requerida

- Crear `backend/app/config.py` con una función pequeña que lea
  `CORS_ALLOWED_ORIGINS` y devuelva una lista de orígenes.
- Interpretar `CORS_ALLOWED_ORIGINS` como una lista separada por comas, eliminando
  espacios y entradas vacías.
- Cuando la variable no exista o esté vacía, usar exactamente estos orígenes:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`
- Registrar `CORSMiddleware` en la aplicación FastAPI existente de
  `backend/app/main.py`.
- Permitir el método `POST` y el header `Content-Type` necesarios para
  `POST /auth/login`.
- Configurar `allow_credentials=False` porque el flujo actual no usa cookies ni
  autenticación HTTP del navegador.
- Conservar sin cambios el endpoint raíz, el router de autenticación y su contrato.

# Criterios de aceptación

- Un preflight `OPTIONS /auth/login` con origen `http://localhost:5173`, método
  solicitado `POST` y header solicitado `Content-Type` es aceptado y devuelve
  `access-control-allow-origin: http://localhost:5173`.
- El mismo preflight funciona para `http://127.0.0.1:5173`.
- Un origen no incluido en la configuración no recibe el header
  `access-control-allow-origin`.
- Una prueba unitaria demuestra que `CORS_ALLOWED_ORIGINS` puede reemplazar los
  valores por defecto y que se eliminan espacios y entradas vacías.
- Las pruebas cubren la política por defecto, la configuración por entorno y el
  rechazo de un origen no permitido.
- Todos los comandos `lint`, `test` y `build` declarados en `.autocoder.yaml`
  finalizan correctamente.

# Restricciones de seguridad

- No usar `*` para orígenes, métodos o headers.
- No reflejar automáticamente el valor recibido en el header `Origin`.
- No habilitar credenciales CORS.
- No agregar secretos, credenciales, tokens ni URLs privadas a la configuración.
- No modificar la lógica de login ni archivos fuera de `allowed_paths`.
