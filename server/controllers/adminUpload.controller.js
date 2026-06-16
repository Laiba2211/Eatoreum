import { optimizeProductImageFile } from "../utils/optimizeProductImage.js";

/** POST /api/admin/upload/product-image (multipart field `file`) */
export async function postProductImage(req, res) {
  if (!req.file?.path) {
    return res.status(400).json({ message: "No image file received" });
  }
  try {
    const optimized = await optimizeProductImageFile(req.file.path);
    const url = `/uploads/products/${optimized.filename}`;
    return res.status(201).json({ url });
  } catch (err) {
    console.error("[upload] image optimize failed:", err);
    return res.status(500).json({ message: "Could not process image upload" });
  }
}
