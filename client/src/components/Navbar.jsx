import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiMoon, FiSearch, FiShoppingCart, FiSun, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext.jsx";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { user, logout, hydrated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!location.pathname.startsWith("/shop")) return;
    const sp = new URLSearchParams(location.search);
    setHeaderSearch(sp.get("q") ?? "");
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevHtmlOverflowX = html.style.overflowX;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyOverflowX = body.style.overflowX;

    html.style.overflow = "hidden";
    html.style.overflowX = "hidden";
    body.style.overflow = "hidden";
    body.style.overflowX = "hidden";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      html.style.overflowX = prevHtmlOverflowX;
      body.style.overflow = prevBodyOverflow;
      body.style.overflowX = prevBodyOverflowX;
    };
  }, [isMenuOpen]);

  function submitHeaderSearch(e) {
    e.preventDefault();
    const q = headerSearch.trim();
    if (q) navigate(`/shop?q=${encodeURIComponent(q)}`);
    else navigate("/shop");
    setIsMenuOpen(false);
  }

  const linkClass = ({ isActive }) =>
    `text-xs uppercase tracking-wide transition ${
      isActive ? "text-(--gold-light)" : "text-(--cream) hover:text-(--gold-light)"
    }`;

  const mobileMenu =
    typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence>
            {isMenuOpen && (
              <>
                <motion.button
                  type="button"
                  aria-label="Close menu overlay"
                  className="fixed inset-0 z-200 touch-none bg-(--black)/70 md:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIsMenuOpen(false)}
                />

                <motion.aside
                  className="fixed right-0 top-0 z-210 flex h-dvh max-h-dvh w-72 max-w-[calc(100%-1rem)] flex-col overflow-hidden border-l border-(--brown) bg-(--soft-black) pt-[max(0.75rem,env(safe-area-inset-top))] pb-[calc(1.25rem+env(safe-area-inset-bottom,0))] pl-4 pr-4 md:hidden"
                  style={{ overscrollBehavior: "contain" }}
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.28, ease: "easeInOut" }}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Menu"
                >
                  <div className="flex shrink-0 justify-end pb-4">
                    <button
                      type="button"
                      onClick={() => setIsMenuOpen(false)}
                      className="rounded-lg border border-(--oat) p-2.5 text-(--cream) transition hover:border-(--gold-light) hover:text-(--gold-light)"
                      aria-label="Close menu"
                    >
                      <FiX size={20} />
                    </button>
                  </div>

                  <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain" aria-label="Main navigation">
                    <ul className="space-y-1">
                      {navLinks.map((link) => (
                        <li key={link.label}>
                          <Link
                            to={link.to}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex min-h-12 items-center rounded-lg px-3 text-base font-medium text-(--cream) transition hover:bg-(--black)/40 hover:text-(--gold-light) active:bg-(--black)/50"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>

                  {/* Mobile Login / Register: restore when auth routes are enabled in App.jsx */}
                  <div className="shrink-0 space-y-3 border-t border-white/10 pt-5">
                    {hydrated ? (
                      user ? (
                        <>
                          <p className="text-center text-sm text-(--gray-light)">Signed in as {user.name}</p>
                          <Link
                            to="/account"
                            onClick={() => setIsMenuOpen(false)}
                            className="block w-full rounded-lg border border-(--oat) px-4 py-2 text-center text-sm font-medium text-(--cream) transition hover:border-(--gold-light) hover:text-(--gold-light)"
                          >
                            My account
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              logout();
                              setIsMenuOpen(false);
                            }}
                            className="flex h-11 w-full items-center justify-center whitespace-nowrap rounded-lg border border-(--oat) px-4 text-sm font-medium text-(--cream) transition hover:border-(--gold-light) hover:text-(--gold-light)"
                          >
                            Logout
                          </button>
                        </>
                      ) : null
                    ) : null}
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <>
      <header className="relative z-30 border-b border-(--brown) bg-(--soft-black)/95 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between overflow-x-hidden px-6 py-2 md:grid md:grid-cols-3">
        <ul className="hidden md:flex items-center gap-6 justify-start">
          {navLinks.map((link) => (
            <li key={link.label}>
              <NavLink to={link.to} className={linkClass} end={link.to === "/"}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <Link
          to="/"
          className="flex items-center justify-center md:justify-self-center overflow-visible"
        >
          <picture>
            <source type="image/webp" srcSet="/logo-navbar.webp" />
            <img
              src="/erasebg-transformed.png"
              alt="Eatoreum"
              width={256}
              height={256}
              decoding="async"
              className="h-16 w-auto max-h-16 object-contain scale-125 origin-center"
            />
          </picture>
        </Link>

        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-md border border-(--oat) p-2 text-(--cream) transition hover:border-(--gold-light) hover:text-(--gold-light)"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <FiSun size={18} aria-hidden /> : <FiMoon size={18} aria-hidden />}
          </button>

          <form
            onSubmit={submitHeaderSearch}
            className="relative hidden w-36 shrink-0 sm:block lg:w-44"
          >
            <label htmlFor="nav-search" className="sr-only">
              Search
            </label>
            <input
              id="nav-search"
              type="search"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-md border border-(--brown) bg-(--black)/40 py-2 pl-2.5 pr-9 text-xs text-(--cream) placeholder:text-(--gray) focus:border-(--gold) focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-(--cream) transition hover:bg-(--gold)/10 hover:text-(--gold-light)"
              aria-label="Search"
            >
              <FiSearch size={16} strokeWidth={2.25} />
            </button>
          </form>

          <Link
            to="/shop"
            className="rounded-md p-2 text-(--cream) transition hover:text-(--gold-light) sm:hidden"
            aria-label="Search on shop"
          >
            <FiSearch size={18} />
          </Link>

          {/* Login / Register desktop links: restore when auth routes are enabled in App.jsx */}
          <div className="hidden min-h-9 shrink-0 flex-nowrap items-center gap-2 md:flex">
            {hydrated ? (
              user ? (
                <>
                  <span className="max-w-[120px] truncate text-xs text-(--cream) lg:max-w-[160px]" title={user.name}>
                    Hi, {user.name}
                  </span>
                  <Link
                    to="/account"
                    className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-(--oat) px-2.5 text-[11px] font-medium uppercase tracking-wide text-(--cream) transition hover:border-(--gold-light) hover:text-(--gold-light) lg:px-3 lg:text-xs"
                  >
                    Account
                  </Link>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-(--oat) px-2.5 text-[11px] font-medium uppercase tracking-wide text-(--cream) transition hover:border-(--gold-light) hover:text-(--gold-light) lg:px-3 lg:text-xs"
                  >
                    Logout
                  </button>
                </>
              ) : null
            ) : null}
          </div>

          <Link
            to="/cart"
            className="relative rounded-md p-2 text-(--cream) transition hover:text-(--gold-light)"
            aria-label="View cart"
          >
            <FiShoppingCart size={18} />
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-(--gold) px-0.5 text-[10px] font-semibold text-(--on-primary)">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex md:hidden items-center justify-center rounded-lg border border-(--oat) p-2 text-(--cream)"
          >
            {isMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </nav>
      </header>
      {mobileMenu}
    </>
  );
}

export default Navbar;
