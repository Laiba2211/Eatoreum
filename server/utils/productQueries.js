import mongoose from "mongoose";
import Product from "../models/Product.js";

export function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * @param {import("express").Request["query"]} query
 * @param {{ publishedOnly?: boolean }} opts
 */
export function buildProductListFilter(query, opts = {}) {
  const filter = {};

  if (opts.publishedOnly) {
    filter.isPublished = true;
  } else if (query.isPublished === "true" || query.isPublished === "false") {
    filter.isPublished = query.isPublished === "true";
  }

  const cat = typeof query.category === "string" ? query.category.trim() : "";
  if (cat) filter.category = cat;

  const q = typeof query.q === "string" ? query.q.trim() : "";
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: rx }, { sku: rx }, { slug: rx }, { description: rx }];
  }

  const feat = typeof query.featured === "string" ? query.featured.trim().toLowerCase() : "";
  if (feat === "true" || feat === "1") {
    filter.isFeatured = true;
  }

  return filter;
}

export function parsePagination(query) {
  const page = Math.max(1, Number.parseInt(String(query.page ?? "1"), 10) || 1);
  const rawLimit = Number.parseInt(String(query.limit ?? "20"), 10) || 20;
  const limit = Math.min(100, Math.max(1, rawLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * @param {string} idOrSlug
 * @param {Record<string, unknown>} [extraMatch]
 */
export async function findProductByIdOrSlug(idOrSlug, extraMatch = {}) {
  const key = String(idOrSlug ?? "").trim();
  if (!key) return null;

  if (mongoose.Types.ObjectId.isValid(key)) {
    try {
      const oid = new mongoose.Types.ObjectId(key);
      if (String(oid) === key) {
        const byId = await Product.findOne({ _id: key, ...extraMatch });
        if (byId) return byId;
      }
    } catch {
      /* fall through to slug */
    }
  }

  return Product.findOne({
    slug: key.toLowerCase(),
    ...extraMatch,
  });
}
