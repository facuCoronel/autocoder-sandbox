---
id: SPEC-LOGIN-FRONTEND-001
title: Implementar login frontend conectado al backend
base_branch: main
allowed_paths:
  - frontend/src/auth/**
  - frontend/src/App.tsx
  - frontend/src/main.tsx
  - frontend/src/main.test.tsx
  - frontend/src/style.css
tasks:
  - id: TASK-LOGIN-FE-001
    title: Crear el cliente HTTP de autenticación
    depends_on: []
    allowed_paths:
      - frontend/src/auth/types.ts
      - frontend/src/auth/api.ts
      - frontend/src/auth/api.test.ts
    create:
      - frontend/src/auth/types.ts
      - frontend/src/auth/api.ts
      - frontend/src/auth/api.test.ts
    modify: []
    acceptance:
      - login envía una petición HTTP POST real a /auth/login mediante fetch
      - La URL completa usa VITE_API_BASE_URL y por defecto apunta a http://127.0.0.1:8000
      - La petición usa Content-Type application/json y body con email y password
      - Una respuesta 200 devuelve access_token y token_type bearer tipados
      - Una respuesta no exitosa produce un error genérico sin exponer detalles de credenciales
      - Las pruebas verifican URL, método, headers y body exactos de la llamada HTTP
    instructions: >-
      Crear tipos LoginCredentials y LoginResponse y una función login(credentials). Usar el
      fetch global del navegador: no crear respuestas simuladas, tokens locales ni lógica que
      finja autenticación. Resolver la base URL desde import.meta.env.VITE_API_BASE_URL, quitar
      barras finales y usar http://127.0.0.1:8000 cuando no esté configurada. Ejecutar exactamente
      POST {baseUrl}/auth/login con JSON. Los mocks de fetch están permitidos únicamente en tests.
      No guardar ni registrar email, password o access_token.

  - id: TASK-LOGIN-FE-002
    title: Crear el formulario de login y sus estados
    depends_on:
      - TASK-LOGIN-FE-001
    allowed_paths:
      - frontend/src/auth/LoginForm.tsx
      - frontend/src/auth/LoginForm.test.tsx
    create:
      - frontend/src/auth/LoginForm.tsx
      - frontend/src/auth/LoginForm.test.tsx
    modify: []
    acceptance:
      - El formulario contiene campos accesibles de email y password
      - Submit invoca el cliente HTTP login con los valores escritos por el usuario
      - Mientras espera deshabilita el submit y muestra un estado de carga
      - Un 401 o error de red muestra un mensaje genérico y permite reintentar
      - Un 200 llama a onLoginSuccess sin mostrar ni persistir el token
      - Las pruebas demuestran que submit llama al cliente y cubren éxito y error
    instructions: >-
      Crear un componente LoginForm controlado que importe y use login desde ./api. Validar campos
      vacíos antes de enviar, pero no duplicar autenticación en el navegador. La única fuente de
      éxito debe ser la respuesta HTTP del backend. No usar localStorage, sessionStorage, cookies
      inventadas ni tokens hardcodeados. Usar labels, aria-live para mensajes y texto claro en
      español. Mockear el módulo api sólo en las pruebas del componente.

  - id: TASK-LOGIN-FE-003
    title: Integrar el formulario en la aplicación
    depends_on:
      - TASK-LOGIN-FE-002
    allowed_paths:
      - frontend/src/App.tsx
      - frontend/src/main.tsx
      - frontend/src/style.css
    create:
      - frontend/src/App.tsx
    modify:
      - frontend/src/main.tsx
      - frontend/src/style.css
    acceptance:
      - App renderiza LoginForm como pantalla principal
      - El estado autenticado sólo aparece después de una respuesta HTTP 200 del backend
      - La aplicación no contiene credenciales, respuestas ni tokens hardcodeados
      - El token no se imprime en pantalla ni se guarda en almacenamiento del navegador
      - La pantalla es usable en viewport móvil y escritorio
    instructions: >-
      Extraer App desde main.tsx hacia App.tsx, renderizar LoginForm y mostrar una confirmación de
      sesión iniciada cuando onLoginSuccess se ejecute. Mantener main.tsx limitado al bootstrap de
      React. Crear estilos sobrios y responsivos para el formulario, sus estados y errores. No
      reemplazar la llamada HTTP con cambios de estado locales ni con una demora artificial.

  - id: TASK-LOGIN-FE-004
    title: Probar la integración completa formulario a backend HTTP
    depends_on:
      - TASK-LOGIN-FE-003
    allowed_paths:
      - frontend/src/auth/**
      - frontend/src/App.tsx
      - frontend/src/main.tsx
      - frontend/src/main.test.tsx
      - frontend/src/style.css
    create: []
    modify:
      - frontend/src/main.test.tsx
      - frontend/src/auth/api.ts
      - frontend/src/auth/api.test.ts
      - frontend/src/auth/LoginForm.tsx
      - frontend/src/auth/LoginForm.test.tsx
      - frontend/src/App.tsx
    acceptance:
      - Una prueba de integración completa email y password y confirma POST http://127.0.0.1:8000/auth/login
      - La prueba comprueba que el body enviado es exactamente el contrato esperado por FastAPI
      - Una respuesta HTTP 200 cambia la UI al estado autenticado
      - Una respuesta HTTP 401 mantiene el formulario y muestra un error genérico
      - La prueba falla si el formulario no ejecuta fetch o si apunta a otra URL
      - npm run lint, npm test -- --run y npm run build finalizan correctamente
    instructions: >-
      Reemplazar el test baseline de main.test.tsx por pruebas de integración de App usando Testing
      Library. Stubear globalThis.fetch para observar la frontera HTTP, no para evitarla: enviar el
      formulario debe producir una llamada fetch real al contrato /auth/login. Verificar URL,
      método POST, Content-Type y JSON exactos, y cubrir respuestas 200 y 401. Corregir cualquier
      archivo permitido si los tests revelan un problema de integración.
acceptance:
  - El formulario no puede autenticarse sin ejecutar POST /auth/login por HTTP
  - Por defecto la petición apunta a http://127.0.0.1:8000/auth/login
  - VITE_API_BASE_URL permite cambiar el origen del backend sin modificar código
  - El JSON enviado coincide con LoginRequest del backend y la UI consume LoginResponse
  - Éxito, credenciales inválidas y error de red están cubiertos por pruebas
  - No se persisten ni se muestran passwords o access tokens
  - Todos los comandos lint, test y build declarados en .autocoder.yaml terminan correctamente
---

# Contexto

El backend de `SPEC-LOGIN-001` ya define `POST /auth/login`, recibe `email` y `password`, y devuelve
`access_token` más `token_type`. Esta spec debe ejecutarse después de integrar ese backend. El
frontend anterior era sólo una pantalla estática y no realizaba ninguna petición: esta spec existe
para cerrar explícitamente esa integración.

# Restricciones

- La autenticación depende exclusivamente de la respuesta HTTP del backend.
- No simular autenticación en código de producción; los mocks pertenecen sólo a tests.
- No crear otro endpoint ni cambiar el contrato `POST /auth/login`.
- No guardar tokens o credenciales en localStorage, sessionStorage ni logs.
- No modificar dependencias, backend, configuración de Vite ni archivos fuera de `allowed_paths`.
