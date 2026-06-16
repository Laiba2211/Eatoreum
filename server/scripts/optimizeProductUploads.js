import "dotenv/config";
import path from "node:path";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";
import { optimizeProductImageFile } from "../utils/optimizeProductImage.js";

function isProductUploadUrl(url) {
  return typeof url === "string" && url.startsWith("/uploads/products/");
}

function toAbsolutePath(url) {
  const rel = String(url).replace(/^\/+/, "");
  return path.join(process.cwd(), "public", rel);
}

async function run() {
  await connectDB();

  const products = await Product.find(
    {},
    { mainImage: 1, variantImages: 1, images: 1 }
  );

  const allUrls = new Set();
  for (const p of products) {
    if (isProductUploadUrl(p.mainImage)) allUrls.add(p.mainImage);
    for (const u of p.variantImages || []) if (isProductUploadUrl(u)) allUrls.add(u);
    for (const u of p.images || []) if (isProductUploadUrl(u)) allUrls.add(u);
  }

  const remap = new Map();
  let optimizedCount = 0;
  for (const oldUrl of allUrls) {
    try {
      const out = await optimizeProductImageFile(toAbsolutePath(oldUrl));
      const newUrl = `/uploads/products/${out.filename}`;
      remap.set(oldUrl, newUrl);
      if (newUrl !== oldUrl) optimizedCount += 1;
    } catch (err) {
      console.warn("[optimizeProductUploads] skipped:", oldUrl, err.message);
    }
  }

  const ops = [];
  for (const p of products) {
    const nextMain = remap.get(p.mainImage) ?? p.mainImage;
    const nextVariants = (p.variantImages || []).map((u) => remap.get(u) ?? u);
    const nextImages = (p.images || []).map((u) => remap.get(u) ?? u);

    const changed =
      nextMain !== p.mainImage ||
      JSON.stringify(nextVariants) !== JSON.stringify(p.variantImages || []) ||
      JSON.stringify(nextImages) !== JSON.stringify(p.images || []);

    if (changed) {
      ops.push({
        updateOne: {
          filter: { _id: p._id },
          update: {
            $set: {
              mainImage: nextMain,
              variantImages: nextVariants,
              images: nextImages,
            },
          },
        },
      });
    }
  }

  if (ops.length) {
    await Product.bulkWrite(ops);
  }

  console.log(`[optimizeProductUploads] files seen: ${allUrls.size}`);
  console.log(`[optimizeProductUploads] files optimized/re-encoded: ${optimizedCount}`);
  console.log(`[optimizeProductUploads] product docs updated: ${ops.length}`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
