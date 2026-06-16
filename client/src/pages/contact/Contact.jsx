import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiPhone, FiMapPin, FiMail } from "react-icons/fi";
import { submitContactForm } from "./services/contactApi.js";

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const sendLock = useRef(false);

  const sendMessage = useCallback(async () => {
    if (sendLock.current) return;
    const n = name.trim();
    const em = email.trim();
    const msg = message.trim();
    if (!n) {
      setError("Please enter your name.");
      return;
    }
    if (!em || !EMAIL_RX.test(em)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (msg.length < 10) {
      setError("Message must be at least 10 characters.");
      return;
    }

    sendLock.current = true;
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const data = await submitContactForm({
        name: n,
        email: em,
        message: msg,
        ...(subject.trim() ? { subject: subject.trim() } : {}),
      });
      setSuccess(data?.message ?? "Message sent. We will get back to you soon.");
      setMessage("");
      setSubject("");
    } catch (err) {
      setError(
        err?.response?.data?.message ?? err?.message ?? "Could not send your message. Please try again later."
      );
    } finally {
      sendLock.current = false;
      setSubmitting(false);
    }
  }, [name, email, message, subject]);

  function handleFormKeyDown(e) {
    if (e.key !== "Enter") return;
    if (e.nativeEvent?.isComposing) return;
    if (e.target instanceof HTMLTextAreaElement) return;
    if (!(e.target instanceof HTMLInputElement)) return;
    e.preventDefault();
    void sendMessage();
  }

  return (
    <div className="bg-(--soft-black) text-(--cream)">
      <section className="relative flex h-[50vh] items-center justify-center px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-(--black) via-(--black)/70 to-(--black)" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-bold text-(--ink) sm:text-5xl">Get in Touch</h1>
          <p className="mt-4 text-(--gray)">
            Have a question about your order or nashta? We&apos;re here to help you anytime.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-6 md:flex-row md:justify-between">
          {[
            { icon: <FiPhone size={20} />, title: "Call Us", desc: "+92 300 8332604" },
            { icon: <FiMail size={20} />, title: "Email", desc: "eatoreum@gmail.com" },
            { icon: <FiMapPin size={20} />, title: "Location", desc: "Rawalpindi / Islamabad" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex-1 rounded-2xl border border-(--brown)/30 bg-(--card) p-6 text-center transition hover:border-(--gold)/50"
            >
              <div className="mb-3 flex justify-center text-(--gold)">{item.icon}</div>
              <h3 className="mb-1 font-semibold text-(--ink)">{item.title}</h3>
              <p className="text-sm text-(--gray)">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-(--black) px-6 py-20">
        <div className="mx-auto max-w-3xl px-2 sm:px-0">
          <h2 className="mb-10 text-center text-3xl font-semibold text-(--ink)">Send Us a Message</h2>

          <div
            role="form"
            aria-label="Contact form"
            onKeyDown={handleFormKeyDown}
            className="space-y-5 sm:space-y-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                placeholder="Your Name"
                className="flex-1 rounded-lg border border-(--brown)/30 bg-(--card) px-4 py-3 text-sm text-(--ink) outline-none focus:border-(--gold)"
              />
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email"
                className="flex-1 rounded-lg border border-(--brown)/30 bg-(--card) px-4 py-3 text-sm text-(--ink) outline-none focus:border-(--gold)"
              />
            </div>

            <input
              type="text"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              placeholder="Subject (optional)"
              className="w-full rounded-lg border border-(--brown)/30 bg-(--card) px-4 py-3 text-sm text-(--ink) outline-none focus:border-(--gold)"
            />

            <textarea
              name="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={5000}
              placeholder="Your message (at least 10 characters)"
              className="w-full rounded-lg border border-(--brown)/30 bg-(--card) px-4 py-3 text-sm text-(--ink) outline-none focus:border-(--gold)"
            />
            <p className="text-right text-xs text-gray-500">{message.length} / 5000</p>

            {error ? (
              <p className="rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-200" role="alert">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200" role="status">
                {success}
              </p>
            ) : null}

            <button
              type="button"
              disabled={submitting}
              onClick={() => void sendMessage()}
              className="w-full rounded-lg bg-(--gold) py-3 font-semibold text-(--on-primary) transition hover:bg-(--gold-dark) disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send Message"}
            </button>
          </div>
        </div>
      </section>

      <section className="border-t border-(--brown)/30 px-6 py-20 text-center">
        <h2 className="mb-4 text-3xl font-semibold text-(--ink)">Ready for Fresh Nashta?</h2>
        <p className="mb-6 text-(--gray)">Order now and enjoy fresh, hygienic food at your doorstep.</p>
        <Link
          to="/shop"
          className="inline-block rounded-lg bg-(--gold) px-6 py-3 font-semibold text-(--on-primary) transition hover:bg-(--gold-dark)"
        >
          Order Now
        </Link>
      </section>
    </div>
  );
}

export default Contact;
