/**
 * One cart-shaped line for `navigate("/checkout", { state: { checkoutItems } })`.
 * Matches CartContext item shape (productId, slug, name, price, image, quantity, currency).
 */
export function buildCheckoutLineFromProduct(product, quantity = 1) {
  const q = Math.max(1, Math.floor(Number(quantity)) || 1);
  const currency = (product.currency || "PKR").toString().toUpperCase().slice(0, 3);
  const weightGrams =
    product.weightGrams != null && Number.isFinite(Number(product.weightGrams))
      ? Number(product.weightGrams)
      : null;
  return {
    productId: String(product.id),
    slug: String(product.slug ?? ""),
    name: String(product.name ?? ""),
    price: Number(product.price) || 0,
    image: String(product.images?.[0] ?? product.mainImage ?? ""),
    quantity: q,
    currency,
    weightGrams,
  };
}

/** Safe parse of `location.state.checkoutItems` from router state. */
export function checkoutItemsFromState(state) {
  if (!state || !Array.isArray(state.checkoutItems)) return [];
  return state.checkoutItems
    .filter((row) => row && row.productId != null)
    .map((row) => ({
      productId: String(row.productId),
      slug: String(row.slug ?? ""),
      name: String(row.name ?? ""),
      price: Number(row.price) || 0,
      image: String(row.image ?? ""),
      quantity: Math.max(1, Math.floor(Number(row.quantity)) || 1),
      currency: row.currency ? String(row.currency).toUpperCase().slice(0, 3) : "PKR",
      weightGrams:
        row.weightGrams != null && row.weightGrams !== "" && Number.isFinite(Number(row.weightGrams))
          ? Number(row.weightGrams)
          : null,
    }))
    .slice(0, 50);
}
