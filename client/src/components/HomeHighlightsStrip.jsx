import { FiAward, FiMapPin, FiTag, FiTruck } from "react-icons/fi";

const highlights = [
  { id: "pickup", label: "Pick Up", Icon: FiMapPin },
  { id: "delivery", label: "Fastest Delivery", Icon: FiTruck },
  { id: "offers", label: "Best Offer Zone", Icon: FiTag },
  { id: "quality", label: "Best Quality", Icon: FiAward },
];

function HomeHighlightsStrip() {
  return (
    <section className="bg-(--soft-black)">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">

        {/* Grid */}
        <ul className="grid grid-cols-4 gap-12 sm:grid-cols-4 sm:gap-12 lg:gap-16">

          {highlights.map(({ id, label, Icon }) => (
            <li
              key={id}
              className="group flex flex-col items-center text-center transition duration-300"
            >

              {/* Icon Wrapper */}
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-(--black)/40 backdrop-blur-md transition-all duration-300 group-hover:scale-105">

                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-(--gold)/20 to-transparent opacity-0 blur-md transition duration-300 group-hover:opacity-100" />

                {/* Icon */}
                <Icon
                  className="relative h-8 w-8 text-(--gold)"
                  strokeWidth={1.6}
                />
              </div>

              {/* Label */}
              <p className="mt-5 text-xs font-medium tracking-wide whitespace-nowrap text-(--cream) transition group-hover:text-(--gold-light)">
                {label}
              </p>

              {/* Subtle underline animation */}
              <span className="mt-2 h-[2px] w-0 bg-(--gold) transition-all duration-300 group-hover:w-6 rounded-full" />
            </li>
          ))}

        </ul>
      </div>
    </section>
  );
}

export default HomeHighlightsStrip;