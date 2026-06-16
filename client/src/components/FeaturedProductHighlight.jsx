import { Link } from "react-router-dom";
import { formatProductWeightGrams } from "../utils/productWeight.js";

function formatPrice(amount, currency) {
  const n = Number(amount) || 0;
  if (String(currency || "").toUpperCase() === "PKR") {
    return `Rs. ${n.toLocaleString("en-PK")}`;
  }
  return `${currency} ${n.toLocaleString()}`;
}

function FeaturedProductHighlight({ product }) {
  if (!product) return null;

  const categoryName = product.categoryLabel || product.categoryId || "Featured";
  const weightLine = formatProductWeightGrams(product.weightGrams);

  const heroImage =
    Array.isArray(product.images) && product.images.length
      ? product.images[0]
      : null;

  const blurb =
    product.longDescription && product.longDescription !== product.description
      ? product.longDescription
      : product.description;

  const onSale = product.compareAtPrice != null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
      
      {/* HEADER */}
      <div className="mb-12 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-(--gold-light)">
          Featured Product
        </p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-(--cream)">
          Editor’s Pick of the Week
        </h2>
        {product.description && (
          <p className="mt-3 mx-auto max-w-2xl text-sm text-(--oat)">
            {product.description}
          </p>
        )}
      </div>

      {/* HERO CARD */}
      <div className="grid gap-12 lg:grid-cols-2 items-center bg-(--soft-black) rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/5">

        {/* IMAGE SIDE */}
        <Link
          to={`/product/${product.slug}`}
          className="relative group overflow-hidden rounded-2xl aspect-square lg:aspect-[7/5]"
        >
          {onSale && (
            <span className="absolute top-4 left-4 z-10 rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase text-white shadow-lg">
              Sale
            </span>
          )}

          {heroImage && (
            <img
              src={heroImage}
              alt={product.name}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
            />
          )}

          {/* DARK OVERLAY FOR PREMIUM LOOK */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </Link>

        {/* CONTENT SIDE */}
        <div className="flex flex-col justify-center">

          <span className="text-xs uppercase tracking-[0.2em] text-(--oat)">
            {categoryName}
          </span>

          <h3 className="mt-2 text-4xl sm:text-5xl font-extrabold leading-tight text-(--cream)">
            {product.name}
          </h3>

          {weightLine ? (
            <p className="mt-2 text-sm text-(--oat)">Net weight: {weightLine}</p>
          ) : null}

          {blurb && (
            <p className="mt-5 text-sm sm:text-base leading-relaxed text-(--oat)">
              {blurb}
            </p>
          )}

          {/* PRICE BLOCK */}
          <div className="mt-8 flex items-end gap-4">
            {onSale && (
              <span className="text-base line-through text-(--oat)">
                {formatPrice(product.compareAtPrice, product.currency)}
              </span>
            )}
            <span className="text-4xl font-bold text-(--gold)">
              {formatPrice(product.price, product.currency)}
            </span>
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to={`/product/${product.slug}`}
              className="inline-flex items-center justify-center rounded-xl bg-(--gold) px-7 py-3 text-sm font-semibold text-(--on-primary) transition hover:bg-(--gold-dark) shadow-lg"
            >
              View Product
            </Link>

            <Link
              to="/shop"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 px-7 py-3 text-sm font-medium text-(--cream) hover:bg-white/5 transition"
            >
              Explore More
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}

export default FeaturedProductHighlight;