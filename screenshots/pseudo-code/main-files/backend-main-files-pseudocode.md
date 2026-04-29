# Backend Main Files Pseudocode (Detailed)

## File: backend/src/app.js

### Function: createApp()

1. Import all required framework and middleware dependencies:
   - Express core
   - Security headers middleware (helmet)
   - CORS middleware
   - Request logger (morgan)
   - Rate limiter
   - Environment config
   - Route modules
   - Error and not-found middleware
2. Create a new Express application instance.
3. Configure proxy trust:
   - Set `trust proxy = 1` so Express correctly resolves client IP when behind one proxy/load balancer.
4. Register security middleware:
   - Apply `helmet()` before routes to add standard HTTP security headers.
5. Register CORS policy:
   - Allow origin from `env.FRONTEND_ORIGIN`.
   - Allow credentials for authenticated browser requests.
6. Register body parsers:
   - JSON parser with payload limit `2mb`.
   - URL-encoded parser with `extended = true` for nested fields.
7. Register request logger:
   - If environment is production, use `combined` format.
   - Otherwise use `dev` format for local readability.
8. Register global rate limiter:
   - Window duration = 60 seconds.
   - Maximum requests per IP in window = 180.
   - Emit modern standard rate-limit headers.
   - Disable legacy headers.
9. Register health-check endpoint:
   - Route: `GET /health`.
   - Return `{ ok: true }` to confirm service is alive.
10. Mount feature route modules in API namespace:
   - `/api/auth` -> authentication endpoints.
   - `/api/profile` -> user profile endpoints.
   - `/api/skills` -> skill-related endpoints.
   - `/api/careers` -> career catalog and analysis endpoints.
   - `/api/recommendations` -> recommendation endpoints.
   - `/api/market-insights` -> market trends endpoints.
   - `/api/resources` -> learning resources endpoints.
   - `/api/chat` -> chat assistant endpoints.
   - `/api/jobs` -> jobs endpoints.
   - `/api/peer-stats` -> peer benchmarking endpoints.
11. Register not-found middleware after all routes:
   - Any unmatched URL is converted into a consistent 404 response.
12. Register global error middleware as final handler:
   - Capture thrown errors/rejected promises.
   - Format and return standardized error responses.
13. Return fully configured Express application object.

## File: backend/src/server.js

### Function: main() (async bootstrap)

1. Import runtime dependencies:
   - Node HTTP server factory
   - `createApp` app factory
   - Environment config
   - Database connection helper
   - Development seeding helper
   - Logger utility
2. Begin bootstrap sequence in `main()`.
3. Connect to MongoDB/database before opening HTTP port:
   - Ensures API does not accept requests while DB is unavailable.
4. Execute development seed setup conditionally:
   - If `NODE_ENV` is not `production`, run `ensureDevDemoUser()`.
   - Skip this step in production for data safety.
5. Build Express app by calling `createApp()`.
6. Create Node HTTP server from app instance.
7. Configure server-level timeout:
   - Set timeout to `300000 ms` (5 minutes).
   - Supports slower local AI/model inference paths.
8. Start listening on configured `env.PORT`.
9. On successful start, log server URL (`http://localhost:<PORT>`).
10. Wrap bootstrap with top-level error handling:
   - Catch any startup error (DB failure, seed failure, bind failure).
   - Print error for debugging.
   - Exit process with non-zero status (`1`).
