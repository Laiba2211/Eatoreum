/** Demo orders for account UI — replace with API data later. */

export const mockOrders = [
  {
    id: "EO-10042",
    date: "2026-04-28",
    total: 498,
    status: "Delivered",
    itemCount: 3,
    items: [
      { name: "Hass Avocados (pack of 4)", qty: 1, lineTotal: 189 },
      { name: "Whole Milk 1L", qty: 2, lineTotal: 124 },
      { name: "Basmati Rice 1kg", qty: 1, lineTotal: 185 },
    ],
  },
  {
    id: "EO-10041",
    date: "2026-04-15",
    total: 678,
    status: "Shipped",
    itemCount: 2,
    items: [
      { name: "Chatpata Masala Oats", qty: 1, lineTotal: 599 },
      { name: "Organic Bananas (1 dozen)", qty: 1, lineTotal: 79 },
    ],
  },
  {
    id: "EO-10038",
    date: "2026-03-02",
    total: 130,
    status: "Delivered",
    itemCount: 2,
    items: [{ name: "Cherry Tomatoes 250g", qty: 2, lineTotal: 130 }],
  },
];

export function getMockOrderById(orderId) {
  return mockOrders.find((o) => o.id === orderId) ?? null;
}
