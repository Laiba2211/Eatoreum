import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

export const CART_STORAGE_KEY = "eatoreum_cart_items";

function normWeightGrams(w) {
  if (w == null || w === "") return null;
  const n = Number(w);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function readStoredCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((row) => row && row.productId != null)
      .map((row) => ({
        productId: String(row.productId),
        slug: String(row.slug ?? ""),
        name: String(row.name ?? ""),
        price: Number(row.price) || 0,
        image: String(row.image ?? ""),
        quantity: Math.max(1, Math.floor(Number(row.quantity)) || 1),
        currency: row.currency ? String(row.currency).toUpperCase().slice(0, 3) : "PKR",
        weightGrams: normWeightGrams(row.weightGrams),
      }));
  } catch {
    return [];
  }
}

function cartsEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const x = a[i];
    const y = b[i];
    if (
      String(x.productId) !== String(y.productId) ||
      x.quantity !== y.quantity ||
      x.price !== y.price ||
      x.name !== y.name ||
      x.slug !== y.slug ||
      x.image !== y.image ||
      (x.currency || "PKR") !== (y.currency || "PKR") ||
      normWeightGrams(x.weightGrams) !== normWeightGrams(y.weightGrams)
    ) {
      return false;
    }
  }
  return true;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStoredCart());
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const openCartDrawer = useCallback(() => setCartDrawerOpen(true), []);
  const closeCartDrawer = useCallback(() => setCartDrawerOpen(false), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (items.length === 0) {
        localStorage.removeItem(CART_STORAGE_KEY);
      } else {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      }
    } catch {
      /* private mode / quota */
    }
  }, [items]);

  /**
   * @param {object} product
   * @param {number} [quantity]
   * @param {{ showDrawer?: boolean }} [opts] — pass `{ showDrawer: false }` to add without opening the mini-cart drawer.
   */
  const addToCart = useCallback((product, quantity = 1, opts) => {
    const showDrawer = opts?.showDrawer !== false;
    const pid = String(product.id);
    const currency = (product.currency || "PKR").toString().toUpperCase().slice(0, 3);
    setItems((prev) => {
      const existing = prev.find((i) => String(i.productId) === pid);
      if (existing) {
        return prev.map((i) =>
          String(i.productId) === pid ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      const weightGrams = normWeightGrams(product.weightGrams);
      return [
        ...prev,
        {
          productId: pid,
          slug: product.slug ?? "",
          name: product.name ?? "",
          price: Number(product.price) || 0,
          image: product.images?.[0] ?? product.mainImage ?? "",
          currency,
          quantity,
          weightGrams,
        },
      ];
    });
    if (showDrawer) setCartDrawerOpen(true);
  }, []);

  const removeFromCart = useCallback((productId) => {
    const id = String(productId);
    setItems((prev) => prev.filter((i) => String(i.productId) !== id));
  }, []);

  const setItemQuantity = useCallback((productId, quantity) => {
    const id = String(productId);
    const q = Math.floor(Number(quantity));
    if (!Number.isFinite(q) || q < 1) {
      setItems((prev) => prev.filter((i) => String(i.productId) !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (String(i.productId) === id ? { ...i, quantity: q } : i))
    );
  }, []);

  /** Merge name/price/image from POST /api/cart/validate without triggering needless updates. */
  const mergeValidatedLines = useCallback((validatedLines) => {
    if (!Array.isArray(validatedLines) || validatedLines.length === 0) return;
    setItems((prev) => {
      const byId = new Map(validatedLines.map((l) => [String(l.productId), l]));
      const next = prev.map((row) => {
        const v = byId.get(String(row.productId));
        if (!v) return row;
        const wg = normWeightGrams(v.weightGrams ?? row.weightGrams);
        return {
          ...row,
          name: v.name ?? row.name,
          slug: v.slug ?? row.slug,
          price: typeof v.price === "number" ? v.price : Number(v.price) || row.price,
          image: v.image || row.image,
          weightGrams: wg,
        };
      });
      return cartsEqual(prev, next) ? prev : next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCartDrawerOpen(false);
  }, []);

  const cartCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addToCart,
      cartCount,
      subtotal,
      setItemQuantity,
      removeFromCart,
      clearCart,
      mergeValidatedLines,
      cartDrawerOpen,
      openCartDrawer,
      closeCartDrawer,
    }),
    [
      items,
      addToCart,
      cartCount,
      subtotal,
      setItemQuantity,
      removeFromCart,
      clearCart,
      mergeValidatedLines,
      cartDrawerOpen,
      openCartDrawer,
      closeCartDrawer,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
