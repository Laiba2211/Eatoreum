import crypto from "crypto";
import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.join(process.cwd(), "public", "uploads", "products");

function ensureUploadDir() {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    ensureUploadDir();
    cb(null, uploadDir);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safe = ext && /^\.(jpe?g|png|gif|webp)$/i.test(ext) ? ext : ".jpg";
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${safe}`);
  },
});

function fileFilter(_req, file, cb) {
  const ok = /^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype);
  if (ok) cb(null, true);
  else cb(new Error("Only JPEG, PNG, GIF, or WebP images are allowed"));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/** Single field name `file` → disk under `public/uploads/products`. */
export const uploadProductImage = upload.single("file");

export function handleProductImageUpload(req, res, next) {
  uploadProductImage(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Image too large (max 5MB)" });
      }
      return res.status(400).json({ message: err.message });
    }
    return res.status(400).json({ message: err.message || "Upload failed" });
  });
}
