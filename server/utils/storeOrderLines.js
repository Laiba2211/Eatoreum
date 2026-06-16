import crypto from "crypto";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { normalizeProductGallery } from "./productGallery.js";

function isValidObjectIdString(id) {
  if (!id || typeof id !== "string") return false;
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  try {
    return String(new mongoose.Types.ObjectId(id)) === id;
  } catch {
    return false;
  }
}

/**
 * Resolve cart rows against live catalog (published products, optional stock check).
 * @param {Array<{ productId?: string; id?: string; quantity?: unknown }>} rows
 * @param {{ requireStock?: boolean }} [opts]
 */
export async function resolveCartLines(rows, opts = {}) {
  const requireStock = opts.requireStock !== false;
  if (!Array.isArray(rows) || rows.length === 0) {
    const err = new Error("Cart is empty");
    err.code = "EMPTY_CART";
    throw err;
  }

  const lines = [];
  let subtotal = 0;
  let currency = "PKR";

  for (const row of rows) {
    const idRaw = String(row.productId ?? row.id ?? "").trim();
    const qty = Math.floor(Number(row.quantity));

    if (!isValidObjectIdString(idRaw)) {
      const err = new Error(`Invalid product id: ${idRaw || "(missing)"}`);
      err.code = "BAD_PRODUCT_ID";
      throw err;
    }
    if (qty < 1) {
      const err = new Error("Each line needs quantity of at least 1");
      err.code = "BAD_QTY";
      throw err;
    }

    const p = await Product.findById(idRaw).lean();
    if (!p || !p.isPublished) {
      const err = new Error(`Product is not available: ${idRaw}`);
      err.code = "NOT_AVAILABLE";
      throw err;
    }
    if (requireStock && p.stock < qty) {
      const err = new Error(`Insufficient stock for "${p.name}" (available ${p.stock}, requested ${qty})`);
      err.code = "STOCK";
      throw err;
    }

    const g = normalizeProductGallery(p);
    const image = g.images?.[0] ?? "";

    const wg = p.weightGrams;
    const weightGrams =
      wg != null && wg !== "" && Number.isFinite(Number(wg)) ? Number(wg) : null;

    lines.push({
      productId: p._id,
      name: p.name,
      slug: p.slug || "",
      price: p.price,
      quantity: qty,
      image,
      weightGrams,
    });
    subtotal += p.price * qty;
    if (p.currency) currency = String(p.currency).toUpperCase().slice(0, 3);
  }

  return { lines, subtotal, currency };
}

export function makeOrderNumber() {
  return `EO-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
}
