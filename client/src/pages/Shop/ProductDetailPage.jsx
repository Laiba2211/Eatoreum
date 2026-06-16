import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCategoryName, getProductBySlug } from "../../data/shopData";
import { useCart } from "../../context/CartContext";
import { formatProductWeightGrams } from "../../utils/productWeight.js";
import {
  fetchPublishedProduct,
  mapStoreProduct,
} from "./services/shopApi.js";
import ProductReviews from "./components/ProductReviews.jsx";
import { buildCheckoutLineFromProduct } from "../../utils/checkoutNavigation.js";

function formatMoney(currency, price) {
  const c = currency || "PKR";
  const n = Number(price);
  if (!Number.isFinite(n)) return `${c} —`;
  return `${c} ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartCount } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!slug) {
      setProduct(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setProduct(null);
    setActiveImage(0);
    setQty(1);

    (async () => {
      try {
        const raw = await fetchPublishedProduct(slug);
        if (cancelled) return;
        const mapped = mapStoreProduct(raw);
        setProduct({
          ...mapped,
          description:
            String(raw.description ?? "").trim() || mapped.description,
        });
      } catch {
        if (cancelled) return;
        const fallback = getProductBySlug(slug);
        setProduct(fallback ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    setActiveImage(0);
  }, [product?.id]);

  function handleAddToCart() {
    if (!product) return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    if (!product) return;
    navigate("/checkout", {
      state: {
        checkoutItems: [buildCheckoutLineFromProduct(product, qty)],
      },
    });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center text-(--gray)">
        Loading product…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl text-(--ink)">Product not found</h1>
        <p className="mt-2 text-sm text-(--gray)">
          This item may be unpublished or the link may be incorrect.
        </p>
        <Link to="/shop" className="mt-6 inline-block text-(--gold) hover:text-(--gold-light)">
          Back to shop
        </Link>
      </div>
    );
  }

  const categoryName =
    product.categoryLabel || getCategoryName(product.categoryId);
  const weightLine = formatProductWeightGrams(product.weightGrams);

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : ["https://picsum.photos/seed/eatoreum-pdp/600/600"];

  const safeIndex = Math.min(
    activeImage,
    Math.max(0, images.length - 1)
  );

  const onSale = product.compareAtPrice != null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-(--gray)">
        <Link to="/" className="transition hover:text-(--gold)">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="transition hover:text-(--gold)">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-(--ink)">{product.name}</span>
      </nav>

      {/* Main Layout */}
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border border-(--brown)/30 bg-(--card) p-4">
            {onSale && (
              <span className="absolute left-3 top-3 z-10 rounded-md bg-red-600 px-2 py-1 text-[10px] font-bold uppercase text-white">
                Sale
              </span>
            )}

            <div className="flex h-[280px] items-center justify-center">
              <img
                src={images[safeIndex]}
                alt=""
                className="max-h-full object-contain"
              />
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-14 w-14 overflow-hidden rounded-md border transition ${
                    i === safeIndex
                      ? "border-(--gold) opacity-100"
                      : "border-(--brown)/40 opacity-70 hover:border-(--gold)/50 hover:opacity-100"
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-xs font-medium uppercase text-(--gold)">{categoryName}</p>

          <h1 className="text-3xl sm:text-4xl text-(--ink) font-bold mt-2">
            {product.name}
          </h1>

          {weightLine && (
            <p className="mt-2 text-sm text-(--gray)">Net weight: {weightLine}</p>
          )}

          <div className="mt-4 flex items-center gap-3 flex-wrap">
            {onSale && (
              <span className="text-xs bg-red-600 px-2 py-1 font-bold uppercase text-white">
                Sale
              </span>
            )}

            {onSale && (
              <span className="line-through text-(--gray)">
                {formatMoney(product.currency, product.compareAtPrice)}
              </span>
            )}

            <span className="text-2xl font-bold text-(--gold)">
              {formatMoney(product.currency, product.price)}
            </span>

            <span className="text-sm text-(--gray)">★ {product.rating}</span>
          </div>

          <p className="mt-5 text-(--gray)">{product.description}</p>

          {/* ✅ FIXED MOBILE CONTROLS */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {/* Quantity */}
            <div className="flex w-full items-center justify-between rounded-lg border border-(--brown)/40 bg-(--card) sm:w-auto sm:justify-center">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-2 text-(--ink) transition hover:text-(--gold)"
              >
                −
              </button>

              <span className="px-4 text-(--ink)">{qty}</span>

              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="px-4 py-2 text-(--ink) transition hover:text-(--gold)"
              >
                +
              </button>
            </div>

            {/* Add to Cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full rounded-lg bg-(--gold) px-6 py-3 font-semibold text-(--on-primary) transition hover:bg-(--gold-dark) sm:w-auto"
            >
              {added ? "Added ✓" : "Add to Cart"}
            </button>

            {/* Buy Now */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full rounded-lg border-2 border-(--gold) px-6 py-3 font-semibold text-(--gold) transition hover:bg-(--gold)/10 sm:w-auto"
            >
              Buy Now
            </button>
          </div>

          <p className="mt-3 text-xs text-(--gray)">{cartCount} items in cart</p>
        </div>
      </div>

      {/* Reviews */}
      <ProductReviews productSlug={product.slug} />
    </div>
  );
}

export default ProductDetailPage;