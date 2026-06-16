import Category from "../models/Category.js";
import { cacheWrap } from "../utils/redisCache.js";

async function buildCategoriesPayload() {
  const items = await Category.find().sort({ name: 1 }).lean();
  return {
    items: items.map((c) => ({ slug: c.slug, name: c.name })),
  };
}

/** GET /api/categories — storefront filters (optional Redis cache) */
export async function listPublishedCategories(req, res) {
  try {
    const payload = await cacheWrap("categories:list", undefined, buildCategoriesPayload);
    return res.json(payload);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load categories" });
  }
}
