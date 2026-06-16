import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { FiLock, FiMail } from "react-icons/fi";
import {
  getAdminToken,
  loginAdmin,
  persistAdminSession,
} from "./services/loginApi.js";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    location.state?.from && typeof location.state.from === "string"
      ? location.state.from
      : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (getAdminToken()) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await loginAdmin({
        email: email.trim(),
        password,
      });
      persistAdminSession({ token: data.token, admin: data.admin });
      navigate(from === "/" ? "/dashboard" : from, { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Login failed. Check the server and your credentials.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-100">
      <div className="w-full max-w-md">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-500/90">
          Eatoreum
        </p>
        <h1 className="mt-2 text-center text-2xl font-bold tracking-tight">Admin sign in</h1>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Use the account created with{" "}
          <code className="rounded bg-zinc-900 px-1 py-0.5 text-xs text-zinc-300">npm run seed:admin</code>
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl"
        >
          <div>
            <label htmlFor="admin-email" className="mb-1.5 flex items-center gap-2 text-xs font-medium text-zinc-400">
              <FiMail className="h-3.5 w-3.5" aria-hidden />
              Email
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
              placeholder="admin@eatoreum.local"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-1.5 flex items-center gap-2 text-xs font-medium text-zinc-400"
            >
              <FiLock className="h-3.5 w-3.5" aria-hidden />
              Password
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500">
          After login you&apos;ll be redirected to the{" "}
          <Link to="/dashboard" className="text-amber-500/90 hover:underline">
            dashboard
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export default Login;
