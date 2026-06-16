/** Mock catalog — no auth required */

export const categories = [
  { id: "fruits", name: "Fruits", description: "Seasonal picks" },
  { id: "vegetables", name: "Vegetables", description: "Farm fresh" },
  { id: "dairy", name: "Dairy", description: "Milk & more" },
  { id: "bakery", name: "Bakery", description: "Daily baked" },
  { id: "pantry", name: "Pantry", description: "Staples" },
];

export const promotions = [
  {
    id: "1",
    title: "Weekend Fresh",
    subtitle: "Up to 25% off produce",
    cta: "Shop produce",
    href: "/shop?category=fruits",
    accent: "from-(--gold)/20 to-transparent",
  },
  {
    id: "2",
    title: "Dairy bundle",
    subtitle: "Save on milk, cheese & yogurt",
    cta: "View dairy",
    href: "/shop?category=dairy",
    accent: "from-(--brown)/30 to-transparent",
  },
  {
    id: "3",
    title: "Free delivery",
    subtitle: "On orders over ₹499",
    cta: "Start shopping",
    href: "/shop",
    accent: "from-(--oat)/20 to-transparent",
  },
];

const img = (seed, w = 600, h = 600) =>
  `https://picsum.photos/seed/eatoreum-${seed}/${w}/${h}`;

export const products = [
  {
    id: "p1",
    slug: "hass-avocados",
    name: "Hass Avocados (pack of 4)",
    price: 189,
    categoryId: "fruits",
    featured: true,
    description:
      "Creamy Hass avocados, ripe-ready. Perfect for toast, salads, and guacamole. Source: trusted partner farms.",
    images: [img("av1"), img("av2"), img("av3")],
    rating: 4.6,
    reviewCount: 128,
    reviews: [
      { id: "r1", author: "Meera K.", rating: 5, text: "Consistently good ripeness.", date: "2026-04-10" },
      { id: "r2", author: "Arjun S.", rating: 4, text: "One was a bit firm but tasted great after 2 days.", date: "2026-04-05" },
    ],
  },
  {
    id: "p2",
    slug: "organic-bananas",
    name: "Organic Bananas (1 dozen)",
    price: 79,
    categoryId: "fruits",
    featured: true,
    description: "Sweet organic bananas. Ideal for smoothies and snacking.",
    images: [img("bn1"), img("bn2")],
    rating: 4.8,
    reviewCount: 312,
    reviews: [
      { id: "r3", author: "Priya M.", rating: 5, text: "Always fresh.", date: "2026-04-12" },
    ],
  },
  {
    id: "p3",
    slug: "cherry-tomatoes",
    name: "Cherry Tomatoes 250g",
    price: 65,
    categoryId: "vegetables",
    featured: true,
    description: "Juicy cherry tomatoes for salads and roasting.",
    images: [img("ct1")],
    rating: 4.4,
    reviewCount: 89,
    reviews: [{ id: "r4", author: "Rahul V.", rating: 4, text: "Good flavor.", date: "2026-03-28" }],
  },
  {
    id: "p4",
    slug: "baby-spinach",
    name: "Baby Spinach 200g",
    price: 55,
    categoryId: "vegetables",
    featured: false,
    description: "Triple-washed baby spinach. Ready to use.",
    images: [img("sp1")],
    rating: 4.5,
    reviewCount: 56,
    reviews: [],
  },
  {
    id: "p5",
    slug: "whole-milk-1l",
    name: "Whole Milk 1L",
    price: 62,
    categoryId: "dairy",
    featured: true,
    description: "Pasteurized whole milk. Keep refrigerated.",
    images: [img("ml1")],
    rating: 4.7,
    reviewCount: 401,
    reviews: [{ id: "r5", author: "Anita D.", rating: 5, text: "Fresh every time.", date: "2026-04-01" }],
  },
  {
    id: "p6",
    slug: "greek-yogurt",
    name: "Greek Yogurt 400g",
    price: 120,
    categoryId: "dairy",
    featured: false,
    description: "Thick Greek-style yogurt, high protein.",
    images: [img("yg1"), img("yg2")],
    rating: 4.3,
    reviewCount: 77,
    reviews: [],
  },
  {
    id: "p7",
    slug: "sourdough-loaf",
    name: "Sourdough Loaf",
    price: 149,
    categoryId: "bakery",
    featured: true,
    description: "Artisan sourdough baked daily. Crusty outside, soft inside.",
    images: [img("sd1")],
    rating: 4.9,
    reviewCount: 203,
    reviews: [{ id: "r6", author: "Kiran L.", rating: 5, text: "Best bread in town.", date: "2026-04-15" }],
  },
  {
    id: "p8",
    slug: "basmati-rice-1kg",
    name: "Basmati Rice 1kg",
    price: 185,
    categoryId: "pantry",
    featured: false,
    description: "Long-grain basmati rice, aged for aroma.",
    images: [img("rc1")],
    rating: 4.6,
    reviewCount: 164,
    reviews: [],
  },
  {
    id: "p9",
    slug: "extra-virgin-olive-oil",
    name: "Extra Virgin Olive Oil 500ml",
    price: 449,
    categoryId: "pantry",
    featured: false,
    description: "Cold-pressed extra virgin olive oil for cooking and dressing.",
    images: [img("ol1")],
    rating: 4.5,
    reviewCount: 92,
    reviews: [],
  },
  {
    id: "p10",
    slug: "mixed-berries",
    name: "Mixed Berries 300g",
    price: 299,
    categoryId: "fruits",
    featured: true,
    description: "Strawberries, blueberries, raspberries — frozen at peak.",
    images: [img("br1")],
    rating: 4.2,
    reviewCount: 45,
    reviews: [],
  },
  {
    id: "eo-chatpata",
    slug: "chatpata-masala-oats",
    name: "Chatpata Masala Oats",
    price: 599,
    categoryId: "pantry",
    featured: true,
    description:
      "Signature oats & spice fusion — where taste meets health. Wholegrain, energy booster, high fiber, heart healthy, clean nutrition.",
    images: ["/craiyon_103640_image.png"],
    tags: ["Pantry", "Masala oats"],
    rating: 4.8,
    reviewCount: 124,
    reviews: [
      {
        id: "eo-r1",
        author: "Sana A.",
        rating: 5,
        text: "Bold masala flavour — our go-to breakfast now.",
        date: "2026-04-20",
      },
    ],
  },
  {
    id: "eo-fitnashta",
    slug: "fitnashta",
    name: "Fitnashta",
    price: 649,
    categoryId: "pantry",
    featured: true,
    description:
      "Signature oats & nuts fusion. Nature's best in one spoon — wholegrain, energy booster, high fiber, protein packed, heart healthy.",
    images: ["/craiyon_103457_image.png"],
    tags: ["Pantry", "Oats & nuts"],
    rating: 4.9,
    reviewCount: 98,
    reviews: [
      {
        id: "eo-r2",
        author: "Rohan P.",
        rating: 5,
        text: "Crunchy nuts, not too sweet — great with milk.",
        date: "2026-04-18",
      },
    ],
  },
];

/** Only these appear on the Shop grid (packaging hero SKUs). */
export const shopPageProductSlugs = ["chatpata-masala-oats", "fitnashta"];

export function getProductBySlug(slug) {
  return products.find((p) => p.slug === slug) ?? null;
}

export function getCategoryName(categoryId) {
  return categories.find((c) => c.id === categoryId)?.name ?? categoryId;
}
