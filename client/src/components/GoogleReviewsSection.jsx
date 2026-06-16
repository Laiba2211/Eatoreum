import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const reviews = [
  {
    id: "1",
    name: "Ayesha K.",
    rating: 5,
    text: "Fresh produce every time. Delivery was on time and the packaging was spotless. Highly recommend!",
    relativeTime: "2 weeks ago",
  },
  {
    id: "2",
    name: "Vikram S.",
    rating: 5,
    text: "Great variety and fair prices. The masala oats bundle is a regular in our pantry now.",
    relativeTime: "1 month ago",
  },
  {
    id: "3",
    name: "Neha R.",
    rating: 4,
    text: "Easy ordering and helpful support. One item was substituted but they called first — appreciated.",
    relativeTime: "1 month ago",
  },
  {
    id: "4",
    name: "Imran M.",
    rating: 5,
    text: "Best grocery experience in the area. Website is simple and checkout is quick.",
    relativeTime: "2 months ago",
  },
];

const AUTO_MS = 4500;

function Stars({ value }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= value ? "text-(--gold)" : "text-(--gray)"}>
          ★
        </span>
      ))}
    </span>
  );
}

function ReviewCard({ r }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-(--brown) bg-(--soft-black)/80 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--brown)/40 text-sm font-bold text-(--gold-light)">
          {r.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-(--cream)">{r.name}</p>
          <p className="mt-0.5 text-xs text-(--gray)">{r.relativeTime}</p>
          <p className="mt-2 text-xs">
            <Stars value={r.rating} />
          </p>
        </div>
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-(--oat)">
        {r.text}
      </p>


    </article>
  );
}

function GoogleReviewsSection() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Responsive slides (1 or 2 per slide)
  const slides = useMemo(() => {
    const chunkSize = isMobile ? 1 : 2;
    const chunks = [];

    for (let i = 0; i < reviews.length; i += chunkSize) {
      chunks.push(reviews.slice(i, i + chunkSize));
    }

    return chunks;
  }, [isMobile]);

  const slideCount = slides.length;

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % slideCount);
  }, [slideCount]);

  // Auto slide
  useEffect(() => {
    if (paused || slideCount <= 1) return;
    const id = setInterval(goNext, AUTO_MS);
    return () => clearInterval(id);
  }, [paused, goNext, slideCount]);

  const current = slides[index] || [];

  return (
    <section className="bg-(--black)/25">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8">

 {/* Header */}
<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
  <div>
    <h2 className="text-2xl font-bold text-(--gold) sm:text-3xl">
      Our Customer Reviews
    </h2>
    <p className="mt-2 max-w-2xl text-sm text-(--oat)">
      What shoppers say about their experience with us.
    </p>
  </div>


</div>

        {/* Slider */}
        <div
          className="relative mt-10 min-h-full sm:min-h-[260px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6"
            >
              {current.map((r) => (
                <ReviewCard key={r.id} r={r} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        {slideCount > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index
                    ? "w-8 bg-(--gold)"
                    : "w-2 bg-(--brown) hover:bg-(--oat)"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default GoogleReviewsSection;