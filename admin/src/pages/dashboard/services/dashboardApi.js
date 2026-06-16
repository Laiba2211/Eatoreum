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

export async function getAdminDashboard() {
  const { data } = await api.get("/api/admin/dashboard");
  return data;
}
