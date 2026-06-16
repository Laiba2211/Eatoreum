import { NavLink, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { adminNavItems } from "../../config/adminNav";
import { clearAdminSession } from "../../pages/login/services/loginApi.js";

function linkClass({ isActive }) {
  return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30"
      : "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-100"
  }`;
}

function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    clearAdminSession();
    navigate("/", { replace: true });
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-500/90">Eatoreum</p>
        <p className="mt-0.5 text-lg font-bold text-zinc-100">Admin</p>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Admin">
        {adminNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass} end={to === "/dashboard"}>
            <Icon className="h-[18px] w-[18px] shrink-0 opacity-90" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-zinc-800 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-50"
        >
          <FiLogOut className="h-[18px] w-[18px] shrink-0 opacity-90" aria-hidden />
          Log out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
