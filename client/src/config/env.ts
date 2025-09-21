export const ENV = {
  API_URL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
  LOGIN_TIMEOUT_MS: Number(import.meta.env.VITE_LOGIN_TIMEOUT_MS ?? 8000),
   COOKIE_NAME: import.meta.env.VITE_COOKIE_NAME ?? "auth",
   POLL_MS: Number(import.meta.env.VITE_POLL_MS ?? 180000),
};