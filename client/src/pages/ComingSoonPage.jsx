import { Link, useLocation } from "react-router-dom";

const PAGE_TITLES = {
  "/about": "About",
  "/contact": "Contact",
  "/offers": "Offers",
  "/login": "Login",
  "/signup": "Sign up",
};

function ComingSoonPage() {
  const { pathname } = useLocation();
  const plannedTitle = PAGE_TITLES[pathname];
  const isPlanned = Boolean(plannedTitle);
  const title = plannedTitle ?? "Page not found";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-20 text-center">
      
      {/* Badge */}
      <p className="mb-4 rounded-full border border-(--gold)/30 bg-(--gold)/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-(--gold)">
        {isPlanned ? "Coming Soon" : "404 Error"}
      </p>

      {/* Title */}
      <h1 className="font-['Lato',sans-serif] text-4xl font-black tracking-tight text-(--white) sm:text-5xl">
        {title}
      </h1>

      {/* Sub line glow accent */}
      <div className="mt-4 h-[2px] w-20 rounded-full bg-gradient-to-r from-transparent via-(--gold) to-transparent opacity-80" />

      {/* Description */}
      <p className="text-description mt-6 max-w-md text-sm leading-relaxed text-(--oat) sm:text-base">
        {isPlanned ? (
          <>
            This section is currently under development. We’re crafting a more refined experience
            for you. Stay tuned while we upgrade things behind the scenes.
          </>
        ) : (
          <>
            The page you’re looking for doesn’t exist or has been moved. You can continue browsing
            the store or return home.
          </>
        )}
      </p>

      {/* Contact hint */}
      {pathname === "/contact" && (
        <p className="mt-5 text-sm text-(--oat)">
          Need urgent help?{" "}
          <a
            href="mailto:support@eatoreum.com"
            className="font-medium text-(--gold) underline decoration-(--gold)/40 underline-offset-4 hover:text-(--gold-light)"
          >
            support@eatoreum.com
          </a>
        </p>
      )}

      {/* Buttons */}
      <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-xl bg-(--gold) px-7 py-3 text-sm font-bold text-(--on-primary) shadow-lg shadow-(--gold)/20 transition hover:scale-[1.02] hover:bg-(--gold-dark)"
        >
          Back to Home
        </Link>

        <Link
          to="/shop"
          className="inline-flex items-center justify-center rounded-xl border border-(--oat) bg-(--black)/20 px-7 py-3 text-sm font-semibold text-(--cream) backdrop-blur transition hover:border-(--gold) hover:text-(--gold) hover:shadow-md"
        >
          Explore Shop
        </Link>
      </div>
    </div>
  );
}

export default ComingSoonPage;