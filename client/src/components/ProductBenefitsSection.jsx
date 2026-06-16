import {
  FiClock,
  FiHeart,
  FiLayers,
  FiShield,
} from "react-icons/fi";

const benefits = [
  {
    id: "nutrition",
    title: "Balanced nutrition",
    description:
      "Thoughtfully blended ingredients to support everyday energy without compromising on taste.",
    Icon: FiHeart,
  },
  {
    id: "natural",
    title: "Clean label focus",
    description:
      "No unnecessary fillers — what you read on the pack is what you get in every serving.",
    Icon: FiShield,
  },
  {
    id: "convenience",
    title: "Ready in minutes",
    description:
      "Perfect for busy mornings: quick prep so you can eat well even on a tight schedule.",
    Icon: FiClock,
  },
  {
    id: "variety",
    title: "Stackable with meals",
    description:
      "Pairs with roti, oats, or a light bowl — flexible enough for the whole family.",
    Icon: FiLayers,
  },
];

function ProductBenefitsSection() {
  return (
    <section className="bg-(--soft-black)" aria-labelledby="product-benefits-heading">
      <div className="mx-auto max-w-7xl px-6 py-4 sm:px-14 sm:py-4 mb-8">
        <h2
          id="product-benefits-heading"
          className="text-start text-2xl font-bold text-(--gold) sm:text-3xl"
        >
          Product benefits
        </h2>
        <p className="text-description mx-auto mt-3 text-start text-sm">
          Why customers keep this range in their kitchen rotation.
        </p>

        <ul className="mt-12 grid gap-10 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-12">
          {benefits.map(({ id, title, description, Icon }) => (
            <li key={id} className="flex gap-4 sm:gap-5">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-(--gold)/12 text-(--gold) sm:h-14 sm:w-14"
                aria-hidden
              >
                <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 pt-0.5">
                <h3 className="text-base font-semibold text-(--cream) sm:text-lg">{title}</h3>
                <p className="text-description mt-2 text-sm leading-relaxed">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default ProductBenefitsSection;
