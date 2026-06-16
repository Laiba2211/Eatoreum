import Category from "../models/Category.js";
import { escapeRegex } from "../utils/productQueries.js";
import { invalidatePublicCatalogCache } from "../utils/redisCache.js";
import { slugify } from "../utils/slugify.js";

async function ensureUniqueCategorySlug(base) {
  let candidate = slugify(base);
  let n = 0;
  for (;;) {
    const exists = await Category.exists({ slug: candidate });
    if (!exists) return candidate;
    n += 1;
    candidate = `${slugify(base)}-${n}`;
  }
}

/** GET /api/admin/categories */
export async function listAdminCategories(req, res) {
  try {
    const items = await Category.find().sort({ name: 1 }).lean();
    return res.json({
      items: items.map((c) => ({ id: c._id, slug: c.slug, name: c.name })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load categories" });
  }
}

/** POST /api/admin/categories — body: { name } */
export async function createAdminCategory(req, res) {
  try {
    const name = String(req.body?.name ?? "").trim();
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }
    const existing = await Category.findOne({
      name: new RegExp(`^${escapeRegex(name)}$`, "i"),
    }).lean();
    if (existing) {
      return res.status(200).json({
        category: { id: existing._id, slug: existing.slug, name: existing.name },
      });
    }
    const slug = await ensureUniqueCategorySlug(name);
    const doc = await Category.create({ name, slug });
    void invalidatePublicCatalogCache();
    return res.status(201).json({
      category: { id: doc._id, slug: doc.slug, name: doc.name },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Category already exists" });
    }
    console.error(err);
    return res.status(500).json({ message: "Failed to create category" });
  }
}
