# Frontend Main Files Pseudocode (Detailed)

## File: frontend/src/main.jsx

### Application Entry Flow

1. Import React runtime and ReactDOM client renderer.
2. Import router provider (`BrowserRouter`) for SPA navigation.
3. Import root component `App` and global stylesheet.
4. Find root mount element with `document.getElementById("root")`.
5. Create React root via `ReactDOM.createRoot(...)`.
6. Render component tree in this order:
   - `React.StrictMode` for development checks and warnings.
   - `BrowserRouter` to enable client-side route matching and navigation.
   - `App` as top-level route container.

## File: frontend/src/App.jsx

### Helper Component: RequireAuth({ children })

1. Read current location path using `useLocation()`.
2. Ask auth store whether user is authenticated (`authStore.isAuthed()`).
3. If unauthenticated:
   - Redirect to `/login` with `replace = true`.
   - Pass current path in router state (`from`) so app can return post-login.
4. If authenticated:
   - Render wrapped child component.

### Root Component: App()

1. On first render (`useEffect` with empty dependency):
   - Read persisted theme value from localStorage.
   - Default to `light` when no value exists.
2. If theme is `dark`:
   - Set `data-theme="dark"` on `document.documentElement`.
   - Add `dark` class on `html` element for CSS variant activation.
3. If theme is not `dark`:
   - Remove `data-theme` attribute.
   - Remove `dark` class to ensure light mode styles.
4. Return React Router route map (`<Routes>`):
   - Public routes:
     - `/` -> landing page.
     - `/login` -> login page.
     - `/register` -> registration page.
   - Protected routes using `RequireAuth` wrapper:
     - `/profile/wizard`
     - `/app/dashboard`
     - `/app/recommendations`
     - `/app/skill-gap`
     - `/app/resources`
     - `/app/profile`
     - `/app/chat`
     - `/app/ats-checker`
     - `/app/jobs`
5. Add redirect rule:
   - `/app` -> `/app/dashboard`.
6. Add wildcard fallback:
   - Any unknown route -> `/`.
