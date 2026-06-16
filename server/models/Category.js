import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 140 },
  },
  { timestamps: true }
);

categorySchema.index({ name: 1 });

const Category = mongoose.model("Category", categorySchema);
export default Category;
