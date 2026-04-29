# ML Service Main File Pseudocode (Detailed)

## File: ml-service/app/main.py

### Function: create_app() -> FastAPI

1. Import `FastAPI`, CORS middleware, and API router object.
2. Instantiate FastAPI application with metadata:
   - Title: `CareerPath ML Service`
   - Version: `1.0.0`
3. Register CORS middleware to control browser cross-origin access:
   - `allow_origins = ["*"]` to allow all origins.
   - `allow_credentials = False` (cookies/auth headers not shared via CORS credentials).
   - `allow_methods = ["*"]` to allow all HTTP methods.
   - `allow_headers = ["*"]` to allow all custom headers.
4. Include shared API router:
   - Attach all endpoints defined in `routes.py` onto this app instance.
5. Define health-check route inside factory:
   - Endpoint: `GET /health`
   - Return payload: `{ "ok": True }`
   - Purpose: liveness check for containers/orchestrators.
6. Return fully configured FastAPI app object.

### Module Initialization

1. Call `create_app()` once at module load time.
2. Assign result to module-level variable `app`.
3. Expose `app` as ASGI entrypoint for server runners (for example, Uvicorn/Gunicorn workers).
