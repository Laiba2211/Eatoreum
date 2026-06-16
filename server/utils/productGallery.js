/** Normalize main + variants (+ legacy `images`) into a single gallery list. */
export function normalizeProductGallery(raw) {
  const legacy = Array.isArray(raw.images) ? raw.images.filter(Boolean).map(String) : [];
  let mainImage = typeof raw.mainImage === "string" ? raw.mainImage.trim() : "";
  let variantImages = Array.isArray(raw.variantImages)
    ? raw.variantImages.map(String).filter(Boolean)
    : [];
  if (!mainImage && legacy.length) {
    mainImage = legacy[0];
    variantImages = legacy.slice(1);
  }
  const images = [mainImage, ...variantImages].filter(Boolean);
  return { ...raw, mainImage, variantImages, images };
}
