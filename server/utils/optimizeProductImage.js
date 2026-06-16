import { rename, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * Re-encodes a product upload to WebP and constrains max dimensions.
 * Returns the final absolute path + filename.
 * @param {string} inputPath absolute path under public/uploads/products
 */
export async function optimizeProductImageFile(inputPath) {
  const dir = path.dirname(inputPath);
  const parsed = path.parse(inputPath);
  const finalPath = path.join(dir, `${parsed.name}.webp`);
  const tempPath = finalPath === inputPath ? path.join(dir, `${parsed.name}.tmp.webp`) : finalPath;

  await sharp(inputPath)
    .rotate()
    .resize(1280, 1280, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78, effort: 4 })
    .toFile(tempPath);

  if (tempPath !== finalPath) {
    await rename(tempPath, finalPath);
  }
  if (inputPath !== finalPath) {
    await unlink(inputPath).catch(() => {});
  }

  return {
    absolutePath: finalPath,
    filename: path.basename(finalPath),
  };
}
