import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { FiCheck, FiPackage, FiShoppingBag } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { createOrder } from "./services/Api.js";
import { formatProductWeightGrams } from "../../utils/productWeight.js";
import { checkoutItemsFromState } from "../../utils/checkoutNavigation.js";

const inputClass =
  "w-full rounded-lg border border-(--brown) bg-(--black)/40 px-4 py-3 text-sm text-(--cream) placeholder:text-(--gray) focus:border-(--gold) focus:outline-none";

const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-(--gray-light)";

function CheckoutPage() {
  const location = useLocation();
  const { items, clearCart } = useCart();

  /** Buy now: lines from `navigate("/checkout", { state: { checkoutItems } })` — not merged into cart. */
  const checkoutLines = useMemo(() => {
    const fromState = checkoutItemsFromState(location.state);
    return fromState.length > 0 ? fromState : items;
  }, [location.state, items]);

  const checkoutSubtotal = useMemo(
    () => checkoutLines.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [checkoutLines]
  );

  const isBuyNowCheckout = useMemo(
    () => checkoutItemsFromState(location.state).length > 0,
    [location.state]
  );
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [errors, setErrors] = useState({});
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Pakistan",
  });

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Required";
    if (!form.phone.trim()) next.phone = "Required";
    if (!form.addressLine1.trim()) next.addressLine1 = "Required";
    if (!form.city.trim()) next.city = "Required";
    if (!form.state.trim()) next.state = "Required";
    if (!form.postalCode.trim()) next.postalCode = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  useEffect(() => {
    if (!submittedOrder) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [submittedOrder]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError("");
    setSubmitting(true);
    try {
      const fromState = checkoutItemsFromState(location.state);
      const lines = fromState.length > 0 ? fromState : items;

      const { order } = await createOrder({
        items: lines.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shipping: form,
        paymentMethod,
      });
      setSubmittedOrder(order);
      if (fromState.length === 0) {
        clearCart();
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Could not place order. Try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedOrder) {
    const addr = submittedOrder.shipping;
    const cur = submittedOrder.currency || "PKR";
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6">
        <div className="absolute inset-0 bg-(--black)/70 backdrop-blur-md" aria-hidden />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-confirmed-title"
          className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-(--gold)/25 bg-linear-to-b from-(--soft-black) to-(--black) shadow-[0_0_0_1px_rgba(212,175,55,0.08),0_24px_80px_-12px_rgba(0,0,0,0.75)]"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--gold)/50 to-transparent" />

          <div className="overflow-y-auto overscroll-contain px-6 pb-6 pt-8 sm:px-8 sm:pb-8 sm:pt-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-(--gold)/15 ring-1 ring-(--gold)/30 ring-offset-4 ring-offset-(--black)">
              <FiCheck className="h-10 w-10 text-(--gold)" strokeWidth={2.5} aria-hidden />
            </div>

            <p className="mt-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-(--gold-light)">
              Success
            </p>
            <h1
              id="order-confirmed-title"
              className="mt-2 text-center text-2xl font-bold tracking-tight text-(--white) sm:text-3xl"
            >
              Order confirmed
            </h1>
            {submittedOrder.orderNumber ? (
              <p className="mt-3 text-center font-mono text-sm text-(--gold)">{submittedOrder.orderNumber}</p>
            ) : null}
            <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-relaxed text-(--gray-light)">
              Thanks, {addr.fullName}. Your order is confirmed for cash on delivery. Pay the rider when your
              package arrives.
            </p>

            <div className="mt-8 rounded-xl border border-white/10 bg-(--black)/50 p-5 text-left text-sm sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-(--gold-light)">Deliver to</p>
              <p className="mt-2 leading-relaxed text-(--cream)">
                {addr.fullName}
                <br />
                {addr.addressLine1}
                {addr.addressLine2 ? (
                  <>
                    <br />
                    {addr.addressLine2}
                  </>
                ) : null}
                <br />
                {addr.city}, {addr.state} {addr.postalCode}
                <br />
                {addr.country}
                <br />
                <span className="text-(--gray-light)">{addr.phone}</span>
                {addr.email ? (
                  <>
                    <br />
                    <span className="text-(--gray-light)">{addr.email}</span>
                  </>
                ) : null}
              </p>

              <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-(--gold-light)">Items</p>
              <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto pr-1 text-(--gray-light)">
                {submittedOrder.items.map((i) => (
                  <li key={`${i.productId}-${i.slug}`} className="flex justify-between gap-3 text-xs sm:text-sm">
                    <span className="min-w-0 truncate text-left text-(--cream)">
                      {i.name} <span className="text-(--gray)">×{i.quantity}</span>
                    </span>
                    <span className="shrink-0 tabular-nums text-(--cream)">
                      {cur}{" "}
                      {(i.lineTotal ?? i.price * i.quantity).toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                <span className="text-(--gray-light)">COD total</span>
                <span className="text-lg font-bold tabular-nums text-(--gold)">
                  {cur}{" "}
                  {submittedOrder.subtotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            <Link
              to="/shop"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-(--gold) py-3.5 text-sm font-semibold text-(--on-primary) transition hover:bg-(--gold-dark)"
            >
              <FiShoppingBag className="h-4 w-4" aria-hidden />
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (checkoutLines.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <nav className="text-sm text-(--gray)">
        <Link to="/" className="transition hover:text-(--gold-light)">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/cart" className="transition hover:text-(--gold-light)">
          Cart
        </Link>
        <span className="mx-2">/</span>
        <span className="text-(--cream)">Checkout</span>
      </nav>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-(--white) sm:text-4xl">Checkout</h1>
      <p className="mt-2 text-sm text-(--gray-light)">
        {isBuyNowCheckout
          ? "You’re checking out this item directly. Your saved cart is unchanged."
          : "Enter your shipping details and confirm with cash on delivery."}
      </p>

      {submitError ? (
        <p className="mt-6 rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100" role="alert">
          {submitError}
        </p>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start"
      >
        <div className="space-y-10">
          <section className="rounded-2xl border border-white/10 bg-(--soft-black)/60 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-(--white)">Shipping address</h2>
            <p className="mt-1 text-xs text-(--gray)">We will use this for delivery updates.</p>

            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="co-fullName" className={labelClass}>
                  Full name
                </label>
                <input
                  id="co-fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className={inputClass}
                  autoComplete="name"
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="co-phone" className={labelClass}>
                    Phone
                  </label>
                  <input
                    id="co-phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={inputClass}
                    autoComplete="tel"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="co-email" className={labelClass}>
                    Email <span className="normal-case text-(--gray)">(optional)</span>
                  </label>
                  <input
                    id="co-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={inputClass}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="co-line1" className={labelClass}>
                  Address line 1
                </label>
                <input
                  id="co-line1"
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={(e) => updateField("addressLine1", e.target.value)}
                  className={inputClass}
                  autoComplete="address-line1"
                />
                {errors.addressLine1 && <p className="mt-1 text-xs text-red-400">{errors.addressLine1}</p>}
              </div>

              <div>
                <label htmlFor="co-line2" className={labelClass}>
                  Address line 2 <span className="normal-case text-(--gray)">(optional)</span>
                </label>
                <input
                  id="co-line2"
                  name="addressLine2"
                  value={form.addressLine2}
                  onChange={(e) => updateField("addressLine2", e.target.value)}
                  className={inputClass}
                  autoComplete="address-line2"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="co-city" className={labelClass}>
                    City
                  </label>
                  <input
                    id="co-city"
                    name="city"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className={inputClass}
                    autoComplete="address-level2"
                  />
                  {errors.city && <p className="mt-1 text-xs text-red-400">{errors.city}</p>}
                </div>
                <div>
                  <label htmlFor="co-state" className={labelClass}>
                    State / province
                  </label>
                  <input
                    id="co-state"
                    name="state"
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    className={inputClass}
                    autoComplete="address-level1"
                  />
                  {errors.state && <p className="mt-1 text-xs text-red-400">{errors.state}</p>}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="co-postal" className={labelClass}>
                    Postal code
                  </label>
                  <input
                    id="co-postal"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={(e) => updateField("postalCode", e.target.value)}
                    className={inputClass}
                    autoComplete="postal-code"
                  />
                  {errors.postalCode && <p className="mt-1 text-xs text-red-400">{errors.postalCode}</p>}
                </div>
                <div>
                  <label htmlFor="co-country" className={labelClass}>
                    Country
                  </label>
                  <input
                    id="co-country"
                    name="country"
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    className={inputClass}
                    autoComplete="country-name"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-(--soft-black)/60 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-(--white)">Payment method</h2>
            <p className="mt-1 text-xs text-(--gray)">More options will be added later.</p>

            <fieldset className="mt-6 space-y-3">
              <legend className="sr-only">Payment method</legend>
              <label
                className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${
                  paymentMethod === "cod"
                    ? "border-(--gold) bg-(--gold)/10"
                    : "border-white/10 hover:border-(--brown)"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-1 accent-(--gold)"
                />
                <span>
                  <span className="block font-medium text-(--cream)">Cash on delivery (COD)</span>
                  <span className="mt-1 block text-xs text-(--gray-light)">
                    Pay with cash when your order arrives. Our rider will confirm the amount.
                  </span>
                </span>
              </label>
            </fieldset>
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-(--gold) py-3.5 text-sm font-semibold text-(--on-primary) transition hover:bg-(--gold-dark) disabled:opacity-60 lg:hidden"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-(--brown)/60 bg-(--black)/40 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-(--gold-light)">
              <FiPackage size={20} />
              <h2 className="text-sm font-semibold uppercase tracking-wide">Order summary</h2>
            </div>

            <ul className="mt-6 max-h-64 space-y-4 overflow-y-auto pr-1">
              {checkoutLines.map((item) => {
                const weightLine = formatProductWeightGrams(item.weightGrams);
                return (
                <li key={item.productId} className="flex gap-3 text-sm">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-(--soft-black)">
                    {item.image ? (
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-snug text-(--cream) line-clamp-2">{item.name}</p>
                    {weightLine ? (
                      <p className="mt-0.5 text-[11px] text-(--gray)">Net weight: {weightLine}</p>
                    ) : null}
                    <p className="mt-0.5 text-xs text-(--gray)">
                      Rs {item.price} × {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums text-(--gold)">
                    Rs {item.price * item.quantity}
                  </p>
                </li>
              );
              })}
            </ul>

            <div className="mt-6 space-y-2 border-t border-white/10 pt-6 text-sm">
              <div className="flex justify-between text-(--gray-light)">
                <span>Subtotal</span>
                <span className="tabular-nums text-(--cream)">Rs {checkoutSubtotal}</span>
              </div>
              <div className="flex justify-between text-(--gray-light)">
                <span>Shipping</span>
                <span className="text-(--gray)">At dispatch</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-4 text-base font-bold">
                <span className="text-(--white)">Total</span>
                <span className="tabular-nums text-(--gold)">Rs {checkoutSubtotal}</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-(--gray)">COD total due on delivery matches the order total above.</p>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 hidden w-full rounded-lg bg-(--gold) py-3.5 text-sm font-semibold text-(--on-primary) transition hover:bg-(--gold-dark) disabled:opacity-60 lg:block"
            >
              {submitting ? "Placing order…" : "Place order"}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}

export default CheckoutPage;
