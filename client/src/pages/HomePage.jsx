import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import HomeHighlightsStrip from "../components/HomeHighlightsStrip";
import FeaturedProductHighlight from "../components/FeaturedProductHighlight";
import { fetchFeaturedPublishedProduct } from "./Shop/services/shopApi.js";

const ProductBenefitsSection = lazy(() => import("../components/ProductBenefitsSection"));
const BrandMarquee = lazy(() => import("../components/BrandMarquee"));
const GoogleReviewsSection = lazy(() => import("../components/GoogleReviewsSection"));
const FaqSection = lazy(() => import("../components/FaqSection"));

function SectionFallback() {
  return <div className="h-24 w-full" aria-hidden />;
}

function HomePage() {
  const [spotlightProduct, setSpotlightProduct] = useState(null);
  const [deferNonCritical, setDeferNonCritical] = useState(false);
  const deferredSentinelRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const featured = await fetchFeaturedPublishedProduct();
        if (cancelled) return;
        setSpotlightProduct(featured ?? null);
      } catch {
        if (!cancelled) setSpotlightProduct(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const node = deferredSentinelRef.current;
    if (!node) return;

    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        setDeferNonCritical(true);
        io.disconnect();
      },
      // Start loading these sections shortly before they come into view.
      { root: null, rootMargin: "350px 0px", threshold: 0.01 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div className="w-full">
      <section className="relative min-h-[90vh] w-full overflow-hidden bg-(--black)">
        <picture className="absolute inset-0 block min-h-[90vh] w-full">
          <source
            media="(max-width: 640px)"
            type="image/webp"
            srcSet="/hero-home-mobile.webp"
          />
          <source
            type="image/webp"
            srcSet="/hero-home-640.webp 640w, /hero-home-960.webp 960w, /hero-home-1280.webp 1280w, /hero-home-1920.webp 1920w"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
          />
          <img
            src="/1775491546732_Untitled-3.1.png"
            alt=""
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="async"
            className="h-full min-h-[90vh] w-full object-cover object-center"
          />
        </picture>
        <div className="absolute inset-0 bg-(--black)/65" />
        <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-7xl items-center px-6 py-20 sm:px-12 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex rounded-full border border-(--brown) bg-(--soft-black)/85 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-(--gold-light)">
              Welcome to Eatoreum
            </p>
            <h1 className="text-4xl font-bold uppercase leading-tight text-(--white) sm:text-5xl">
              Fresh groceries delivered to your doorstep.
            </h1>
            <p className="text-description mt-5 text-base text-(--oat) sm:text-lg">
            Discover Exclusive Daily Deals, Browse Our Full Range Of Fresh Groceries And Health Products, And Enjoy A Seamless Shopping Experience — No Account Required To Explore Everything
                      </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex rounded-lg bg-(--gold) px-5 py-3 text-sm font-semibold text-(--on-primary) transition hover:bg-(--gold-dark)"
              >
                Shop Now
              </Link>
              <Link
                to="/shop?sort=price-asc"
                className="inline-flex rounded-lg border border-(--oat) px-5 py-3 text-sm font-semibold text-(--cream) transition hover:border-(--gold-light) hover:text-(--gold-light)"
              >
                Explore Deals
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HomeHighlightsStrip />


      <FeaturedProductHighlight product={spotlightProduct} />
      <div ref={deferredSentinelRef} className="h-1 w-full" aria-hidden />

      <Suspense fallback={<SectionFallback />}>
        {deferNonCritical ? <ProductBenefitsSection /> : <SectionFallback />}
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        {deferNonCritical ? <BrandMarquee /> : <SectionFallback />}
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        {deferNonCritical ? <GoogleReviewsSection /> : <SectionFallback />}
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        {deferNonCritical ? <FaqSection /> : <SectionFallback />}
      </Suspense>
    </div>
  );
}

export default HomePage;
