import axios from "axios";
import { getAdminToken } from "../../login/services/loginApi.js";

/**
 * Admin catalog API. Sends `Authorization: Bearer` from login session.
 * Dev: Vite proxies `/api` → API server (see vite.config.js).
 */
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

/** No default JSON header — multipart boundary must be set by the browser. */
const uploadApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  timeout: 120000,
});

uploadApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * @param {File} file
 * @returns {Promise<string>} Public URL path e.g. `/uploads/products/…`
 */
export async function uploadProductImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await uploadApi.post("/api/admin/upload/product-image", formData);
  if (!data?.url) throw new Error("Upload response missing url");
  return data.url;
}

/**
 * @param {Record<string, string | number | boolean | undefined>} [params]
 * @returns {Promise<{ items: object[]; page: number; limit: number; total: number; pages: number }>}
 */
export async function listAdminProducts(params) {
  const { data } = await api.get("/api/admin/products", { params });
  return data;
}

/**
 * @param {string} idOrSlug
 * @returns {Promise<{ product: object }>}
 */
export async function getAdminProduct(idOrSlug) {
  const { data } = await api.get(`/api/admin/products/${encodeURIComponent(idOrSlug)}`);
  return data;
}

/**
 * @param {object} payload
 * @returns {Promise<{ product: object }>}
 */
export async function createAdminProduct(payload) {
  const { data } = await api.post("/api/admin/products", payload);
  return data;
}

/**
 * @param {string} idOrSlug
 * @param {object} patch
 * @returns {Promise<{ product: object }>}
 */
export async function updateAdminProduct(idOrSlug, patch) {
  const { data } = await api.patch(
    `/api/admin/products/${encodeURIComponent(idOrSlug)}`,
    patch
  );
  return data;
}

/**
 * @param {string} idOrSlug
 * @returns {Promise<void>}
 */
export async function deleteAdminProduct(idOrSlug) {
  await api.delete(`/api/admin/products/${encodeURIComponent(idOrSlug)}`);
}

/** @returns {Promise<{ items: { id: string; slug: string; name: string }[] }>} */
export async function listAdminCategories() {
  const { data } = await api.get("/api/admin/categories");
  return data;
}

/** @returns {Promise<{ category: { id: string; slug: string; name: string } }>} */
export async function createAdminCategory(body) {
  const { data } = await api.post("/api/admin/categories", body);
  return data;
}
