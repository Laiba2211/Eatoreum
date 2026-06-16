import { NavLink, Outlet } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import Sidebar from "../components/admin/Sidebar";
import { AdminNotificationCountProvider, useAdminNotificationCount } from "../contexts/AdminNotificationCountContext.jsx";

function AdminHeader() {
  const { unreadCount } = useAdminNotificationCount();
  const badge =
    unreadCount > 99 ? "99+" : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-950/80 px-6 backdrop-blur">
      <span className="text-sm text-zinc-400">Control panel</span>
      <NavLink
        to="/notifications"
        className={({ isActive }) =>
          `relative flex h-10 w-10 items-center justify-center rounded-lg border transition ${
            isActive
              ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
              : "border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100"
          }`
        }
        title="Notifications"
        aria-label={badge ? `Notifications, ${unreadCount} unread` : "Notifications"}
      >
        <FiBell className="h-[18px] w-[18px]" aria-hidden />
        {badge ? (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
            {badge}
          </span>
        ) : null}
      </NavLink>
    </header>
  );
}

function AdminLayout() {
  return (
    <AdminNotificationCountProvider>
      <div className="flex min-h-screen bg-zinc-900 text-zinc-100">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader />

          <main className="flex-1 overflow-auto p-6 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminNotificationCountProvider>
  );
}

export default AdminLayout;
