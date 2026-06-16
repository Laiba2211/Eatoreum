import AdminNotification from "../models/AdminNotification.js";

async function safeCreate(data) {
  try {
    await AdminNotification.create({ read: false, ...data });
  } catch (err) {
    console.error("[admin-notify]", err);
  }
}

/** Fire-and-forget when a storefront COD order is created. */
export function notifyNewStoreOrder(order) {
  const o = order?.toObject ? order.toObject() : { ...order };
  const sh = o.shipping || {};
  const num = o.orderNumber || "";
  const id = o._id != null ? String(o._id) : "";
  void safeCreate({
    type: "order_received",
    title: num ? `New order ${num}` : "New order received",
    meta: {
      orderId: id,
      orderNumber: num,
      customerName: String(sh.fullName ?? "").trim(),
      subtotal: o.subtotal,
      currency: o.currency || "PKR",
    },
  });
}

/** New product review (storefront). */
export function notifyNewProductReview(review, productLean) {
  const r = review?.toObject ? review.toObject() : { ...review };
  const pname = String(productLean?.name ?? "Product").trim() || "Product";
  const slug = String(productLean?.slug ?? "").trim();
  const rid = r._id != null ? String(r._id) : "";
  void safeCreate({
    type: "review_new",
    title: `New review on ${pname}`,
    meta: {
      reviewId: rid,
      productSlug: slug,
      productName: pname,
      authorName: String(r.authorName ?? "").trim(),
      rating: r.rating,
    },
  });
}

/** New reply on a product review. */
export function notifyNewReviewReply({ reviewId, productLean, authorName }) {
  const pname = String(productLean?.name ?? "Product").trim() || "Product";
  const slug = String(productLean?.slug ?? "").trim();
  void safeCreate({
    type: "review_reply",
    title: `New reply on ${pname}`,
    meta: {
      reviewId: String(reviewId),
      productSlug: slug,
      productName: pname,
      authorName: String(authorName ?? "").trim(),
    },
  });
}
