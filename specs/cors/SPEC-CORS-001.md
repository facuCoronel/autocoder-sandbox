---
id: SPEC-CORS-001
title: Habilitar CORS para el frontend de login
base_branch: main
allowed_paths:
  - backend/app/config.py
  - backend/app/main.py
  - backend/tests/test_config.py
  - backend/tests/test_cors.py
tasks:
  - id: TASK-CORS-001
    title: Crear la configuración de orígenes CORS
    depends_on: []
    allowed_paths:
      - backend/app/config.py
      - backend/tests/test_config.py
    create:
      - backend/app/config.py
      - backend/tests/test_config.py
    modify: []
    acceptance:
      - get_cors_allowed_origins devuelve una list[str]
      - La variable CORS_ALLOWED_ORIGINS se lee en cada llamada mediante os.getenv
      - Los valores separados por comas se recortan y las entradas vacías se descartan
      - Si la variable no existe o sólo contiene espacios y comas se usan exactamente los dos orígenes locales por defecto
      - Las pruebas usan monkeypatch para cubrir valor personalizado, variable ausente y valor vacío
    instructions: >-
      Crear backend/app/config.py sin dependencias externas. Definir una constante inmutable con
      los orígenes por defecto http://localhost:5173 y http://127.0.0.1:5173, y una función
      get_cors_allowed_origins() -> list[str]. La función debe consultar os.getenv en el momento
      de cada llamada, separar por comas, aplicar strip, descartar entradas vacías y retornar una
      lista nueva. Si después de normalizar no queda ningún origen, debe retornar los valores por
      defecto. Crear backend/tests/test_config.py e importar desde app.config; no usar el prefijo
      backend en imports porque los comandos se ejecutan con cwd backend.

  - id: TASK-CORS-002
    title: Registrar CORSMiddleware y probar el preflight de login
    depends_on:
      - TASK-CORS-001
    allowed_paths:
      - backend/app/main.py
      - backend/tests/test_cors.py
    create:
      - backend/tests/test_cors.py
    modify:
      - backend/app/main.py
    acceptance:
      - La aplicación FastAPI registra CORSMiddleware usando get_cors_allowed_origins
      - allow_methods contiene solamente POST y allow_headers contiene solamente Content-Type
      - allow_credentials es False y no se usa ningún comodín
      - El preflight de localhost:5173 para POST /auth/login responde 200 e incluye el mismo access-control-allow-origin
      - El preflight de 127.0.0.1:5173 para POST /auth/login responde 200 e incluye el mismo access-control-allow-origin
      - Un origen no permitido no recibe el header access-control-allow-origin
      - El endpoint raíz y el router de autenticación conservan su comportamiento
    instructions: >-
      Modificar backend/app/main.py para importar CORSMiddleware desde
      fastapi.middleware.cors y get_cors_allowed_origins desde app.config. Registrar el
      middleware en la app existente con allow_origins=get_cors_allowed_origins(),
      allow_credentials=False, allow_methods=["POST"] y allow_headers=["Content-Type"]. No
      cambiar el endpoint raíz ni la configuración del auth_router. Crear
      backend/tests/test_cors.py con TestClient e imports desde app.main. Para cada preflight
      enviar Origin, Access-Control-Request-Method: POST y Access-Control-Request-Headers:
      Content-Type. Verificar explícitamente status 200 para los orígenes permitidos y ausencia
      de access-control-allow-origin para un origen no permitido; no exigir un status específico
      para el caso denegado.
acceptance:
  - El frontend local puede completar el preflight de POST /auth/login desde localhost:5173 y 127.0.0.1:5173
  - Los orígenes no configurados no reciben autorización CORS
  - La configuración puede reemplazarse mediante CORS_ALLOWED_ORIGINS sin reiniciar el módulo
  - No se habilitan credenciales ni comodines CORS
  - Todos los comandos lint, test y build declarados en .autocoder.yaml terminan correctamente
---

# Contexto

El frontend de login se ejecuta con Vite y llama por HTTP a
`http://127.0.0.1:8000/auth/login`. El navegador considera distintos los orígenes del
frontend y del backend, por lo que el backend necesita una política CORS explícita y una
respuesta válida a la petición preflight.

La implementación se divide en dos tareas pequeñas y secuenciales. La primera crea y prueba
la lectura de configuración. La segunda consume esa configuración al registrar el middleware
y prueba el comportamiento HTTP real.

# Restricciones de seguridad

- No usar `*` para orígenes, métodos o headers.
- No reflejar automáticamente el valor recibido en el header `Origin`.
- No habilitar credenciales CORS.
- No agregar secretos, credenciales, tokens ni URLs privadas.
- No modificar la lógica de login ni archivos fuera de `allowed_paths`.
- Ejecutar únicamente los comandos exactos declarados en `.autocoder.yaml`; para backend son
  `uv run ruff check .` y `uv run pytest`, ambos con directorio de trabajo `backend`.
