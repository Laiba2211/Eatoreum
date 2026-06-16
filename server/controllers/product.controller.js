import Product from "../models/Product.js";
import { attachCategoryLabels, categoryLabelForSlug } from "../utils/categorySync.js";
import { normalizeProductGallery } from "../utils/productGallery.js";
import {
  buildProductListFilter,
  findProductByIdOrSlug,
  parsePagination,
} from "../utils/productQueries.js";
import { cacheWrap, cacheWrapNullable, stableQueryKey } from "../utils/redisCache.js";

function leanWithId(p) {
  const { _id, __v, ...rest } = p;
  const merged = normalizeProductGallery(rest);
  return { id: _id, ...merged };
}

function toPublicProduct(doc) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = o;
  const merged = normalizeProductGallery(rest);
  return { id: _id, ...merged };
}

async function buildPublishedListPayload(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildProductListFilter(query, { publishedOnly: true });

  const [rawItems, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  const items = await attachCategoryLabels(rawItems);

  return {
    items: items.map(leanWithId),
    page,
    limit,
    total,
    pages: Math.ceil(total / limit) || 1,
  };
}

async function buildPublishedProductPayload(idOrSlug) {
  const doc = await findProductByIdOrSlug(idOrSlug, { isPublished: true });
  if (!doc) return null;
  const product = toPublicProduct(doc);
  const categoryLabel = await categoryLabelForSlug(product.category);
  return { product: { ...product, categoryLabel } };
}

/** GET /api/products — storefront: published catalog only (optional Redis cache) */
export async function listPublishedProducts(req, res) {
  try {
    const cacheKey = `products:list:${stableQueryKey(req.query)}`;
    const payload = await cacheWrap(cacheKey, undefined, () => buildPublishedListPayload(req.query));
    return res.json(payload);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load products" });
  }
}

/** GET /api/products/:idOrSlug */
export async function getPublishedProduct(req, res) {
  try {
    const key = String(req.params.idOrSlug ?? "").trim().toLowerCase();
    const cacheKey = `product:detail:${key}`;
    const payload = await cacheWrapNullable(cacheKey, undefined, () =>
      buildPublishedProductPayload(req.params.idOrSlug)
    );

    if (!payload) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json(payload);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load product" });
  }
}
