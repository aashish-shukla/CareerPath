const TOKEN_KEY = "careerpath.token";
const USER_KEY = "careerpath.user";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const authStore = {
  getToken() {
    // Cookie-based auth: token is in httpOnly cookie (not accessible via JS).
    // Fall back to localStorage for backward compat during migration.
    return localStorage.getItem(TOKEN_KEY) ?? "";
  },
  setSession({ token, user }) {
    // Cookie is set automatically by the server (httpOnly).
    // We still store token in localStorage for backward compat during migration.
    if (token) localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getUser() {
    return safeParse(localStorage.getItem(USER_KEY) ?? "null");
  },
  isAuthed() {
    // Check localStorage token first (backward compat)
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          this.clear();
          return false;
        }
        return true;
      } catch {
        this.clear();
        return false;
      }
    }
    // No localStorage token — check if user data exists (cookie-only mode)
    const user = this.getUser();
    return !!(user && user.id);
  },
};
