import axios from "axios";
import { env } from "./env";
import { authStore } from "./state/authStore";

export const http = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 120_000, // Increased to 120s for local Ollama inference
});

http.interceptors.request.use((config) => {
  const token = authStore.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 responses globally — redirect to login on auth failure
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStore.clear();
      // Only redirect if not already on login/register pages
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

