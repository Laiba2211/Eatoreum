import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full rounded-lg border border-(--brown)/30 bg-(--card) px-4 py-2.5 text-sm text-(--ink) placeholder:text-(--gray) focus:border-(--gold) outline-none transition";

const labelClass =
  "mb-1 block text-[11px] font-medium uppercase tracking-wide text-(--gray)";

/** UI + routes paused in App.jsx / Navbar — set `false` to show the full register layout again. */
const AUTH_PAGES_UI_DISABLED = true;

function RegisterPage() {
  const { user, hydrated, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    location.state?.from && typeof location.state.from === "string"
      ? location.state.from
      : "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  if (!hydrated) {
    return <div className="py-20 text-center text-(--gray)">Loading...</div>;
  }

  if (user) return <Navigate to="/" replace />;

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = register(name, email, password);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    navigate(from === "/signup" ? "/" : from, { replace: true });
  }

  return AUTH_PAGES_UI_DISABLED ? (
    <div className="flex min-h-screen flex-col items-center justify-center bg-(--soft-black) px-6 py-20 text-center text-sm text-(--gray)">
      <p>Registration is temporarily unavailable.</p>
    </div>
  ) : (
    <div className="flex min-h-screen bg-(--soft-black)">

      {/* ================= LEFT IMAGE (SMALLER) ================= */}
      <div className="hidden lg:block lg:w-[40%] relative">

        <img
          src="/craiyon_103640_image.png"
          alt="food"
          className="h-full w-full object-cover"
        />

        {/* overlay */}
        <div className="absolute inset-0 bg-black/60 flex items-end p-8">
          <div>
            <h2 className="text-white text-2xl font-semibold">
              Fresh Nashta Daily
            </h2>
            <p className="text-gray-300 text-sm mt-2">
              Hygienic, fast, and made for your mornings.
            </p>
          </div>
        </div>
      </div>

      {/* ================= RIGHT FORM (BIGGER) ================= */}
      <div className="w-full lg:w-[60%] flex items-center justify-center px-6 py-12">

        <div className="w-full max-w-lg">

          <p className="text-xs uppercase tracking-[0.2em] text-(--gold)">
            Create Account
          </p>

          <h1 className="mt-2 text-3xl font-bold text-(--ink)">
            Register
          </h1>

          <p className="mt-2 text-sm text-(--gray)">
            Order fresh nashta anytime, anywhere.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">

            {/* NAME + PHONE */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Full name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Phone</label>
                <input type="tel" className={inputClass} placeholder="+92..." />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className={labelClass}>Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* ADDRESS */}
            <div className="space-y-3 rounded-lg border border-(--brown)/30 bg-(--black) p-4">

              <p className="text-xs uppercase tracking-wide text-(--gray)">
                Shipping Address
              </p>

              <input
                placeholder="Address line 1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className={inputClass}
              />

              <input
                placeholder="Address line 2 (optional)"
                className={inputClass}
              />

              <div className="grid sm:grid-cols-2 gap-3">
                <input placeholder="City" className={inputClass} />
                <input placeholder="State / Province" className={inputClass} />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <input placeholder="Postal code" className={inputClass} />
                <input placeholder="Country" className={inputClass} />
              </div>

            </div>

            {/* PASSWORDS */}
            <div className="grid sm:grid-cols-2 gap-3">
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

              <div>
                <label className={labelClass}>Confirm</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* ERROR */}
            {error && <p className="text-sm text-red-400">{error}</p>}

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full rounded-lg bg-(--gold) py-2.5 text-sm font-semibold text-(--on-primary) transition hover:bg-(--gold-dark)"
            >
              Create Account
            </button>

          </form>

          {/* LOGIN */}
          <p className="mt-6 text-center text-sm text-(--gray)">
            Already have an account?{" "}
            <Link to="/login" className="text-(--gold) hover:underline">
              Login
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}

export default RegisterPage;