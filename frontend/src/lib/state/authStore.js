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
    return localStorage.getItem(TOKEN_KEY) ?? "";
  },
  setSession({ token, user }) {
    localStorage.setItem(TOKEN_KEY, token);
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
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Check if token has expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        this.clear(); // Clean up expired session
        return false;
      }
      return true;
    } catch {
      // Malformed token — treat as unauthenticated
      this.clear();
      return false;
    }
  },
};

