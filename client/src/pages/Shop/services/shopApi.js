import axios from "axios";
import { mediaUrl } from "../../../utils/mediaUrl.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  timeout: 20000,
});

const PLACEHOLDER_IMG =
  "https://picsum.photos/seed/eatoreum-catalog/400/400";

/**
 * Normalize published API product for shop cards / cart.
 * @param {object} api
 */
export function mapStoreProduct(api) {
  const rawImages = Array.isArray(api.images)
    ? api.images.filter(Boolean)
    : [];
  const fallback = [api.mainImage, ...(api.variantImages || [])].filter(Boolean);
  const combined = rawImages.length ? rawImages : fallback;
  const images = combined.length
    ? combined.map((u) => mediaUrl(String(u)))
    : [PLACEHOLDER_IMG];

  const catSlug = String(api.category || "").trim().toLowerCase();
  const label = String(api.categoryLabel || "").trim();

  const price = Number(api.price) || 0;
  const compareAt =
    api.compareAtPrice != null && api.compareAtPrice !== ""
      ? Number(api.compareAtPrice)
      : null;

  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    price,
    currency: api.currency || "PKR",
    compareAtPrice: compareAt != null && Number.isFinite(compareAt) && compareAt > price ? compareAt : null,
    description: api.shortDescription || api.description || "",
    longDescription: String(api.description || "").trim(),
    images,
    categoryId: catSlug,
    categoryLabel: label || catSlug || "General",
    weightGrams:
      api.weightGrams != null && api.weightGrams !== "" && Number.isFinite(Number(api.weightGrams))
        ? Number(api.weightGrams)
        : null,
    featured: Boolean(api.isFeatured),
    createdAt: api.createdAt ? new Date(api.createdAt).getTime() : 0,
    tags:
      Array.isArray(api.tags) && api.tags.length > 0
        ? api.tags
        : label || catSlug
          ? [label || catSlug]
          : ["Shop"],
    rating: 4.6,
    reviewCount: 0,
    reviews: [],
  };
}

/**
 * @param {{ page?: number; limit?: number; category?: string; q?: string }} [params]
 */
export async function fetchPublishedProducts(params = {}) {
  const { data } = await api.get("/api/products", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 100,
      ...(params.category ? { category: params.category } : {}),
      ...(params.q ? { q: params.q } : {}),
    },
  });
  return data;
}

/** @returns {Promise<{ items: { slug: string; name: string }[] }>} */
export async function fetchStoreCategories() {
  const { data } = await api.get("/api/categories");
  return data;
}

/**
 * @param {string} idOrSlug
 */
export async function fetchPublishedProduct(idOrSlug) {
  const { data } = await api.get(`/api/products/${encodeURIComponent(idOrSlug)}`);
  return data.product;
}

/** Published catalog item marked featured (at most one). */
export async function fetchFeaturedPublishedProduct() {
  const { data } = await api.get("/api/products", {
    params: { featured: "true", limit: 1, page: 1 },
  });
  const raw = Array.isArray(data.items) ? data.items[0] : null;
  return raw ? mapStoreProduct(raw) : null;
}

/**
 * @param {string} productSlug
 * @param {{ limit?: number }} [params]
 */
export async function fetchProductReviews(productSlug, params = {}) {
  const { data } = await api.get(`/api/products/${encodeURIComponent(productSlug)}/reviews`, {
    params: { limit: params.limit ?? 50 },
  });
  return data;
}

/**
 * @param {string} productSlug
 * @param {{ authorName: string; rating: number; body: string }} payload
 */
export async function postProductReview(productSlug, payload) {
  const { data } = await api.post(`/api/products/${encodeURIComponent(productSlug)}/reviews`, payload);
  return data;
}

/**
 * @param {string} productSlug
 * @param {string} reviewId
 * @param {{ authorName: string; body: string }} payload
 */
export async function postProductReviewReply(productSlug, reviewId, payload) {
  const { data } = await api.post(
    `/api/products/${encodeURIComponent(productSlug)}/reviews/${encodeURIComponent(reviewId)}/replies`,
    payload
  );
  return data;
}
