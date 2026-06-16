import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";

const STATUS_ORDER = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const RECENT_ORDERS_LIMIT = 5;

function padDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function lastNDaysKeys(n) {
  const keys = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    keys.push(padDateKey(d));
  }
  return keys;
}

function chartRangeStart(dayKeys) {
  const [y, m, d] = dayKeys[0].split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/** GET /api/admin/dashboard */
export async function getDashboard(req, res) {
  try {
    const chartDays = 14;
    const dayKeys = lastNDaysKeys(chartDays);
    const rangeStart = chartRangeStart(dayKeys);

    const [
      productTotal,
      productPublished,
      productLowStock,
      productOutOfStock,
      orderTotal,
      customerTotal,
      revenueByCurrency,
      statusBreakdown,
      ordersByDayRaw,
      recentOrders,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isPublished: true }),
      Product.countDocuments({ isPublished: true, stock: { $lte: 5, $gt: 0 } }),
      Product.countDocuments({ isPublished: true, stock: 0 }),
      Order.countDocuments(),
      Customer.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: "$currency", revenue: { $sum: "$subtotal" } } },
      ]),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: rangeStart } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(RECENT_ORDERS_LIMIT)
        .select("orderNumber status subtotal currency createdAt shipping.fullName")
        .lean(),
    ]);

    const countByDay = new Map(ordersByDayRaw.map((r) => [r._id, r.count]));
    const ordersByDay = dayKeys.map((date) => ({ date, count: countByDay.get(date) ?? 0 }));

    const statusMap = new Map(statusBreakdown.map((r) => [r._id, r.count]));
    const ordersByStatus = STATUS_ORDER.map((status) => ({
      status,
      count: statusMap.get(status) ?? 0,
    }));

    let primaryCurrency = "PKR";
    let revenueTotal = 0;
    for (const row of revenueByCurrency) {
      const c = (row._id && String(row._id).trim()) || "PKR";
      const rev = Number(row.revenue) || 0;
      if (rev > revenueTotal) {
        revenueTotal = rev;
        primaryCurrency = c.toUpperCase();
      }
    }
    if (revenueTotal === 0 && revenueByCurrency.length) {
      const first = revenueByCurrency[0];
      primaryCurrency = String(first._id || "PKR").toUpperCase();
      revenueTotal = Number(first.revenue) || 0;
    }

    const revenueByCurrencyOut = revenueByCurrency.map((r) => ({
      currency: String(r._id || "PKR").toUpperCase(),
      revenue: Number(r.revenue) || 0,
    }));

    return res.json({
      generatedAt: new Date().toISOString(),
      products: {
        total: productTotal,
        published: productPublished,
        lowStockPublished: productLowStock,
        outOfStockPublished: productOutOfStock,
      },
      orders: {
        total: orderTotal,
        byStatus: ordersByStatus,
      },
      customers: { total: customerTotal },
      revenue: {
        primaryCurrency,
        primaryTotal: revenueTotal,
        byCurrency: revenueByCurrencyOut,
      },
      ordersByDay,
      recentOrders: recentOrders.map((o) => ({
        id: o._id,
        orderNumber: o.orderNumber,
        status: o.status,
        subtotal: o.subtotal,
        currency: o.currency || "PKR",
        placedAt: o.createdAt,
        customerName: o.shipping?.fullName ?? "",
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load dashboard" });
  }
}
