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
 * @param {{ page?: number; limit?: number; q?: string }} [params]
 */
export async function listAdminCustomers(params) {
  const { data } = await api.get("/api/admin/customers", { params });
  return data;
}

/**
 * @param {string} customerId
 */
export async function getAdminCustomer(customerId) {
  const { data } = await api.get(`/api/admin/customers/${encodeURIComponent(customerId)}`);
  return data;
}
