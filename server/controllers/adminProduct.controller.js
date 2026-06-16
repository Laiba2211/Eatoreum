import Product from "../models/Product.js";
import { resolveCategorySlugForSave } from "../utils/categorySync.js";
import { normalizeProductGallery } from "../utils/productGallery.js";
import { slugify } from "../utils/slugify.js";
import {
  buildProductListFilter,
  findProductByIdOrSlug,
  parsePagination,
} from "../utils/productQueries.js";
import { invalidatePublicCatalogCache } from "../utils/redisCache.js";

function serializeProduct(doc) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = o;
  const merged = normalizeProductGallery(rest);
  return { id: _id, ...merged };
}

const UPDATABLE = new Set([
  "name",
  "slug",
  "description",
  "shortDescription",
  "price",
  "compareAtPrice",
  "currency",
  "sku",
  "mainImage",
  "variantImages",
  "images",
  "category",
  "tags",
  "stock",
  "isPublished",
  "isFeatured",
  "weightGrams",
]);

async function ensureUniqueSlug(base, excludeId = null) {
  let candidate = slugify(base);
  let n = 0;
  for (;;) {
    const q = excludeId ? { slug: candidate, _id: { $ne: excludeId } } : { slug: candidate };
    const exists = await Product.exists(q);
    if (!exists) return candidate;
    n += 1;
    candidate = `${slugify(base)}-${n}`;
  }
}

function normalizeSku(value) {
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim();
  return s === "" ? null : s;
}

function pickBody(body) {
  const out = {};
  if (!body || typeof body !== "object") return out;
  for (const key of UPDATABLE) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      out[key] = body[key];
    }
  }
  return out;
}

/** Clears featured flag on every product except `exceptId` (when set). */
async function clearFeaturedExcept(exceptId) {
  const filter = exceptId ? { _id: { $ne: exceptId } } : {};
  await Product.updateMany(filter, { $set: { isFeatured: false } });
}

/** GET /api/admin/products */
export async function listProducts(req, res) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = buildProductListFilter(req.query, { publishedOnly: false });

    const [items, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    return res.json({
      items: items.map((p) => {
        const { _id, __v, ...rest } = p;
        const merged = normalizeProductGallery(rest);
        return { id: _id, ...merged };
      }),
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load products" });
  }
}

/** GET /api/admin/products/:idOrSlug */
export async function getProduct(req, res) {
  try {
    const doc = await findProductByIdOrSlug(req.params.idOrSlug);
    if (!doc) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json({ product: serializeProduct(doc) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load product" });
  }
}

/** POST /api/admin/products */
export async function createProduct(req, res) {
  try {
    const body = req.body ?? {};
    const name = String(body.name ?? "").trim();
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({ message: "price must be a non-negative number" });
    }

    const slugInput = body.slug != null ? String(body.slug).trim() : "";
    const slug = await ensureUniqueSlug(slugInput || name);

    const sku = normalizeSku(body.sku);

    let compareAtPrice;
    if (body.compareAtPrice != null && body.compareAtPrice !== "") {
      const c = Number(body.compareAtPrice);
      if (!Number.isFinite(c) || c < 0) {
        return res.status(400).json({ message: "compareAtPrice must be a non-negative number" });
      }
      if (c <= price) {
        return res.status(400).json({
          message: "Original price must be greater than the sale price.",
        });
      }
      compareAtPrice = c;
    }

    let weightGrams;
    if (body.weightGrams != null && body.weightGrams !== "") {
      const w = Number(body.weightGrams);
      if (!Number.isFinite(w) || w < 0) {
        return res.status(400).json({ message: "weightGrams must be a non-negative number" });
      }
      weightGrams = w;
    }

    const isFeatured = Boolean(body.isFeatured);

    let category = "";
    if (body.category != null && String(body.category).trim()) {
      category = await resolveCategorySlugForSave(body.category);
    }

    const doc = await Product.create({
      name,
      slug,
      description: String(body.description ?? ""),
      shortDescription: String(body.shortDescription ?? ""),
      price,
      ...(compareAtPrice !== undefined ? { compareAtPrice } : {}),
      currency: body.currency != null ? String(body.currency).toUpperCase().slice(0, 3) : "PKR",
      sku: sku === null ? undefined : sku,
      mainImage: typeof body.mainImage === "string" ? body.mainImage.trim() : "",
      variantImages: Array.isArray(body.variantImages)
        ? body.variantImages.map(String).filter(Boolean)
        : [],
      images: [],
      category,
      tags: Array.isArray(body.tags) ? body.tags.map((t) => String(t).trim()).filter(Boolean) : [],
      stock: Number.isFinite(Number(body.stock)) ? Math.max(0, Number(body.stock)) : 0,
      isPublished: Boolean(body.isPublished),
      isFeatured,
      ...(weightGrams !== undefined ? { weightGrams } : {}),
    });

    if (isFeatured) {
      await clearFeaturedExcept(doc._id);
    }

    void invalidatePublicCatalogCache();
    return res.status(201).json({ product: serializeProduct(doc) });
  } catch (err) {
    if (err.code === 11000) {
      const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : "field";
      return res.status(409).json({ message: `Duplicate ${field}` });
    }
    console.error(err);
    return res.status(500).json({ message: "Failed to create product" });
  }
}

/** PATCH /api/admin/products/:idOrSlug */
export async function updateProduct(req, res) {
  try {
    const doc = await findProductByIdOrSlug(req.params.idOrSlug);
    if (!doc) {
      return res.status(404).json({ message: "Product not found" });
    }

    const patch = pickBody(req.body);
    if (patch.slug != null) {
      const s = String(patch.slug).trim().toLowerCase();
      patch.slug = await ensureUniqueSlug(s || doc.name, doc._id);
    }
    if (patch.name != null) {
      patch.name = String(patch.name).trim();
      if (!patch.name) {
        return res.status(400).json({ message: "name cannot be empty" });
      }
    }
    if (patch.price != null) {
      const p = Number(patch.price);
      if (!Number.isFinite(p) || p < 0) {
        return res.status(400).json({ message: "price must be a non-negative number" });
      }
      patch.price = p;
    }
    let compareAtExplicitlyCleared = false;
    if (patch.compareAtPrice !== undefined) {
      if (patch.compareAtPrice === null || patch.compareAtPrice === "") {
        doc.set("compareAtPrice", undefined);
        delete patch.compareAtPrice;
        compareAtExplicitlyCleared = true;
      } else {
        const c = Number(patch.compareAtPrice);
        if (!Number.isFinite(c) || c < 0) {
          return res.status(400).json({ message: "compareAtPrice must be a non-negative number" });
        }
        patch.compareAtPrice = c;
      }
    }

    const nextPrice = patch.price != null ? patch.price : doc.price;
    let nextCompareAt = doc.compareAtPrice;
    if (compareAtExplicitlyCleared) {
      nextCompareAt = undefined;
    } else if (patch.compareAtPrice !== undefined) {
      nextCompareAt = patch.compareAtPrice;
    }
    if (nextCompareAt != null && Number(nextCompareAt) <= Number(nextPrice)) {
      return res.status(400).json({
        message: "Original price must be greater than the sale price.",
      });
    }
    if (patch.currency != null) {
      patch.currency = String(patch.currency).toUpperCase().slice(0, 3);
    }
    if (Object.prototype.hasOwnProperty.call(patch, "sku")) {
      patch.sku = normalizeSku(patch.sku);
      if (patch.sku === null) patch.sku = undefined;
    }
    if (patch.mainImage != null) {
      patch.mainImage = String(patch.mainImage).trim();
    }
    if (patch.variantImages != null) {
      patch.variantImages = Array.isArray(patch.variantImages)
        ? patch.variantImages.map(String).filter(Boolean)
        : [];
    }
    if (patch.images != null) {
      patch.images = Array.isArray(patch.images) ? patch.images.map(String) : [];
    }
    if (patch.tags != null) {
      patch.tags = Array.isArray(patch.tags) ? patch.tags.map((t) => String(t).trim()).filter(Boolean) : [];
    }
    if (patch.stock != null) {
      const st = Number(patch.stock);
      if (!Number.isFinite(st) || st < 0) {
        return res.status(400).json({ message: "stock must be a non-negative number" });
      }
      patch.stock = st;
    }
    if (patch.weightGrams !== undefined) {
      if (patch.weightGrams === null || patch.weightGrams === "") {
        doc.set("weightGrams", undefined);
        delete patch.weightGrams;
      } else {
        const w = Number(patch.weightGrams);
        if (!Number.isFinite(w) || w < 0) {
          return res.status(400).json({ message: "weightGrams must be a non-negative number" });
        }
        patch.weightGrams = w;
      }
    }
    if (patch.category !== undefined) {
      const raw = String(patch.category ?? "").trim();
      patch.category = raw ? await resolveCategorySlugForSave(raw) : "";
    }
    if (patch.isPublished != null) {
      patch.isPublished = Boolean(patch.isPublished);
    }
    if (Object.prototype.hasOwnProperty.call(patch, "isFeatured")) {
      patch.isFeatured = Boolean(patch.isFeatured);
      if (patch.isFeatured) {
        await clearFeaturedExcept(doc._id);
      }
    }

    Object.assign(doc, patch);
    await doc.save();

    void invalidatePublicCatalogCache();
    return res.json({ product: serializeProduct(doc) });
  } catch (err) {
    if (err.code === 11000) {
      const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : "field";
      return res.status(409).json({ message: `Duplicate ${field}` });
    }
    console.error(err);
    return res.status(500).json({ message: "Failed to update product" });
  }
}

/** DELETE /api/admin/products/:idOrSlug */
export async function deleteProduct(req, res) {
  try {
    const doc = await findProductByIdOrSlug(req.params.idOrSlug);
    if (!doc) {
      return res.status(404).json({ message: "Product not found" });
    }
    await doc.deleteOne();
    void invalidatePublicCatalogCache();
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete product" });
  }
}
