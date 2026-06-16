import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { subscribeNewsletter } from "../services/newsletterApi.js";

const socialLinks = [
  { href: "https://www.facebook.com/", label: "Facebook", Icon: FaFacebookF },
  { href: "https://www.instagram.com/", label: "Instagram", Icon: FaInstagram },
  { href: "https://www.youtube.com/", label: "YouTube", Icon: FaYoutube },
];

function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubscribe = useCallback(
    async (e) => {
      e.preventDefault();
      const trimmed = email.trim();
      setMessage("");
      setError("");
      if (!trimmed) {
        setError("Please enter your email.");
        return;
      }
      setSubmitting(true);
      try {
        const data = await subscribeNewsletter(trimmed);
        setMessage(data?.message ?? "Thanks for subscribing.");
        setEmail("");
      } catch (err) {
        setError(
          err?.response?.data?.message ??
            err?.message ??
            "Could not subscribe right now. Please try again later."
        );
      } finally {
        setSubmitting(false);
      }
    },
    [email]
  );

  return (
    <footer className="border-t border-(--brown) bg-(--soft-black)">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 md:grid-cols-4">

        {/* Logo + Description */}
        <div className="flex flex-col items-start">
          <Link
            to="/"
            className="inline-flex items-start focus:outline-none focus-visible:ring-2 focus-visible:ring-(--gold) focus-visible:ring-offset-2 focus-visible:ring-offset-(--soft-black)"
          >
            {/* <img
              src="/logo_final-removebg-preview.png"
              alt="Eatoreum"
              className="h-28 w-auto object-contain"
            /> */}
            <h2 className="text-3xl text-(--oat) leading-relaxed">Eatoreum</h2>
          </Link>

          <p className="mt-4 text-sm text-(--oat) leading-relaxed">
            Fresh groceries, fast delivery, and the best daily deals at your fingertips.
          </p>

          <div className="mt-5 flex items-center gap-3" aria-label="Social media">
            {socialLinks.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-(--brown)/60 bg-(--black)/30 text-(--oat) transition hover:border-(--gold)/50 hover:bg-(--gold)/10 hover:text-(--gold)"
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-(--gold-light)">
            Quick Links
          </h4>

          <ul className="mt-4 space-y-2 text-sm text-(--oat)">
            <li><Link to="/" className="hover:text-(--gold)">Home</Link></li>
            <li><Link to="/shop" className="hover:text-(--gold)">Shop</Link></li>
            <li>
              <Link to="/about" className="hover:text-(--gold)">
                About us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-(--gold)">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-(--gold-light)">
            Contact
          </h4>

          <ul className="mt-4 space-y-2 text-sm text-(--oat)">
            <li className="flex gap-2">
              <FiMail className="mt-0.5 h-4 w-4 shrink-0 text-(--gold-light)" aria-hidden />
              <a href="mailto:eatoreum@gmail.com" className="hover:text-(--gold)">
                eatoreum@gmail.com
              </a>
            </li>
            <li className="flex gap-2">
              <FiPhone className="mt-0.5 h-4 w-4 shrink-0 text-(--gold-light)" aria-hidden />
              <a href="tel:+923008332604" className="hover:text-(--gold)">
                +92 300 8332604
              </a>
            </li>
            <li className="flex gap-2 pt-1">
              <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-(--gold-light)" aria-hidden />
              <span>
                Rawalpindi / Islamabad
              </span>
            </li>
          </ul>
        </div>

        {/* Newsletter (RIGHT SIDE) */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-(--gold-light)">
            Newsletter
          </h4>

          <p className="mt-4 text-sm text-(--oat) leading-relaxed">
            Get fresh deals, recipes & discounts straight to your inbox.
          </p>

          <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubscribe} noValidate>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={submitting}
              className="w-full rounded-lg bg-(--black)/40 px-4 py-2 text-sm text-(--cream) outline-none placeholder:text-(--gray) disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-(--gold) px-4 py-2 text-sm font-semibold text-(--on-primary) transition hover:bg-(--gold-dark) disabled:opacity-60"
            >
              {submitting ? "Subscribing…" : "Subscribe"}
            </button>
            {error ? <p className="text-xs text-red-400">{error}</p> : null}
            {message ? <p className="text-xs text-emerald-400/90">{message}</p> : null}
          </form>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-(--brown)/40 py-4 text-center text-xs text-(--gray)">
        © {new Date().getFullYear()} Eatoreum. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;