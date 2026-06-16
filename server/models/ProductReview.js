import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    authorName: { type: String, required: true, trim: true, maxlength: 80 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

const productReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    authorName: { type: String, required: true, trim: true, maxlength: 80 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    replies: { type: [replySchema], default: [] },
  },
  { timestamps: true }
);

productReviewSchema.index({ product: 1, createdAt: -1 });

const ProductReview = mongoose.model("ProductReview", productReviewSchema);
export default ProductReview;
