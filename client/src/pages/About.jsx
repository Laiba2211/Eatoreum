import { Link } from "react-router-dom";
import QuoteMarquee from "../components/QuoteMarquee";

function About() {
  return (
    <div className="bg-(--soft-black) text-(--cream)">

      {/* ================= HERO ================= */}
      <section className="relative flex h-[60vh] items-center justify-center px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-(--black) via-(--black)/70 to-(--black)" />

        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-(--ink) sm:text-5xl">
            Fresh Nashta, Delivered Daily
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-(--gray)">
            From early mornings to busy days — we bring fresh, hygienic, and
            delicious food right to your doorstep.
          </p>
        </div>
      </section>

      <QuoteMarquee />


      {/* ================= STORY ================= */}
      <section className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        
        <div>
          <h2 className="mb-6 text-3xl font-semibold text-(--ink)">Our Story</h2>
          <p className="mb-4 leading-relaxed text-(--gray)">
            It started with a simple problem — finding fresh, quality nashta
            every morning wasn’t easy. Either it was too oily, not fresh,
            or simply unavailable on time.
          </p>
          <p className="leading-relaxed text-(--gray)">
            We built this platform to solve that. Now, you can enjoy clean,
            tasty, and freshly prepared food without the hassle — every single day.
          </p>
        </div>

        <div className="relative h-80 overflow-hidden rounded-2xl border border-(--brown)/30 bg-(--card)">
          <img
            src="/craiyon_103457_image.png"
            alt="Fresh food and groceries from Eatoreum"
            className="h-full w-full object-contain"
            loading="lazy"
          />
        </div>
      </section>

      {/* ================= VALUES ================= */}
      <section className="bg-(--black) px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">

          <h2 className="mb-12 text-3xl font-semibold text-(--ink)">What We Promise</h2>

          <div className="grid md:grid-cols-3 gap-8">

            {[
              {
                title: "Freshness",
                desc: "Prepared daily with quality ingredients."
              },
              {
                title: "Hygiene",
                desc: "Clean kitchens and safe food practices."
              },
              {
                title: "Convenience",
                desc: "Quick delivery right to your home."
              }
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl border border-(--brown)/30 bg-(--soft-black) p-6 transition hover:border-(--gold)/50"
              >
                <h3 className="mb-3 text-lg font-semibold text-(--gold)">
                  {item.title}
                </h3>
                <p className="text-sm text-(--gray)">{item.desc}</p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ================= PROCESS ================= */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="mb-12 text-center text-3xl font-semibold text-(--ink)">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-10 text-center">

          {[
            "Select your favorite nashta items",
            "We prepare fresh on order",
            "Delivered & ready to enjoy"
          ].map((step, i) => (
            <div key={i}>
              <div className="mb-4 text-4xl font-bold text-(--gold)">
                0{i + 1}
              </div>
              <p className="text-(--gray)">{step}</p>
            </div>
          ))}

        </div>
      </section>



      {/* ================= STATS ================= */}
      <section className="bg-(--black) px-6 py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

          {[
            { num: "5K+", label: "Happy Customers" },
            { num: "4.7★", label: "Customer Rating" },
            { num: "30+", label: "Menu Items" },
            { num: "Daily", label: "Fresh Preparation" }
          ].map((item, i) => (
            <div key={i}>
              <h3 className="text-2xl font-bold text-(--gold)">
                {item.num}
              </h3>
              <p className="text-sm text-(--gray)">{item.label}</p>
            </div>
          ))}

        </div>
      </section>


      {/* ================= CTA ================= */}
      <section className="border-t border-(--brown)/30 px-6 py-20 text-center">
        <h2 className="mb-4 text-3xl font-semibold text-(--ink)">
          Start Your Day Right
        </h2>
        <p className="mb-6 text-(--gray)">
          Order fresh nashta now and enjoy quality at your doorstep.
        </p>

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

export default About;