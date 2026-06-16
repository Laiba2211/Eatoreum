import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 220 },
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "", maxlength: 500 },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    currency: { type: String, default: "PKR", uppercase: true, trim: true, maxlength: 3 },
    sku: { type: String, trim: true, sparse: true, unique: true },
    /** Primary catalog image (URL path e.g. `/uploads/products/…`). */
    mainImage: { type: String, default: "" },
    /** Additional gallery images. */
    variantImages: { type: [String], default: [] },
    /** @deprecated Legacy gallery; prefer `mainImage` + `variantImages`. */
    images: { type: [String], default: [] },
    category: { type: String, trim: true, default: "" },
    tags: { type: [String], default: [] },
    stock: { type: Number, default: 0, min: 0 },
    isPublished: { type: Boolean, default: false },
    /** Storefront hero; at most one should be true (enforced in admin API). */
    isFeatured: { type: Boolean, default: false },
    weightGrams: { type: Number, min: 0 },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, isPublished: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1, isPublished: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;
