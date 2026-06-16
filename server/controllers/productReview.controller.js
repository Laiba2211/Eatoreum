import mongoose from "mongoose";
import Product from "../models/Product.js";
import ProductReview from "../models/ProductReview.js";
import { findProductByIdOrSlug } from "../utils/productQueries.js";
import { notifyNewProductReview, notifyNewReviewReply } from "../utils/adminNotify.js";

function oneLine(s, max) {
  return String(s)
    .replace(/[\r\n\u0000]/g, " ")
    .trim()
    .slice(0, max);
}

function serializeReply(r) {
  const o = r.toObject ? r.toObject() : { ...r };
  const { _id, ...rest } = o;
  return { id: String(_id), ...rest };
}

function serializeReview(doc) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, product, __v, replies, ...rest } = o;
  return {
    id: String(_id),
    ...rest,
    replies: Array.isArray(replies) ? replies.map(serializeReply) : [],
  };
}

async function resolvePublishedProductId(idOrSlug) {
  const product = await findProductByIdOrSlug(idOrSlug, { isPublished: true });
  if (!product) return null;
  return product._id;
}

/** GET /api/products/:idOrSlug/reviews */
export async function listReviews(req, res) {
  try {
    const productId = await resolvePublishedProductId(req.params.idOrSlug);
    if (!productId) {
      return res.status(404).json({ message: "Product not found" });
    }

    const limit = Math.min(100, Math.max(1, Number.parseInt(String(req.query.limit ?? "50"), 10) || 50));
    const docs = await ProductReview.find({ product: productId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const reviews = docs.map((d) =>
      serializeReview({
        ...d,
        replies: d.replies || [],
      })
    );

    return res.json({ reviews });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load reviews" });
  }
}

/** POST /api/products/:idOrSlug/reviews */
export async function createReview(req, res) {
  try {
    const productId = await resolvePublishedProductId(req.params.idOrSlug);
    if (!productId) {
      return res.status(404).json({ message: "Product not found" });
    }

    const raw = req.body ?? {};
    const authorName = oneLine(raw.authorName ?? "", 80);
    const body = String(raw.body ?? "").trim();
    const rating = Number.parseInt(String(raw.rating ?? ""), 10);

    if (!authorName) {
      return res.status(400).json({ message: "Name is required (max 80 characters)." });
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }
    if (body.length < 5) {
      return res.status(400).json({ message: "Review must be at least 5 characters." });
    }
    if (body.length > 2000) {
      return res.status(400).json({ message: "Review is too long (max 2000 characters)." });
    }

    const doc = await ProductReview.create({
      product: productId,
      authorName,
      rating,
      body,
    });

    const productLean = await Product.findById(productId).select("name slug").lean();
    void notifyNewProductReview(doc, productLean);

    return res.status(201).json({ review: serializeReview(doc) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not post review" });
  }
}

/** POST /api/products/:idOrSlug/reviews/:reviewId/replies */
export async function createReply(req, res) {
  try {
    const productId = await resolvePublishedProductId(req.params.idOrSlug);
    if (!productId) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviewId = String(req.params.reviewId ?? "").trim();
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Invalid review id" });
    }

    const review = await ProductReview.findOne({ _id: reviewId, product: productId });
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const raw = req.body ?? {};
    const authorName = oneLine(raw.authorName ?? "", 80);
    const body = String(raw.body ?? "").trim();

    if (!authorName) {
      return res.status(400).json({ message: "Name is required (max 80 characters)." });
    }
    if (body.length < 3) {
      return res.status(400).json({ message: "Reply must be at least 3 characters." });
    }
    if (body.length > 2000) {
      return res.status(400).json({ message: "Reply is too long (max 2000 characters)." });
    }

    review.replies.push({ authorName, body });
    await review.save();

    const productLean = await Product.findById(review.product).select("name slug").lean();
    void notifyNewReviewReply({
      reviewId: review._id,
      productLean,
      authorName,
    });

    const last = review.replies[review.replies.length - 1];
    return res.status(201).json({ reply: serializeReply(last) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not post reply" });
  }
}
