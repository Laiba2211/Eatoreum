import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { makeOrderNumber, resolveCartLines } from "../utils/storeOrderLines.js";
import { upsertCustomerFromShipping } from "../utils/upsertCustomerFromOrder.js";
import { trySendOrderConfirmation } from "../utils/orderConfirmationEmail.js";
import { notifyNewStoreOrder } from "../utils/adminNotify.js";

function normalizeShipping(body) {
  const s = body ?? {};
  return {
    fullName: String(s.fullName ?? "").trim(),
    phone: String(s.phone ?? "").trim(),
    email: String(s.email ?? "").trim(),
    addressLine1: String(s.addressLine1 ?? "").trim(),
    addressLine2: String(s.addressLine2 ?? "").trim(),
    city: String(s.city ?? "").trim(),
    state: String(s.state ?? "").trim(),
    postalCode: String(s.postalCode ?? "").trim(),
    country: String(s.country ?? "Pakistan").trim() || "Pakistan",
  };
}

function shippingErrors(sh) {
  const e = {};
  if (!sh.fullName) e.fullName = "Required";
  if (!sh.phone) e.phone = "Required";
  if (!sh.addressLine1) e.addressLine1 = "Required";
  if (!sh.city) e.city = "Required";
  if (!sh.state) e.state = "Required";
  if (!sh.postalCode) e.postalCode = "Required";
  return e;
}

function serializeOrder(doc) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, items, customerId, ...rest } = o;
  return {
    id: _id,
    ...(customerId ? { customerId: String(customerId) } : {}),
    ...rest,
    items: (items || []).map((line) => ({
      productId: String(line.productId),
      name: line.name,
      slug: line.slug,
      price: line.price,
      quantity: line.quantity,
      image: line.image,
      lineTotal: line.price * line.quantity,
    })),
  };
}

/** POST /api/orders — COD checkout, decrements stock */
export async function createOrder(req, res) {
  try {
    const { items, shipping: shippingRaw, paymentMethod } = req.body ?? {};

    if (paymentMethod !== "cod") {
      return res.status(400).json({ message: "Only cash on delivery (cod) is supported" });
    }

    const shipping = normalizeShipping(shippingRaw);
    const shipErr = shippingErrors(shipping);
    if (Object.keys(shipErr).length) {
      return res.status(400).json({ message: "Invalid shipping address", fields: shipErr });
    }

    const { lines, subtotal, currency } = await resolveCartLines(items, { requireStock: true });

    const customerId = await upsertCustomerFromShipping(shipping);

    const order = await Order.create({
      customerId,
      orderNumber: makeOrderNumber(),
      status: "pending",
      items: lines,
      subtotal,
      currency,
      paymentMethod: "cod",
      shipping,
    });

    for (const line of lines) {
      await Product.updateOne({ _id: line.productId }, { $inc: { stock: -line.quantity } });
    }

    const orderPayload = serializeOrder(order);
    void trySendOrderConfirmation(shipping, orderPayload);
    void notifyNewStoreOrder(order);

    return res.status(201).json({ order: orderPayload });
  } catch (err) {
    if (err.message === "PHONE_KEY_EMPTY") {
      return res.status(400).json({ message: "Invalid phone number for customer record" });
    }
    if (err.code === "EMPTY_CART") {
      return res.status(400).json({ message: err.message });
    }
    if (["BAD_PRODUCT_ID", "BAD_QTY", "NOT_AVAILABLE", "STOCK"].includes(err.code)) {
      return res.status(400).json({ message: err.message });
    }
    if (err.code === 11000 || err.code === "11000") {
      return res.status(409).json({ message: "Order number conflict — please retry" });
    }
    console.error(err);
    return res.status(500).json({ message: "Could not place order" });
  }
}
