import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

/**
 * @param {{ name: string; email: string; message: string; subject?: string }} body
 */
export async function submitContactForm(body) {
  const { data } = await api.post("/api/contact", body);
  return data;
}
