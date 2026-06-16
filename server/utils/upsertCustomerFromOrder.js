import Customer, { normalizePhoneKey } from "../models/Customer.js";

/**
 * Creates or updates a customer from checkout shipping (matched by phone digits).
 * Uses upsert to avoid duplicate-key races on concurrent checkouts.
 * @returns {Promise<import("mongoose").Types.ObjectId>}
 */
export async function upsertCustomerFromShipping(shipping) {
  const phoneKey = normalizePhoneKey(shipping.phone);
  if (!phoneKey) {
    throw new Error("PHONE_KEY_EMPTY");
  }

  const email = String(shipping.email ?? "").trim().toLowerCase();
  const now = new Date();
  const fullName = String(shipping.fullName ?? "").trim();
  const phone = String(shipping.phone ?? "").trim();

  const doc = await Customer.findOneAndUpdate(
    { phoneKey },
    {
      $set: {
        fullName,
        phone,
        ...(email ? { email } : {}),
        lastOrderAt: now,
      },
      $inc: { orderCount: 1 },
      $setOnInsert: {
        phoneKey,
        firstOrderAt: now,
      },
    },
    { returnDocument: "after", upsert: true, runValidators: true }
  );

  return doc._id;
}
