import { NavLink, Outlet, Link } from "react-router-dom";

const accountTabs = [
  { to: "/account", label: "Dashboard", end: true },
  { to: "/account/profile", label: "Profile" },
  { to: "/account/orders", label: "Order history" },
];

function tabClass({ isActive }) {
  return `rounded-lg px-4 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-(--gold)/15 text-(--gold-light) ring-1 ring-(--gold)/40"
      : "text-(--gray-light) hover:bg-(--black)/40 hover:text-(--cream)"
  }`;
}

function AccountLayout() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <Link to="/" className="text-xs font-medium text-(--gold-light) transition hover:text-(--gold)">
        ← Back to store
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-(--white) sm:text-3xl">My account</h1>
      <p className="mt-1 text-sm text-(--gray-light)">Dashboard, profile, and orders (demo UI).</p>

      <nav className="mt-8 flex flex-wrap gap-2 border-b border-white/10 pb-4" aria-label="Account">
        {accountTabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.end} className={tabClass}>
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}

export default AccountLayout;
