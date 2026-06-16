import mongoose from "mongoose";
import Product from "../models/Product.js";
import ProductReview from "../models/ProductReview.js";
import { escapeRegex, parsePagination } from "../utils/productQueries.js";

function serializeReply(r) {
  const o = r && typeof r.toObject === "function" ? r.toObject() : { ...r };
  const { _id, ...rest } = o;
  return { id: String(_id), ...rest };
}

function serializeProduct(pop) {
  if (!pop) return null;
  const o = typeof pop.toObject === "function" ? pop.toObject() : pop;
  const id = o._id ?? o.id;
  if (!id) return null;
  return {
    id: String(id),
    name: String(o.name ?? "").trim() || "—",
    slug: String(o.slug ?? "").trim(),
  };
}

function serializeReviewRow(doc) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, product, __v, replies, ...rest } = o;
  return {
    id: String(_id),
    ...rest,
    product: serializeProduct(product),
    replies: Array.isArray(replies) ? replies.map(serializeReply) : [],
  };
}

/** GET /api/admin/reviews */
export async function listReviews(req, res) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = {};

    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      const productIds = await Product.find({ $or: [{ name: rx }, { slug: rx }] }).select("_id").lean();
      const ids = productIds.map((p) => p._id);
      filter.$or = [{ authorName: rx }, { body: rx }, ...(ids.length ? [{ product: { $in: ids } }] : [])];
    }

    const [rows, total] = await Promise.all([
      ProductReview.find(filter)
        .populate({ path: "product", select: "name slug" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductReview.countDocuments(filter),
    ]);

    return res.json({
      items: rows.map((row) =>
        serializeReviewRow({
          ...row,
          product: row.product,
          replies: row.replies || [],
        })
      ),
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load reviews" });
  }
}

/** DELETE /api/admin/reviews/:reviewId */
export async function deleteReview(req, res) {
  try {
    const { reviewId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Invalid review id" });
    }
    const deleted = await ProductReview.findByIdAndDelete(reviewId);
    if (!deleted) {
      return res.status(404).json({ message: "Review not found" });
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not delete review" });
  }
}

/** DELETE /api/admin/reviews/:reviewId/replies/:replyId */
export async function deleteReply(req, res) {
  try {
    const { reviewId, replyId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(reviewId) || !mongoose.Types.ObjectId.isValid(replyId)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const result = await ProductReview.updateOne(
      { _id: reviewId },
      { $pull: { replies: { _id: replyId } } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Review not found" });
    }
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Reply not found" });
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not delete reply" });
  }
}
