import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import {
  deleteAdminProduct,
  listAdminProducts,
} from "./services/productsApi.js";

function formatPrice(currency, price) {
  const c = currency || "PKR";
  const n = Number(price);
  if (!Number.isFinite(n)) return "—";
  return `${c} ${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatWeightGramsCell(p) {
  const w = p.weightGrams;
  if (w == null || w === "") return "—";
  const n = Number(w);
  if (!Number.isFinite(n) || n < 0) return "—";
  return `${Math.round(n)} g`;
}

function ProductsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const load = useCallback(async () => {
    setListError("");
    setLoading(true);
    try {
      const data = await listAdminProducts({
        page,
        limit,
        ...(q.trim() ? { q: q.trim() } : {}),
      });
      setItems(data.items ?? []);
      setPages(data.pages ?? 1);
      setTotal(data.total ?? 0);
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Could not load products.";
      setListError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, q]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(p) {
    const label = p.name || p.sku || p.id;
    if (!window.confirm(`Delete “${label}”? This cannot be undone.`)) return;
    try {
      await deleteAdminProduct(p.id);
      await load();
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Delete failed.";
      window.alert(msg);
    }
  }

  function applySearch(e) {
    e.preventDefault();
    setPage(1);
    setQ(searchInput);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Products</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {total} product{total === 1 ? "" : "s"} · admin catalog
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={applySearch} className="flex gap-2">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name, SKU, slug…"
              className="w-48 min-w-40 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40 sm:w-64"
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
          <button
            type="button"
            onClick={() => navigate("/products/new")}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
          >
            Add product
          </button>
        </div>
      </div>

      {listError ? (
        <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200" role="alert">
          {listError}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Weight (g)</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-zinc-500">
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-zinc-500">
                    No products yet. Add one to get started.
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-800/40">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{p.sku || "—"}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 font-medium text-zinc-200">{p.name}</td>
                    <td className="max-w-[140px] truncate px-4 py-3 font-mono text-xs text-zinc-500">{p.slug}</td>
                    <td className="px-4 py-3">{p.stock ?? 0}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-amber-400/90">
                      {formatPrice(p.currency, p.price)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-400 tabular-nums">
                      {formatWeightGramsCell(p)}
                    </td>
                    <td className="px-4 py-3">
                      {p.isPublished ? (
                        <span className="rounded-full bg-emerald-950/60 px-2 py-0.5 text-xs text-emerald-300">
                          Live
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">Draft</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/products/${p.id}/edit`)}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-amber-400"
                          aria-label="Edit"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-red-400"
                          aria-label="Delete"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
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

export default ProductsPage;
