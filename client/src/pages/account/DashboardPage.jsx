import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { mockOrders } from "../../data/mockOrders";

function DashboardPage() {
  const { user } = useAuth();
  const recent = mockOrders.slice(0, 3);

  return (
    <div className="space-y-10">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-(--black) via-(--card) to-(--soft-black) p-6 sm:p-10">

        <div className="absolute -top-20 -right-20 h-60 w-60 bg-[#d4af37]/10 blur-3xl"></div>

        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">
            Eatoreum Dashboard
          </p>

          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-(--ink)">
            Welcome back 👋
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Signed in as{" "}
            <span className="text-[#ead9b6] font-medium">
              {user?.email}
            </span>
          </p>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

        {/* Orders */}
        <div className="group rounded-2xl border border-white/10 bg-(--card)/60 p-6 backdrop-blur transition hover:border-(--gold)/40">
          <p className="text-3xl font-bold text-[#d4af37]">
            {mockOrders.length}
          </p>
          <p className="mt-2 text-xs uppercase tracking-wide text-gray-400">
            Total Orders
          </p>
        </div>

        {/* Profile */}
        <div className="group rounded-2xl border border-white/10 bg-(--card)/60 p-6 backdrop-blur transition hover:border-(--gold)/40">
          <p className="text-lg font-semibold text-(--ink)">
            Profile Settings
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Manage your personal details
          </p>
          <Link
            to="/account/profile"
            className="mt-4 inline-block text-sm text-[#d4af37] hover:underline"
          >
            Edit Profile →
          </Link>
        </div>

        {/* Tracking */}
        <div className="group rounded-2xl border border-white/10 bg-(--card)/60 p-6 backdrop-blur transition hover:border-(--gold)/40">
          <p className="text-lg font-semibold text-(--ink)">
            Order Tracking
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Track your latest orders in real time
          </p>
          <Link
            to="/account/orders"
            className="mt-4 inline-block text-sm text-[#d4af37] hover:underline"
          >
            Track Orders →
          </Link>
        </div>

      </section>

      {/* ================= RECENT ORDERS ================= */}
      <section className="rounded-2xl border border-white/10 bg-(--card)/50 p-6 sm:p-8 backdrop-blur">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-(--ink)">
            Recent Orders
          </h2>

          <Link
            to="/account/orders"
            className="text-sm text-[#d4af37] hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="mt-6 space-y-4">

          {recent.map((o) => (
            <div
              key={o.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-white/5 bg-black/40 px-4 py-4 transition hover:border-(--gold)/30"
            >

              {/* LEFT */}
              <div>
                <p className="text-sm font-medium text-(--ink)">
                  Order #{o.id}
                </p>
                <p className="text-xs text-gray-400">
                  {o.date}
                </p>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-4">

                <span className="text-sm font-semibold text-[#d4af37]">
                  Rs {o.total}
                </span>

                <Link
                  to={`/account/orders/${encodeURIComponent(o.id)}`}
                  className="text-xs text-gray-300 hover:text-(--ink)"
                >
                  Details →
                </Link>

              </div>

            </div>
          ))}

          {recent.length === 0 && (
            <p className="text-sm text-gray-400">
              No recent orders yet.
            </p>
          )}

        </div>
      </section>

    </div>
  );
}

export default DashboardPage;