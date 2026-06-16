import Category from "../models/Category.js";
import { slugify } from "./slugify.js";

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Ensures a Category row exists and returns the canonical slug for `Product.category`.
 * @param {string} raw slug from admin select, or display name for new values
 */
export async function resolveCategorySlugForSave(raw) {
  const t = String(raw ?? "").trim();
  if (!t) return "";

  const asSlug = t.toLowerCase();
  const bySlug = await Category.findOne({ slug: asSlug }).lean();
  if (bySlug) return bySlug.slug;

  const byName = await Category.findOne({
    name: new RegExp(`^${escapeRegex(t)}$`, "i"),
  }).lean();
  if (byName) return byName.slug;

  const slug = slugify(t);
  const name = t;
  await Category.findOneAndUpdate(
    { slug },
    { $set: { name }, $setOnInsert: { slug } },
    { upsert: true }
  );
  return slug;
}

/** Adds `categoryLabel` to plain product objects using `category` slug. */
export async function attachCategoryLabels(items) {
  if (!Array.isArray(items) || !items.length) return items;
  const slugs = [
    ...new Set(
      items
        .map((p) => String(p.category ?? "").trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
  if (!slugs.length) {
    return items.map((p) => ({ ...p, categoryLabel: String(p.category || "").trim() || "" }));
  }
  const cats = await Category.find({ slug: { $in: slugs } }).select("slug name").lean();
  const map = Object.fromEntries(cats.map((c) => [c.slug, c.name]));
  return items.map((p) => {
    const slug = String(p.category ?? "").trim().toLowerCase();
    return {
      ...p,
      categoryLabel: map[slug] || String(p.category || "").trim() || "",
    };
  });
}

export async function categoryLabelForSlug(slug) {
  const s = String(slug ?? "").trim().toLowerCase();
  if (!s) return "";
  const doc = await Category.findOne({ slug: s }).select("name").lean();
  return doc?.name ?? "";
}
