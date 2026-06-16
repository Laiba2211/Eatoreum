import { useCallback, useEffect, useState } from "react";
import { FiRefreshCw, FiTrash2 } from "react-icons/fi";
import {
  deleteAdminReview,
  deleteAdminReviewReply,
  listAdminReviews,
} from "./services/reviewsApi.js";

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

function ReviewsPage() {
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
      const data = await listAdminReviews({
        page,
        limit,
        ...(q.trim() ? { q: q.trim() } : {}),
      });
      setItems(data.items ?? []);
      setPages(data.pages ?? 1);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err?.response?.data?.message ?? err?.message ?? "Could not load reviews.");
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

  async function handleDeleteReview(row) {
    const productLabel = row.product?.name ? ` on “${row.product.name}”` : "";
    if (
      !window.confirm(
        `Permanently delete this review by “${row.authorName}”${productLabel}? All replies will be removed. This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await deleteAdminReview(row.id);
      await load();
    } catch (err) {
      window.alert(err?.response?.data?.message ?? err?.message ?? "Delete failed.");
    }
  }

  async function handleDeleteReply(reviewId, reply) {
    if (
      !window.confirm(
        `Permanently delete this reply by “${reply.authorName}”? This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await deleteAdminReviewReply(reviewId, reply.id);
      await load();
    } catch (err) {
      window.alert(err?.response?.data?.message ?? err?.message ?? "Delete failed.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Reviews</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {total} review{total === 1 ? "" : "s"} · storefront product reviews and replies
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={applySearch} className="flex gap-2">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Author, text, product…"
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

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-10 text-center text-sm text-zinc-500">
          No reviews yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((row) => (
            <li
              key={row.id}
              className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 text-sm text-zinc-300"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Product</p>
                  <p className="mt-0.5 font-medium text-zinc-100">
                    {row.product?.name ?? "—"}{" "}
                    {row.product?.slug ? (
                      <span className="font-normal text-zinc-500">· /{row.product.slug}</span>
                    ) : null}
                  </p>
                </div>
                <div className="text-right text-xs text-zinc-500">
                  <p>{formatDate(row.createdAt)}</p>
                  <button
                    type="button"
                    onClick={() => void handleDeleteReview(row)}
                    className="mt-2 inline-flex items-center gap-1 rounded-lg border border-red-500/40 px-2.5 py-1 text-xs font-medium text-red-300 hover:bg-red-950/50"
                  >
                    <FiTrash2 className="h-3.5 w-3.5" aria-hidden />
                    Delete review
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-baseline gap-2 border-t border-zinc-800/80 pt-4">
                <span className="font-semibold text-zinc-100">{row.authorName}</span>
                <span className="text-amber-400/90">★ {row.rating}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed text-zinc-400">{row.body}</p>

              {Array.isArray(row.replies) && row.replies.length > 0 ? (
                <div className="mt-4 border-t border-zinc-800/80 pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Replies</p>
                  <ul className="mt-2 space-y-3">
                    {row.replies.map((rep) => (
                      <li
                        key={rep.id}
                        className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-zinc-200">{rep.authorName}</span>
                          <span className="ml-2 text-xs text-zinc-500">{formatDate(rep.createdAt)}</span>
                          <p className="mt-1 whitespace-pre-wrap text-zinc-400">{rep.body}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleDeleteReply(row.id, rep)}
                          className="shrink-0 inline-flex items-center gap-1 rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-300 hover:border-red-500/50 hover:text-red-300"
                          title="Delete reply permanently"
                        >
                          <FiTrash2 className="h-3.5 w-3.5" aria-hidden />
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

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

export default ReviewsPage;
