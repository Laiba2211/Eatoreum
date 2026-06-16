/**
 * Generates WebP derivatives in public/ for LCP / navbar assets.
 * Run via: npm run optimize-images (also runs before vite build).
 */
import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = join(__dirname, "..", "public");

const heroSrc = join(pub, "1775491546732_Untitled-3.1.png");
const heroMobileSrc = join(pub, "craiyon_103640_image.png");
const logoSrc = join(pub, "erasebg-transformed.png");

async function main() {
  await sharp(heroMobileSrc)
    .resize(720, 1080, { fit: "cover", position: "centre", withoutEnlargement: true })
    .webp({ quality: 70, effort: 4 })
    .toFile(join(pub, "hero-home-mobile.webp"));

  await sharp(heroSrc)
    .resize(640, null, { withoutEnlargement: true })
    .webp({ quality: 72, effort: 4 })
    .toFile(join(pub, "hero-home-640.webp"));

  await sharp(heroSrc)
    .resize(960, null, { withoutEnlargement: true })
    .webp({ quality: 72, effort: 4 })
    .toFile(join(pub, "hero-home-960.webp"));

  await sharp(heroSrc)
    .resize(1280, null, { withoutEnlargement: true })
    .webp({ quality: 72, effort: 4 })
    .toFile(join(pub, "hero-home-1280.webp"));

  await sharp(heroSrc)
    .resize(1920, null, { withoutEnlargement: true })
    .webp({ quality: 72, effort: 4 })
    .toFile(join(pub, "hero-home-1920.webp"));

  await sharp(logoSrc)
    .resize(256, 256, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85, effort: 4 })
    .toFile(join(pub, "logo-navbar.webp"));

  console.log("[optimize-images] wrote hero-home-mobile.webp, hero-home-*.webp (+960), logo-navbar.webp");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
