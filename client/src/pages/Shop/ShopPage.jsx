import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { buildCheckoutLineFromProduct } from "../../utils/checkoutNavigation.js";
import { useShopCatalog } from "./hooks/useShopCatalog.js";
import { formatProductWeightGrams } from "../../utils/productWeight.js";
import ShopPriceRangeBar from "./components/ShopPriceRangeBar.jsx";
import { shopSortOptions, useShopFilters } from "./hooks/useShopFilters.js";

const fieldBase =
  "w-full rounded-lg border border-(--brown)/40 bg-(--black) py-2.5 pl-3 text-sm text-(--ink) shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] placeholder:text-(--gray) focus:border-(--gold) focus:outline-none focus:ring-2 focus:ring-(--gold)/25";

const selectField = `${fieldBase} pr-9 [&>option]:bg-(--card) [&>option]:text-(--ink)`;
const inputField = `${fieldBase} pr-3`;

function formatMoney(currency, price) {
  const c = currency || "PKR";
  const n = Number(price);
  if (!Number.isFinite(n)) return `${c} —`;
  return `${c} ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function ShopProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const imageSrc = product.images?.[0] ?? "";

  function buyNow() {
    navigate("/checkout", {
      state: { checkoutItems: [buildCheckoutLineFromProduct(product, 1)] },
    });
  }

  const tags = product.tags ?? ["Premium"];
  const onSale = product.compareAtPrice != null;
  const weightLine = formatProductWeightGrams(product.weightGrams);

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <Link
          to={`/product/${product.slug}`}
          className="block aspect-4/3 overflow-hidden bg-linear-to-br from-[#f5d78e] via-[#d4af37] to-[#8c6b1f]"
        >
          <img
            src={imageSrc}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain p-3 transform-gpu transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.09] group-hover:-translate-y-1 group-hover:brightness-110"
          />
        </Link>

        {onSale ? (
          <span className="absolute left-2 top-2 z-10 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
            Sale
          </span>
        ) : null}

        <button
          type="button"
          onClick={() => setWishlisted((v) => !v)}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-(--black)/50 text-(--ink) backdrop-blur-sm"
        >
          <FiHeart
            size={16}
            className={wishlisted ? "fill-rose-500 text-rose-500" : "text-(--ink)"}
          />
        </button>
      </div>

      <div className="space-y-2 p-3 text-[#18181b]">
        <Link
          to={`/product/${product.slug}`}
          className="block text-[#18181b] no-underline transition hover:text-[#5c4d80]"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="line-clamp-1 min-w-0 flex-1 text-sm font-semibold text-inherit">{product.name}</h2>
            {product.weightGrams != null ? (
              <span className="shrink-0 rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#52525b]">
                {Math.round(product.weightGrams)} g
              </span>
            ) : null}
          </div>
        </Link>

        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-baseline gap-2">
            {onSale ? (
              <span className="text-sm font-medium text-[#71717a] line-through">
                {formatMoney(product.currency, product.compareAtPrice)}
              </span>
            ) : null}
            <span className="text-base font-bold text-[#18181b]!">
              {formatMoney(product.currency, product.price)}
            </span>
          </div>
          <span className="shrink-0 text-xs text-[#71717a]!">★ {product.rating}</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#52525b]!"
            >
              {tag}
            </span>
          ))}
        </div>

        {weightLine ? (
          <p className="text-xs font-medium text-[#52525b]">Net weight: {weightLine}</p>
        ) : null}

        <div className="line-clamp-2 text-xs leading-relaxed text-[#52525b]!" role="note">
          {product.description}
        </div>

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={() => addToCart(product, 1)}
            className="min-h-10 flex-1 rounded-lg bg-(--gold) px-2 py-2.5 text-xs font-semibold text-(--on-primary)! transition hover:bg-(--gold-dark)"
          >
            Add to cart
          </button>

          <button
            type="button"
            onClick={buyNow}
            className="min-h-10 flex-[1.5] rounded-lg border-2 border-zinc-400 bg-transparent px-2 py-2.5 text-xs font-semibold text-[#18181b] transition hover:border-[#d4af37] hover:bg-[#d4af37]/12"
          >
            Buy now
          </button>
        </div>
      </div>
    </article>
  );
}

function ShopPage() {
  const { catalog, loading, fetchError } = useShopCatalog();
  const {
    q,
    categoryId,
    sort,
    minPrice,
    maxPrice,
    priceBounds,
    mergeParams,
    clearFilters,
    displayedCards,
    shopCategories,
  } = useShopFilters(catalog);

  function handlePriceRangeChange(nextMin, nextMax) {
    const lo = priceBounds.min;
    const hi = priceBounds.max;
    if (nextMin <= lo && nextMax >= hi) {
      mergeParams({ min: undefined, max: undefined });
    } else {
      mergeParams({ min: nextMin, max: nextMax });
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
      <header className="flex h-[30vh] flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold text-(--white) sm:text-5xl">Shop</h1>
        <p className="text-description mt-3 max-w-2xl text-sm text-(--oat)">
          Explore fresh groceries, deals, and essentials — all in one place.
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="hidden flex-1 sm:block" />
        <input
          type="search"
          value={q}
          onChange={(e) =>
            mergeParams({ q: e.target.value ? e.target.value : undefined })
          }
          placeholder="Search products..."
          className={`${inputField} w-full rounded-xl sm:w-80`}
        />
      </div>

      {fetchError ? (
        <p
          className="mt-6 rounded-lg border border-red-500/35 bg-red-500/10 px-4 py-3 text-center text-sm text-red-800"
          role="alert"
        >
          {fetchError}
        </p>
      ) : null}

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="sticky top-20 space-y-6 rounded-2xl border border-(--brown)/40 bg-(--card)/70 p-5 backdrop-blur-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-(--gold-light)">
              Filters
            </h2>

            <div>
              <label className="mb-2 block text-xs text-(--gray-light)">Category</label>
              <select
                value={categoryId}
                onChange={(e) =>
                  mergeParams({ category: e.target.value || undefined })
                }
                className={selectField}
              >
                <option value="">All categories</option>
                {shopCategories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs text-(--gray-light)">Price range</label>
              <ShopPriceRangeBar
                lo={priceBounds.min}
                hi={priceBounds.max}
                minVal={minPrice}
                maxVal={maxPrice}
                onRangeChange={handlePriceRangeChange}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs text-(--gray-light)">Sort</label>
              <select
                value={sort}
                onChange={(e) => mergeParams({ sort: e.target.value })}
                className={selectField}
              >
                {shopSortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="w-full text-sm text-(--gold-light) hover:text-(--gold)"
            >
              Clear filters
            </button>
          </div>
        </aside>

        <main className="lg:col-span-9">
          {!loading ? (
            <p className="mb-4 text-sm text-(--gray-light)">{displayedCards.length} products</p>
          ) : null}

          {loading ? (
            <p className="py-16 text-center text-sm text-(--oat)" aria-live="polite">
              Loading catalog…
            </p>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {displayedCards.map((p) => (
                  <ShopProductCard key={p.id} product={p} />
                ))}
              </div>

              {!fetchError && displayedCards.length === 0 ? (
                <p className="mt-10 text-center text-(--oat)">No products match your filters.</p>
              ) : null}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default ShopPage;
