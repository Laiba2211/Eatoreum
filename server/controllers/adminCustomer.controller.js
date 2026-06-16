import mongoose from "mongoose";
import Customer from "../models/Customer.js";
import Order from "../models/Order.js";
import { escapeRegex, parsePagination } from "../utils/productQueries.js";
import { ensureCustomersBackfilled } from "../utils/backfillCustomersFromOrders.js";

function serializeCustomerSummary(c) {
  return {
    id: c._id,
    fullName: c.fullName ?? "",
    phone: c.phone ?? "",
    email: c.email ?? "",
    orderCount: c.orderCount ?? 0,
    lastOrderAt: c.lastOrderAt,
    firstOrderAt: c.firstOrderAt,
    createdAt: c.createdAt,
  };
}

function serializeOrderRow(o) {
  const shipping = o.shipping ?? {};
  const items = Array.isArray(o.items) ? o.items : [];
  const itemCount = items.reduce((sum, line) => sum + (line.quantity || 0), 0);
  return {
    id: o._id,
    orderNumber: o.orderNumber,
    status: o.status,
    subtotal: o.subtotal,
    currency: o.currency || "PKR",
    itemCount,
    lineCount: items.length,
    createdAt: o.createdAt,
    shippingName: shipping.fullName ?? "",
    shippingPhone: shipping.phone ?? "",
  };
}

/** GET /api/admin/customers */
export async function listCustomers(req, res) {
  try {
    await ensureCustomersBackfilled();

    const { page, limit, skip } = parsePagination(req.query);
    const filter = {};

    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ fullName: rx }, { phone: rx }, { email: rx }];
    }

    const [rows, total] = await Promise.all([
      Customer.find(filter).sort({ lastOrderAt: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Customer.countDocuments(filter),
    ]);

    return res.json({
      items: rows.map(serializeCustomerSummary),
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load customers" });
  }
}

/** GET /api/admin/customers/:customerId */
export async function getCustomer(req, res) {
  try {
    const { customerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: "Invalid customer id" });
    }

    const customer = await Customer.findById(customerId).lean();
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const orders = await Order.find({ customerId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({
      customer: serializeCustomerSummary(customer),
      orders: orders.map(serializeOrderRow),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load customer" });
  }
}
