import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";
import { useAdminNotificationCount } from "../../contexts/AdminNotificationCountContext.jsx";
import {
  listAdminNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./services/notificationsApi.js";

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

function typeLabel(type) {
  switch (type) {
    case "order_received":
      return "Order";
    case "review_new":
      return "Review";
    case "review_reply":
      return "Reply";
    default:
      return type;
  }
}

function NotificationsPage() {
  const { unreadCount, refresh: refreshUnread } = useAdminNotificationCount();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyAll, setBusyAll] = useState(false);

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await listAdminNotifications({ page, limit });
      setItems(data.items ?? []);
      setPages(data.pages ?? 1);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err?.response?.data?.message ?? err?.message ?? "Could not load notifications.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleMarkRead(id) {
    try {
      await markNotificationRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      await refreshUnread();
    } catch (err) {
      window.alert(err?.response?.data?.message ?? err?.message ?? "Could not mark as read.");
    }
  }

  async function handleMarkAllRead() {
    if (!window.confirm("Mark all notifications as read?")) return;
    setBusyAll(true);
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      await refreshUnread();
    } catch (err) {
      window.alert(err?.response?.data?.message ?? err?.message ?? "Could not mark all as read.");
    } finally {
      setBusyAll(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Notifications</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {total} notification{total === 1 ? "" : "s"} · new orders and storefront reviews
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busyAll || unreadCount === 0}
            onClick={() => void handleMarkAllRead()}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
          >
            Mark all read
          </button>
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
          No notifications yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border px-4 py-4 text-sm ${
                n.read
                  ? "border-zinc-800 bg-zinc-950/40 text-zinc-400"
                  : "border-amber-500/25 bg-amber-500/5 text-zinc-200 ring-1 ring-amber-500/15"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                      {typeLabel(n.type)}
                    </span>
                    {!n.read ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-400/90">
                        Unread
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 font-medium text-zinc-100">{n.title}</p>
                  {n.type === "order_received" && n.meta?.orderNumber ? (
                    <p className="mt-1 text-xs text-zinc-500">
                      {n.meta.customerName ? `${n.meta.customerName} · ` : null}
                      {Number.isFinite(Number(n.meta.subtotal))
                        ? `${n.meta.currency || "PKR"} ${Number(n.meta.subtotal).toLocaleString()}`
                        : null}
                    </p>
                  ) : null}
                  {(n.type === "review_new" || n.type === "review_reply") && n.meta?.authorName ? (
                    <p className="mt-1 text-xs text-zinc-500">From {n.meta.authorName}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-zinc-500">{formatDate(n.createdAt)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {n.type === "order_received" && n.meta?.orderId ? (
                      <Link
                        to={`/orders/${encodeURIComponent(n.meta.orderId)}`}
                        className="text-xs font-medium text-amber-400 hover:text-amber-300"
                      >
                        View order
                      </Link>
                    ) : null}
                    {(n.type === "review_new" || n.type === "review_reply") && (
                      <Link to="/reviews" className="text-xs font-medium text-amber-400 hover:text-amber-300">
                        View reviews
                      </Link>
                    )}
                  </div>
                </div>
                {!n.read ? (
                  <button
                    type="button"
                    onClick={() => void handleMarkRead(n.id)}
                    className="shrink-0 rounded-lg border border-zinc-600 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:border-amber-500/40 hover:text-amber-200"
                  >
                    Mark read
                  </button>
                ) : null}
              </div>
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

export default NotificationsPage;
