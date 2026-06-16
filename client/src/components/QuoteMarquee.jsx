import { useLayoutEffect, useRef } from "react";
import { animate, motion, useMotionValue } from "framer-motion";

const DEFAULT_TEXT = "Good mornings start with good food.";

function MarqueeChunk({ text }) {
  return (
    <div
      className="flex shrink-0 items-center gap-8 px-10 sm:gap-12 sm:px-14"
      aria-hidden
    >
      <span className="whitespace-nowrap font-serif text-lg italic text-(--cream) sm:text-xl md:text-2xl">
        “{text}”
      </span>
      <span className="select-none text-(--brown)">✦</span>
    </div>
  );
}

/**
 * Infinite horizontal marquee for a short quote (About page, etc.).
 */
function QuoteMarquee({ text = DEFAULT_TEXT }) {
  const x = useMotionValue(0);
  const trackRef = useRef(null);
  const controlsRef = useRef(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const start = () => {
      const first = track.firstElementChild;
      const w = first?.getBoundingClientRect().width ?? 0;
      if (w <= 0) return;

      controlsRef.current?.stop();
      x.set(0);

      controlsRef.current = animate(x, [0, -w], {
        duration: Math.min(32, Math.max(18, w / 40)),
        repeat: Infinity,
        ease: "linear",
        repeatType: "loop",
      });
    };

    start();
    const ro = new ResizeObserver(start);
    ro.observe(track);
    window.addEventListener("load", start);

    return () => {
      ro.disconnect();
      window.removeEventListener("load", start);
      controlsRef.current?.stop();
    };
  }, [x, text]);

  return (
    <section className="mb-16 border-y border-(--brown)/30 bg-(--black) py-6 sm:py-8" aria-label={text}>
      <div
        className="cursor-default overflow-hidden"
        onPointerEnter={() => controlsRef.current?.pause()}
        onPointerLeave={() => controlsRef.current?.play()}
        role="presentation"
      >
        <motion.div ref={trackRef} className="flex w-max will-change-transform" style={{ x }}>
          <MarqueeChunk text={text} />
          <MarqueeChunk text={text} />
          <MarqueeChunk text={text} />
          <MarqueeChunk text={text} />
        </motion.div>
      </div>
    </section>
  );
}

export default QuoteMarquee;
