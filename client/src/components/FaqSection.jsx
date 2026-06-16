import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

const faqs = [
  {
    id: "delivery",
    question: "How does delivery work?",
    answer:
      "Choose a delivery slot at checkout. We pack your order fresh and send updates by SMS. Most areas receive same-day or next-day delivery depending on slot availability.",
  },
  {
    id: "account",
    question: "Do I need an account to shop?",
    answer:
      "You can browse the full catalog, filters, and product pages without logging in. Creating an account is optional and helps you track orders and save addresses faster.",
  },
  {
    id: "payment",
    question: "What payment methods do you accept?",
    answer:
      "We accept major cards, UPI, and popular wallets where available. Cash on delivery may be offered in select zones — check at checkout for your address.",
  },
  {
    id: "returns",
    question: "What is your return or refund policy?",
    answer:
      "If something arrives damaged or incorrect, contact support within 24 hours with your order ID and a photo. We will arrange a replacement or refund per policy.",
  },
  {
    id: "freshness",
    question: "How do you keep produce fresh?",
    answer:
      "Cold-chain friendly packing, quality checks before dispatch, and short fulfilment windows help us deliver groceries in great condition.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 380, damping: 28 },
  },
};

function FaqSection() {
  const [openId, setOpenId] = useState(null);

  function toggle(id) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <section className="bg-(--soft-black)">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-(--gold-light)">FAQ</p>
            <h2 className="mt-3 text-3xl font-bold text-(--gold)">Frequently asked questions</h2>
            <p className="mt-4 text-sm leading-relaxed text-(--oat)">
              Quick answers about ordering, delivery, and shopping with Eatoreum.
            </p>
          </motion.div>

          <motion.ul
            className="space-y-4"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
          >
            {faqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <motion.li
                  key={faq.id}
                  variants={item}
                  layout
                  className="rounded-xl border border-(--brown) bg-(--black)/30"
                >
                  <button
                    type="button"
                    onClick={() => toggle(faq.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-(--black)/20 sm:px-6 sm:py-5"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${faq.id}`}
                    id={`faq-trigger-${faq.id}`}
                  >
                    <span className="font-medium text-(--cream)">{faq.question}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      className="shrink-0 text-(--gold-light)"
                      aria-hidden
                    >
                      <FiChevronDown size={22} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${faq.id}`}
                        role="region"
                        aria-labelledby={`faq-trigger-${faq.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="text-description px-5 pb-5 pt-3 text-sm leading-relaxed sm:px-6">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
