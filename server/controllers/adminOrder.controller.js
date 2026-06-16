import mongoose from "mongoose";
import Order from "../models/Order.js";
import { escapeRegex, parsePagination } from "../utils/productQueries.js";

function serializeOrderSummary(o) {
  const shipping = o.shipping ?? {};
  const items = Array.isArray(o.items) ? o.items : [];
  const itemCount = items.reduce((sum, line) => sum + (line.quantity || 0), 0);
  return {
    id: o._id,
    ...(o.customerId ? { customerId: String(o.customerId) } : {}),
    orderNumber: o.orderNumber,
    status: o.status,
    subtotal: o.subtotal,
    currency: o.currency || "PKR",
    customer: shipping.fullName ?? "",
    phone: shipping.phone ?? "",
    itemCount,
    lineCount: items.length,
    createdAt: o.createdAt,
  };
}

function serializeOrderFull(o) {
  const shipping = o.shipping ?? {};
  return {
    id: o._id,
    ...(o.customerId ? { customerId: String(o.customerId) } : {}),
    orderNumber: o.orderNumber,
    status: o.status,
    subtotal: o.subtotal,
    currency: o.currency || "PKR",
    paymentMethod: o.paymentMethod,
    items: (o.items || []).map((line) => ({
      productId: line.productId ? String(line.productId) : "",
      name: line.name,
      slug: line.slug,
      price: line.price,
      quantity: line.quantity,
      image: line.image || "",
      lineTotal: line.price * line.quantity,
    })),
    shipping: {
      fullName: shipping.fullName,
      phone: shipping.phone,
      email: shipping.email,
      addressLine1: shipping.addressLine1,
      addressLine2: shipping.addressLine2,
      city: shipping.city,
      state: shipping.state,
      postalCode: shipping.postalCode,
      country: shipping.country,
    },
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

/** GET /api/admin/orders */
export async function listOrders(req, res) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = {};

    const status = typeof req.query.status === "string" ? req.query.status.trim() : "";
    const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (status && allowed.includes(status)) {
      filter.status = status;
    }

    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      filter.$or = [
        { orderNumber: rx },
        { "shipping.fullName": rx },
        { "shipping.phone": rx },
        { "shipping.email": rx },
      ];
    }

    const [rows, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(filter),
    ]);

    return res.json({
      items: rows.map(serializeOrderSummary),
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load orders" });
  }
}

/** GET /api/admin/orders/:orderId */
export async function getOrder(req, res) {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order id" });
    }
    const o = await Order.findById(orderId).lean();
    if (!o) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.json({ order: serializeOrderFull(o) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load order" });
  }
}
