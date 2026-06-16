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
export async function listAdminReviews(params) {
  const { data } = await api.get("/api/admin/reviews", { params });
  return data;
}

/**
 * @param {string} reviewId
 */
export async function deleteAdminReview(reviewId) {
  const { data } = await api.delete(`/api/admin/reviews/${encodeURIComponent(reviewId)}`);
  return data;
}

/**
 * @param {string} reviewId
 * @param {string} replyId
 */
export async function deleteAdminReviewReply(reviewId, replyId) {
  const { data } = await api.delete(
    `/api/admin/reviews/${encodeURIComponent(reviewId)}/replies/${encodeURIComponent(replyId)}`
  );
  return data;
}
