import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiMinus, FiPlus, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { formatProductWeightGrams } from "../../utils/productWeight.js";
import { validateCart } from "./services/Api.js";

function CartPage() {
  const { items, subtotal, setItemQuantity, removeFromCart, mergeValidatedLines } = useCart();
  const [cartSyncError, setCartSyncError] = useState("");

  useEffect(() => {
    if (items.length === 0) {
      setCartSyncError("");
      return;
    }
    const payload = items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    }));
    let cancelled = false;
    validateCart(payload)
      .then((data) => {
        if (cancelled) return;
        setCartSyncError("");
        if (Array.isArray(data?.items)) mergeValidatedLines(data.items);
      })
      .catch((err) => {
        if (!cancelled) {
          setCartSyncError(
            err?.response?.data?.message ??
              err?.message ??
              "Could not verify cart with the server."
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [items, mergeValidatedLines]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-(--brown) bg-(--soft-black) text-(--gold)">
          <FiShoppingCart size={28} strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-(--white) sm:text-3xl">
          Your cart is empty
        </h1>
        <p className="mt-4 text-sm text-(--gray-light) sm:text-base">
          Add items from the shop to see them here. You can change quantities or remove lines anytime.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex rounded-lg bg-(--gold) px-6 py-3 text-sm font-semibold text-(--on-primary) transition hover:bg-(--gold-dark)"
        >
          Browse shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
      {cartSyncError ? (
        <p className="mb-6 rounded-lg border border-amber-500/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-100" role="alert">
          {cartSyncError}
        </p>
      ) : null}

      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--gold-light)">Cart</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-(--white) sm:text-4xl">
            Selected items
          </h1>
          <p className="mt-2 text-sm text-(--gray-light)">
            Update quantities or remove products. Subtotal updates automatically.
          </p>
        </div>
        <Link
          to="/shop"
          className="text-sm font-medium text-(--gold-light) transition hover:text-(--gold)"
        >
          Continue shopping
        </Link>
      </div>

      <ul className="space-y-4">
        {items.map((item) => {
          const lineTotal = item.price * item.quantity;
          const weightLine = formatProductWeightGrams(item.weightGrams);
          return (
            <li
              key={item.productId}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-(--soft-black)/80 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5"
            >
              <Link
                to={`/product/${item.slug}`}
                className="flex shrink-0 items-center gap-4 sm:w-auto"
              >
                <div className="h-20 w-20 overflow-hidden rounded-xl border border-white/10 bg-(--black) sm:h-24 sm:w-24">
                  {item.image ? (
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-(--gray)">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0 sm:hidden">
                  <p className="font-semibold text-(--cream)">{item.name}</p>
                  {weightLine ? (
                    <p className="mt-0.5 text-xs text-(--gray)">Net weight: {weightLine}</p>
                  ) : null}
                  <p className="mt-1 text-sm text-(--gold)">Rs {item.price} each</p>
                </div>
              </Link>

              <div className="min-w-0 flex-1 max-sm:hidden">
                <Link
                  to={`/product/${item.slug}`}
                  className="font-semibold text-(--cream) transition hover:text-(--gold-light)"
                >
                  {item.name}
                </Link>
                {weightLine ? (
                  <p className="mt-0.5 text-xs text-(--gray)">Net weight: {weightLine}</p>
                ) : null}
                <p className="mt-1 text-sm text-(--gray-light)">Rs {item.price} each</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
                <div className="flex items-center gap-1 rounded-lg border border-(--brown) bg-(--black)/50 p-1">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={item.quantity <= 1}
                    onClick={() => setItemQuantity(item.productId, item.quantity - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-md text-(--cream) transition enabled:hover:bg-(--gold)/15 enabled:hover:text-(--gold-light) disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <FiMinus size={18} />
                  </button>
                  <span className="min-w-10 text-center text-sm font-semibold tabular-nums text-(--white)">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setItemQuantity(item.productId, item.quantity + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-md text-(--cream) transition hover:bg-(--gold)/15 hover:text-(--gold-light)"
                  >
                    <FiPlus size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-6">
                  <p className="text-right">
                    <span className="block text-xs uppercase tracking-wide text-(--gray)">Line total</span>
                    <span className="text-lg font-bold tabular-nums text-(--gold)">Rs {lineTotal}</span>
                  </p>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name} from cart`}
                    onClick={() => removeFromCart(item.productId)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-(--gray-light) transition hover:border-red-500/50 hover:bg-red-950/30 hover:text-red-300"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 rounded-2xl border border-(--brown)/60 bg-(--black)/40 px-6 py-6 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <span className="text-sm font-medium uppercase tracking-wide text-(--gray-light)">Subtotal</span>
          <span className="text-2xl font-bold tabular-nums text-(--gold) sm:text-3xl">Rs {subtotal}</span>
        </div>
        <p className="mt-4 text-xs text-(--gray)">
          Shipping and payment are confirmed on the next step. Demo checkout — no real charges.
        </p>
        <Link
          to="/checkout"
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-(--gold) py-3.5 text-sm font-semibold text-(--on-primary) transition hover:bg-(--gold-dark) sm:w-auto sm:px-10"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}

export default CartPage;
