import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiMinus, FiPlus, FiShoppingBag, FiX } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { formatProductWeightGrams } from "../utils/productWeight.js";

function CartDrawer() {
  const {
    items,
    subtotal,
    cartDrawerOpen,
    closeCartDrawer,
    setItemQuantity,
    removeFromCart,
  } = useCart();

  useEffect(() => {
    if (!cartDrawerOpen) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    function onKey(e) {
      if (e.key === "Escape") closeCartDrawer();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [cartDrawerOpen, closeCartDrawer]);

  useEffect(() => {
    if (cartDrawerOpen && items.length === 0) {
      closeCartDrawer();
    }
  }, [cartDrawerOpen, items.length, closeCartDrawer]);

  const portal =
    typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence>
            {cartDrawerOpen && items.length > 0 ? (
              <>
                <motion.button
                  type="button"
                  aria-label="Close cart overlay"
                  className="fixed inset-0 z-[260] touch-none bg-(--black)/65 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={closeCartDrawer}
                />

                <motion.aside
                  className="fixed right-0 top-0 z-[270] flex h-dvh max-h-dvh w-full max-w-md flex-col border-l border-(--brown)/80 bg-(--soft-black) shadow-[-12px_0_48px_rgba(0,0,0,0.45)]"
                  style={{
                    overscrollBehavior: "contain",
                    paddingTop: "max(0.75rem, env(safe-area-inset-top))",
                    paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0))",
                  }}
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 320 }}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="cart-drawer-title"
                >
                  <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 pb-3 pt-1 sm:px-5">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-(--gold-light)">
                        Your bag
                      </p>
                      <h2 id="cart-drawer-title" className="text-lg font-bold text-(--white)">
                        {items.reduce((n, i) => n + i.quantity, 0)} items
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={closeCartDrawer}
                      className="rounded-lg border border-(--oat) p-2.5 text-(--cream) transition hover:border-(--gold-light) hover:text-(--gold-light)"
                      aria-label="Close cart"
                    >
                      <FiX size={20} />
                    </button>
                  </div>

                  <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
                    {items.map((item) => {
                      const lineTotal = item.price * item.quantity;
                      const weightLine = formatProductWeightGrams(item.weightGrams);
                      return (
                        <li
                          key={item.productId}
                          className="flex gap-3 rounded-xl border border-white/10 bg-(--black)/40 p-3"
                        >
                          <Link
                            to={`/product/${item.slug}`}
                            onClick={closeCartDrawer}
                            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-(--black)"
                          >
                            {item.image ? (
                              <img src={item.image} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="flex h-full items-center justify-center text-[10px] text-(--gray)">
                                —
                              </span>
                            )}
                          </Link>
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/product/${item.slug}`}
                              onClick={closeCartDrawer}
                              className="line-clamp-2 text-sm font-semibold text-(--cream) transition hover:text-(--gold-light)"
                            >
                              {item.name}
                            </Link>
                            {weightLine ? (
                              <p className="mt-0.5 text-[11px] text-(--gray)">Net weight: {weightLine}</p>
                            ) : null}
                            <p className="mt-0.5 text-xs text-(--gray-light)">
                              Rs {item.price} × {item.quantity}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex items-center rounded-md border border-(--brown) bg-(--black)/50 p-0.5">
                                <button
                                  type="button"
                                  aria-label="Decrease quantity"
                                  disabled={item.quantity <= 1}
                                  onClick={() => setItemQuantity(item.productId, item.quantity - 1)}
                                  className="flex h-7 w-7 items-center justify-center rounded text-(--cream) transition enabled:hover:bg-(--gold)/15 disabled:opacity-35"
                                >
                                  <FiMinus size={14} aria-hidden />
                                </button>
                                <span className="min-w-7 text-center text-xs font-semibold tabular-nums text-(--white)">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  aria-label="Increase quantity"
                                  onClick={() => setItemQuantity(item.productId, item.quantity + 1)}
                                  className="flex h-7 w-7 items-center justify-center rounded text-(--cream) transition hover:bg-(--gold)/15"
                                >
                                  <FiPlus size={14} aria-hidden />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.productId)}
                                className="text-xs text-(--gray) underline-offset-2 hover:text-red-300 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          <p className="shrink-0 self-start pt-0.5 text-sm font-bold tabular-nums text-(--gold)">
                            Rs {lineTotal}
                          </p>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="shrink-0 border-t border-white/10 bg-(--soft-black) px-4 pb-2 pt-4 sm:px-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-(--gray-light)">Subtotal</span>
                      <span className="text-xl font-bold tabular-nums text-(--gold)">Rs {subtotal}</span>
                    </div>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Link
                        to="/cart"
                        onClick={closeCartDrawer}
                        className="flex flex-1 items-center justify-center rounded-xl border border-(--brown) py-3 text-sm font-semibold text-(--cream) transition hover:border-(--gold-light) hover:bg-(--black)/40"
                      >
                        View cart
                      </Link>
                      <Link
                        to="/checkout"
                        onClick={closeCartDrawer}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-(--gold) py-3 text-sm font-semibold text-(--on-primary) transition hover:bg-(--gold-dark)"
                      >
                        <FiShoppingBag className="h-4 w-4" aria-hidden />
                        Checkout
                      </Link>
                    </div>
                  </div>
                </motion.aside>
              </>
            ) : null}
          </AnimatePresence>,
          document.body
        )
      : null;

  return portal;
}

export default CartDrawer;
