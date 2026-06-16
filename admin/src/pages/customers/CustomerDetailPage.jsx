import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiUser } from "react-icons/fi";
import { getAdminCustomer } from "./services/customerApi.js";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function formatMoney(currency, amount) {
  const c = currency || "PKR";
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return `${c} ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
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

function CustomerDetailPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const data = await getAdminCustomer(customerId);
        if (!cancelled) {
          setCustomer(data.customer ?? null);
          setOrders(Array.isArray(data.orders) ? data.orders : []);
        }
      } catch (err) {
        if (!cancelled) {
          setCustomer(null);
          setOrders([]);
          setError(
            err?.response?.data?.message ?? err?.message ?? "Could not load customer."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-400"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to customers
        </Link>
        <p className="text-sm text-zinc-500">Loading customer…</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-400"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to customers
        </Link>
        <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200" role="alert">
          {error || "Customer not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link
        to="/customers"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-400"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back to customers
      </Link>

      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-amber-500/90">
          <FiUser className="h-7 w-7" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500/90">Customer</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
            {customer.fullName || "—"}
          </h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-400">
            <span>{customer.phone || "—"}</span>
            {customer.email ? <span>{customer.email}</span> : null}
          </div>
          <p className="mt-2 text-xs text-zinc-600">
            First order {formatDate(customer.firstOrderAt)} · Last order {formatDate(customer.lastOrderAt)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-center">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Total orders</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-amber-400">{customer.orderCount ?? 0}</p>
        </div>
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Orders from checkout</h2>
        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No linked orders (legacy data may lack customer link).</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="py-3 pr-4 font-medium">Order</th>
                  <th className="py-3 px-4 font-medium">Placed</th>
                  <th className="py-3 px-4 font-medium text-right">Items</th>
                  <th className="py-3 px-4 font-medium text-right">Total</th>
                  <th className="py-3 pl-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {orders.map((row) => (
                  <tr
                    key={row.id}
                    role="link"
                    tabIndex={0}
                    className="cursor-pointer outline-none hover:bg-zinc-800/40 focus-visible:bg-zinc-800/40"
                    onClick={() => navigate(`/orders/${row.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/orders/${row.id}`);
                      }
                    }}
                  >
                    <td className="py-3 pr-4 font-mono text-xs text-amber-400/90">{row.orderNumber}</td>
                    <td className="whitespace-nowrap py-3 px-4 text-xs text-zinc-500">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-zinc-400">
                      {row.itemCount ?? 0}
                      <span className="text-zinc-600"> ({row.lineCount ?? 0})</span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-amber-400/90">
                      {formatMoney(row.currency, row.subtotal)}
                    </td>
                    <td className="py-3 pl-4">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs capitalize ${statusClass(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default CustomerDetailPage;
