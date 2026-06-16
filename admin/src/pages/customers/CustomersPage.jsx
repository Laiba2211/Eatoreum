import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";
import { listAdminCustomers } from "./services/customerApi.js";

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

function CustomersPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await listAdminCustomers({
        page,
        limit,
        ...(q.trim() ? { q: q.trim() } : {}),
      });
      setItems(data.items ?? []);
      setPages(data.pages ?? 1);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(
        err?.response?.data?.message ?? err?.message ?? "Could not load customers."
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, q]);

  useEffect(() => {
    load();
  }, [load]);

  function applySearch(e) {
    e.preventDefault();
    setPage(1);
    setQ(searchInput);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Customers</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {total} customer{total === 1 ? "" : "s"} · created when checkout completes
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={applySearch} className="flex gap-2">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Name, phone, email…"
              className="w-44 min-w-0 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40 sm:w-56"
            />
            <button
              type="submit"
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
            >
              Search
            </button>
          </form>
          <button
            type="button"
            onClick={() => load()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
          >
            <FiRefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Last order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-zinc-500">
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-zinc-500">
                    No customers yet. Place an order from the storefront checkout.
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr
                    key={row.id}
                    role="link"
                    tabIndex={0}
                    aria-label={`Open customer ${row.fullName}`}
                    className="cursor-pointer outline-none hover:bg-zinc-800/40 focus-visible:bg-zinc-800/40 focus-visible:ring-2 focus-visible:ring-amber-500/40"
                    onClick={() => navigate(`/customers/${row.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/customers/${row.id}`);
                      }
                    }}
                  >
                    <td className="px-4 py-3 font-medium text-zinc-100">{row.fullName || "—"}</td>
                    <td className="px-4 py-3 text-zinc-400">{row.phone || "—"}</td>
                    <td className="px-4 py-3 text-zinc-400">{row.email || "—"}</td>
                    <td className="px-4 py-3 tabular-nums">{row.orderCount ?? 0}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">
                      {formatDate(row.lastOrderAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
          <span>
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default CustomersPage;
