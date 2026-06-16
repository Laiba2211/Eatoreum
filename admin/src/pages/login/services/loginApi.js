import axios from "axios";

/**
 * Base URL for API calls. In dev, Vite proxies `/api` → server (see vite.config.js).
 * Override with `VITE_API_BASE_URL` if the admin app is served from another origin.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export const ADMIN_TOKEN_KEY = "eatoreum_admin_token";
export const ADMIN_USER_KEY = "eatoreum_admin_user";

/**
 * POST /api/admin/auth/login
 * @param {{ email: string; password: string }} credentials
 * @returns {Promise<{ token: string; admin: object }>}
 */
export async function loginAdmin(credentials) {
  const { data } = await api.post("/api/admin/auth/login", credentials);
  return data;
}

export function persistAdminSession({ token, admin }) {
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
  if (admin) localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}
