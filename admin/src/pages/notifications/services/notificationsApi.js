import axios from "axios";
import { getAdminToken } from "../../login/services/loginApi.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getUnreadNotificationCount() {
  const { data } = await api.get("/api/admin/notifications/unread-count");
  return data;
}

/**
 * @param {{ page?: number; limit?: number }} [params]
 */
export async function listAdminNotifications(params) {
  const { data } = await api.get("/api/admin/notifications", { params });
  return data;
}

export async function markNotificationRead(id) {
  const { data } = await api.patch(`/api/admin/notifications/${encodeURIComponent(id)}/read`);
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await api.post("/api/admin/notifications/read-all");
  return data;
}
