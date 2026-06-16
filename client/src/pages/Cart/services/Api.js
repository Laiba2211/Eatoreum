import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

/**
 * POST /api/cart/validate
 * @param {Array<{ productId: string; quantity: number }>} items
 * @returns {Promise<{ items: object[]; subtotal: number; currency: string }>}
 */
export async function validateCart(items) {
  const { data } = await api.post("/api/cart/validate", { items });
  return data;
}

/**
 * POST /api/orders — COD checkout
 * @param {{
 *   items: Array<{ productId: string; quantity: number }>;
 *   shipping: object;
 *   paymentMethod: string;
 * }} payload
 * @returns {Promise<{ order: object }>}
 */
export async function createOrder(payload) {
  const { data } = await api.post("/api/orders", payload);
  return data;
}
