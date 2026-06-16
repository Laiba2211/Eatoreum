import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

/**
 * @param {string} email
 */
export async function subscribeNewsletter(email) {
  const { data } = await api.post("/api/newsletter/subscribe", { email });
  return data;
}
