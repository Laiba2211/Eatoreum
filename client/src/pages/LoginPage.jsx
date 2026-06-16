import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full rounded-lg border border-(--brown)/30 bg-(--card) px-4 py-3 text-sm text-(--ink) placeholder:text-(--gray) focus:border-(--gold) outline-none";

const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-(--gray)";

/** UI + routes paused in App.jsx / Navbar — set `false` to show the full login layout again. */
const AUTH_PAGES_UI_DISABLED = true;

function LoginPage() {
  const { user, hydrated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from && typeof location.state.from === "string" ? location.state.from : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!hydrated) {
    return (
      <div className="py-20 text-center text-(--gray)">
        Loading...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const result = login(email, password);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    navigate(from === "/login" ? "/" : from, { replace: true });
  }

  return AUTH_PAGES_UI_DISABLED ? (
    <div className="flex min-h-screen flex-col items-center justify-center bg-(--soft-black) px-6 py-20 text-center text-sm text-(--gray)">
      <p>Login is temporarily unavailable.</p>
    </div>
  ) : (
    <div className="flex min-h-screen flex-col bg-(--soft-black) lg:flex-row">

      {/* ================= LEFT FORM ================= */}
      <div className="lg:w-1/2 flex items-center justify-center px-6 py-12 order-2 lg:order-1">

        <div className="w-full max-w-md">

          <p className="text-xs uppercase tracking-[0.2em] text-(--gold)">
            Welcome Back
          </p>

          <h1 className="mt-2 text-3xl font-bold text-(--ink)">
            Login
          </h1>

          <p className="mt-2 text-sm text-(--gray)">
            Access your account and order fresh nashta anytime.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">

            {/* EMAIL */}
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className={labelClass}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            {/* ERROR */}
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full rounded-lg bg-(--gold) py-3 font-semibold text-(--on-primary) transition hover:bg-(--gold-dark)"
            >
              Log in
            </button>

          </form>

          {/* REGISTER LINK */}
          <p className="mt-6 text-center text-sm text-(--gray)">
            No account yet?{" "}
            <Link
              to="/signup"
              className="text-(--gold) hover:underline"
            >
              Register
            </Link>
          </p>

        </div>
      </div>

      {/* ================= RIGHT IMAGE ================= */}
      <div className="lg:w-1/2 h-64 lg:h-screen relative order-1 lg:order-2">

        <img
          src="/craiyon_103640_image.png"
          alt="food"
          className="w-full h-full object-cover"
        />

        {/* overlay */}
        <div className="absolute inset-0 bg-black/60 flex items-end p-10">
          <div>
            <h2 className="text-white text-3xl font-bold">
              Welcome Back
            </h2>
            <p className="text-gray-300 text-sm mt-2">
              Fresh food, faster delivery, better mornings.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}

export default LoginPage;