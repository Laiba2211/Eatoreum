import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function ProfilePage() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  function handleSubmit(e) {
    e.preventDefault();
    // Demo only
  }

  const initials = (name || user?.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-10 max-w-3xl mx-auto">

      {/* ================= HEADER ================= */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-(--black) via-(--card) to-(--soft-black) p-6 sm:p-8">

        {/* glow */}
        <div className="absolute -top-16 -right-16 h-48 w-48 bg-[#d4af37]/10 blur-3xl"></div>

        <div className="relative z-10 flex items-center gap-5">

          {/* AVATAR */}
          <div className="h-14 w-14 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] font-bold">
            {initials}
          </div>

          {/* INFO */}
          <div>
            <h2 className="text-xl font-semibold text-(--ink)">
              Your Profile
            </h2>
            <p className="text-sm text-gray-400">
              Manage your personal details
            </p>
          </div>

        </div>
      </section>

      {/* ================= FORM CARD ================= */}
      <section className="rounded-2xl border border-white/10 bg-(--card)/50 backdrop-blur p-6 sm:p-8">

        <h3 className="text-lg font-semibold text-(--ink)">
          Account Details
        </h3>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">

          {/* NAME */}
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-gray-400">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-(--ink) placeholder:text-gray-500 focus:border-(--gold) outline-none transition"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-gray-400">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-(--ink) placeholder:text-gray-500 focus:border-(--gold) outline-none transition"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">

<p className="text-xs text-gray-500">
  Changes are not saved to a server (demo mode)
</p>

<button
  type="submit"
  className="whitespace-nowrap rounded-lg bg-[#d4af37] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#c9a227] sm:w-auto w-full"
>
  Save Changes
</button>

</div>

        </form>
      </section>

    </div>
  );
}

export default ProfilePage;