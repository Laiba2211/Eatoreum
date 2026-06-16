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

/**
 * @param {{ page?: number; limit?: number; status?: string; q?: string }} [params]
 */
export async function listAdminOrders(params) {
  const { data } = await api.get("/api/admin/orders", { params });
  return data;
}

/**
 * @param {string} orderId
 */
export async function getAdminOrder(orderId) {
  const { data } = await api.get(`/api/admin/orders/${encodeURIComponent(orderId)}`);
  return data;
}
