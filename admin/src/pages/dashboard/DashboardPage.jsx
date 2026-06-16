import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPackage, FiRefreshCw, FiShoppingBag, FiUsers } from "react-icons/fi";
import { getAdminDashboard } from "./services/dashboardApi.js";

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
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function shortDayLabel(isoDate) {
  if (!isoDate) return "";
  try {
    return new Date(isoDate + "T12:00:00").toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoDate;
  }
}

const RECENT_ORDERS_DISPLAY = 5;

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

function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const json = await getAdminDashboard();
      setData(json);
    } catch (err) {
      setData(null);
      setError(err?.response?.data?.message ?? err?.message ?? "Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const ordersByDay = Array.isArray(data?.ordersByDay) ? data.ordersByDay : [];
  const maxDayCount = Math.max(1, ...ordersByDay.map((d) => d.count ?? 0));
  const recent = Array.isArray(data?.recentOrders)
    ? data.recentOrders.slice(0, RECENT_ORDERS_DISPLAY)
    : [];
  const byStatus = Array.isArray(data?.orders?.byStatus) ? data.orders.byStatus : [];
  const multiCurrency =
    Array.isArray(data?.revenue?.byCurrency) && data.revenue.byCurrency.length > 1;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Store analytics ·{" "}
            {data?.generatedAt ? (
              <span className="text-zinc-500">Updated {formatDate(data.generatedAt)}</span>
            ) : (
              <span className="text-zinc-500">Live from API</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => load()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Revenue (excl. cancelled)</p>
          <p className="mt-2 text-2xl font-semibold text-amber-400">
            {loading && !data ? "…" : formatMoney(data?.revenue?.primaryCurrency, data?.revenue?.primaryTotal)}
          </p>
          {multiCurrency ? (
            <p className="mt-1 text-xs text-zinc-500">Multiple currencies — largest total shown.</p>
          ) : (
            <p className="mt-1 text-xs text-zinc-500">Sum of order subtotals</p>
          )}
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            <FiShoppingBag className="h-3.5 w-3.5" aria-hidden />
            Orders
          </p>
          <p className="mt-2 text-2xl font-semibold text-zinc-50">
            {loading && !data ? "…" : (data?.orders?.total ?? 0).toLocaleString()}
          </p>
          <Link to="/orders" className="mt-1 inline-block text-xs text-amber-500/90 hover:text-amber-400 hover:underline">
            View orders
          </Link>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            <FiPackage className="h-3.5 w-3.5" aria-hidden />
            Products
          </p>
          <p className="mt-2 text-2xl font-semibold text-zinc-50">
            {loading && !data ? "…" : (data?.products?.published ?? 0).toLocaleString()}
            <span className="text-lg font-normal text-zinc-500">
              {" "}
              / {(data?.products?.total ?? 0).toLocaleString()}
            </span>
          </p>
          <p className="mt-1 text-xs text-zinc-500">Published / total in catalog</p>
          <Link
            to="/products"
            className="mt-1 inline-block text-xs text-amber-500/90 hover:text-amber-400 hover:underline"
          >
            Manage products
          </Link>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            <FiUsers className="h-3.5 w-3.5" aria-hidden />
            Customers
          </p>
          <p className="mt-2 text-2xl font-semibold text-zinc-50">
            {loading && !data ? "…" : (data?.customers?.total ?? 0).toLocaleString()}
          </p>
          <Link
            to="/customers"
            className="mt-1 inline-block text-xs text-amber-500/90 hover:text-amber-400 hover:underline"
          >
            View customers
          </Link>
        </div>
      </div>

      {!loading || data ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6 lg:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Orders (last 14 days)</h2>
            <p className="mt-1 text-xs text-zinc-600">Count per day · checkout volume</p>
            <div className="mt-6 flex h-40 items-end gap-1 sm:gap-1.5">
              {ordersByDay.map((day) => {
                const h = Math.round((day.count / maxDayCount) * 100);
                return (
                  <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                    <span className="text-[10px] tabular-nums text-zinc-500">{day.count}</span>
                    <div
                      className="w-full max-w-[28px] rounded-t-md bg-amber-500/50 transition-[height] hover:bg-amber-500/70"
                      style={{ height: `${Math.max(h, day.count > 0 ? 8 : 2)}%` }}
                      title={`${day.date}: ${day.count} orders`}
                    />
                    <span className="hidden truncate text-[9px] text-zinc-600 sm:block" title={day.date}>
                      {shortDayLabel(day.date).split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Order status</h2>
            <ul className="mt-4 space-y-3">
              {byStatus.map((row) => (
                <li key={row.status} className="flex items-center justify-between gap-2 text-sm">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs capitalize ${statusClass(row.status)}`}
                  >
                    {row.status}
                  </span>
                  <span className="tabular-nums text-zinc-300">{row.count ?? 0}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-zinc-800 pt-4 text-xs text-zinc-500">
              <p>
                Low stock (published, ≤5):{" "}
                <span className="font-medium text-amber-400/90">
                  {(data?.products?.lowStockPublished ?? 0).toLocaleString()}
                </span>
              </p>
              <p className="mt-1">
                Out of stock (published):{" "}
                <span className="font-medium text-zinc-300">
                  {(data?.products?.outOfStockPublished ?? 0).toLocaleString()}
                </span>
              </p>
            </div>
          </section>
        </div>
      ) : null}

      <section className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-200">Recent orders</h2>
            <p className="mt-0.5 text-xs text-zinc-600">Latest {RECENT_ORDERS_DISPLAY}</p>
          </div>
          <Link to="/orders" className="text-xs text-amber-500/90 hover:text-amber-400 hover:underline">
            All orders
          </Link>
        </div>
        {loading && !data ? (
          <p className="mt-6 text-sm text-zinc-500">Loading…</p>
        ) : recent.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">No orders yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-800">
            {recent.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0">
                <div className="min-w-0">
                  <Link
                    to={`/orders/${o.id}`}
                    className="font-mono text-sm text-amber-400/90 hover:text-amber-300 hover:underline"
                  >
                    {o.orderNumber}
                  </Link>
                  <p className="truncate text-xs text-zinc-500">
                    {o.customerName || "—"} · {formatDate(o.placedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm tabular-nums text-zinc-300">{formatMoney(o.currency, o.subtotal)}</span>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs capitalize ${statusClass(o.status)}`}
                  >
                    {o.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;
