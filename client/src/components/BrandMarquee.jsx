import { useLayoutEffect, useRef } from "react";
import { animate, motion, useMotionValue } from "framer-motion";

function MarqueeChunk() {
  return (
    <div
      className="flex shrink-0 items-center gap-6 px-8 sm:gap-10 sm:px-12"
      aria-hidden
    >
      <span className="whitespace-nowrap text-sm font-bold uppercase tracking-[0.2em] text-(--gold) sm:text-base">
        Eatoreum
      </span>
      <span className="text-(--brown) select-none">✦</span>
      <span className="whitespace-nowrap text-sm font-semibold uppercase tracking-[0.15em] text-(--cream) sm:text-base">
        Chatpatta masala
      </span>
      <span className="text-(--brown) select-none">✦</span>
      <span className="whitespace-nowrap text-sm font-semibold uppercase tracking-[0.15em] text-(--cream) sm:text-base">
        FitNashta
      </span>
      <span className="text-(--brown) select-none">✦</span>
      <span className="whitespace-nowrap text-sm font-bold uppercase tracking-[0.2em] text-(--gold) sm:text-base">
        Eatoreum
      </span>
      <span className="text-(--brown) select-none">✦</span>
      <span className="whitespace-nowrap text-sm font-semibold uppercase tracking-[0.15em] text-(--cream) sm:text-base">
        Chatpatta masala
      </span>
      <span className="text-(--brown) select-none">✦</span>
      <span className="whitespace-nowrap text-sm font-semibold uppercase tracking-[0.15em] text-(--cream) sm:text-base">
        FitNashta
      </span>
      <span className="text-(--brown) select-none">✦</span>
    </div>
  );
}

function BrandMarquee() {
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
        duration: Math.min(28, Math.max(14, w / 45)),
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
  }, [x]);

  return (
    <div
      className="cursor-default overflow-hidden bg-(--black)/55 py-3.5 sm:py-6"
      onPointerEnter={() => controlsRef.current?.pause()}
      onPointerLeave={() => controlsRef.current?.play()}
      role="presentation"
    >
      <motion.div
        ref={trackRef}
        className="flex w-max will-change-transform"
        style={{ x }}
      >
        <MarqueeChunk />
        <MarqueeChunk />
      </motion.div>
    </div>
  );
}

export default BrandMarquee;
