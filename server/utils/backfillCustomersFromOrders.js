import Order from "../models/Order.js";
import { upsertCustomerFromShipping } from "./upsertCustomerFromOrder.js";
import { normalizePhoneKey } from "../models/Customer.js";

/** Max orders to link per run — avoids loading huge arrays / proxy timeouts (502). */
const BATCH_SIZE = 100;

/** @type {Promise<{ processed: number; linked: number }> | null} */
let inFlight = null;

const linkableFilter = {
  $or: [{ customerId: { $exists: false } }, { customerId: null }],
  "shipping.phone": /\d/,
};

/**
 * Links up to BATCH_SIZE orders missing customerId (same rules as checkout).
 * Call repeatedly until no linkable orders remain.
 */
export async function backfillOrdersMissingCustomerId() {
  const rows = await Order.find(linkableFilter)
    .select("_id shipping")
    .sort({ createdAt: 1 })
    .limit(BATCH_SIZE)
    .lean();

  let linked = 0;

  for (const o of rows) {
    const phoneKey = normalizePhoneKey(o.shipping?.phone);
    if (!phoneKey) continue;
    try {
      const customerId = await upsertCustomerFromShipping(o.shipping);
      await Order.updateOne({ _id: o._id }, { $set: { customerId } });
      linked += 1;
    } catch (err) {
      console.error("[backfillCustomersFromOrders]", String(o._id), err?.message ?? err);
    }
  }

  return { processed: rows.length, linked };
}

/**
 * Runs one bounded backfill batch at most once concurrently when linkable orders exist.
 * Never throws — failures are logged so admin list handlers still respond.
 */
export async function ensureCustomersBackfilled() {
  try {
    const pendingLinkable = await Order.countDocuments(linkableFilter);
    if (pendingLinkable === 0) return { skipped: true, pendingLinkable: 0 };

    if (!inFlight) {
      inFlight = backfillOrdersMissingCustomerId().finally(() => {
        inFlight = null;
      });
    }
    const result = await inFlight;
    return { skipped: false, pendingLinkable, ...result };
  } catch (err) {
    console.error("[ensureCustomersBackfilled]", err?.message ?? err);
    return { skipped: true, error: true };
  }
}
