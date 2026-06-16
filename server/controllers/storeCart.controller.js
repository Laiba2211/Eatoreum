import { resolveCartLines } from "../utils/storeOrderLines.js";

function serializeLine(line) {
  return {
    productId: String(line.productId),
    name: line.name,
    slug: line.slug,
    price: line.price,
    quantity: line.quantity,
    image: line.image,
    weightGrams: line.weightGrams ?? null,
    lineTotal: line.price * line.quantity,
  };
}

/** POST /api/cart/validate — server prices & stock vs catalog */
export async function validateCart(req, res) {
  try {
    const rows = req.body?.items;
    const { lines, subtotal, currency } = await resolveCartLines(rows, { requireStock: true });
    return res.json({
      items: lines.map(serializeLine),
      subtotal,
      currency,
    });
  } catch (err) {
    if (err.code === "EMPTY_CART") {
      return res.status(400).json({ message: err.message });
    }
    if (["BAD_PRODUCT_ID", "BAD_QTY", "NOT_AVAILABLE", "STOCK"].includes(err.code)) {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Could not validate cart" });
  }
}
