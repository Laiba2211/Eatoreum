import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiPackage } from "react-icons/fi";
import { getAdminOrder } from "./services/orderApi.js";
import { mediaUrl } from "../../utils/mediaUrl.js";

function formatMoney(currency, amount) {
  const c = currency || "PKR";
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return `${c} ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "full",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function statusClass(status) {
  switch (status) {
    case "delivered":
      return "bg-emerald-950/60 text-emerald-300";
    case "shipped":
      return "bg-sky-950/60 text-sky-300";
    case "confirmed":
      return "bg-amber-950/50 text-amber-200";
    case "cancelled":
      return "bg-red-950/40 text-red-300";
    default:
      return "bg-zinc-800 text-zinc-400";
  }
}

function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const { order: data } = await getAdminOrder(orderId);
        if (!cancelled) setOrder(data ?? null);
      } catch (err) {
        if (!cancelled) {
          setOrder(null);
          setError(
            err?.response?.data?.message ?? err?.message ?? "Could not load order."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-400"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>
        <p className="text-sm text-zinc-500">Loading order…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-400"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>
        <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200" role="alert">
          {error || "Order not found."}
        </p>
      </div>
    );
  }

  const s = order.shipping ?? {};
  const lines = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-400"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500/90">Order</p>
          <h1 className="mt-1 font-mono text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
            {order.orderNumber}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">Placed {formatDate(order.createdAt)}</p>
          {order.updatedAt && order.updatedAt !== order.createdAt ? (
            <p className="text-xs text-zinc-600">Updated {formatDate(order.updatedAt)}</p>
          ) : null}
        </div>
        <span
          className={`inline-flex shrink-0 rounded-full px-3 py-1 text-sm font-medium capitalize ${statusClass(order.status)}`}
        >
          {order.status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Shipping</h2>
          {order.customerId ? (
            <p className="mt-2 text-xs text-zinc-500">
              <Link
                to={`/customers/${order.customerId}`}
                className="text-amber-500/90 hover:text-amber-400 hover:underline"
              >
                View customer profile
              </Link>
            </p>
          ) : null}
          <div className="mt-4 space-y-1 text-sm text-zinc-200">
            <p className="font-medium text-zinc-50">{s.fullName}</p>
            <p className="text-zinc-400">{s.phone}</p>
            {s.email ? <p className="text-zinc-400">{s.email}</p> : null}
            <p className="mt-3 text-zinc-300">
              {s.addressLine1}
              {s.addressLine2 ? (
                <>
                  <br />
                  {s.addressLine2}
                </>
              ) : null}
              <br />
              {s.city}, {s.state} {s.postalCode}
              <br />
              {s.country}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Payment</h2>
          <p className="mt-4 text-sm text-zinc-200">
            {order.paymentMethod === "cod" ? "Cash on delivery (COD)" : order.paymentMethod}
          </p>
          <div className="mt-6 border-t border-zinc-800 pt-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Order total</p>
            <p className="mt-1 text-2xl font-bold text-amber-400">
              {formatMoney(order.currency, order.subtotal)}
            </p>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
        <div className="flex items-center gap-2 text-zinc-400">
          <FiPackage className="h-5 w-5 text-amber-500/80" aria-hidden />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Line items</h2>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="py-3 pr-4 font-medium">Product</th>
                <th className="py-3 px-4 font-medium text-right">Price</th>
                <th className="py-3 px-4 font-medium text-right">Qty</th>
                <th className="py-3 pl-4 text-right font-medium">Line</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {lines.map((line, idx) => (
                <tr key={`${line.productId}-${idx}`}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
                        {line.image ? (
                          <img
                            src={mediaUrl(line.image)}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-600">
                            —
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-100">{line.name}</p>
                        <p className="font-mono text-xs text-zinc-500">{line.slug}</p>
                        <p className="text-xs text-zinc-600">ID {line.productId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    {formatMoney(order.currency, line.price)}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">{line.quantity}</td>
                  <td className="py-3 pl-4 text-right font-medium tabular-nums text-amber-400/90">
                    {formatMoney(order.currency, line.lineTotal ?? line.price * line.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default OrderDetailPage;
