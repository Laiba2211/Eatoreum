import mongoose from "mongoose";

/** Digits-only key for matching checkout phones across formatting. */
export function normalizePhoneKey(phone) {
  return String(phone ?? "").replace(/\D/g, "");
}

const customerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    phoneKey: { type: String, required: true, unique: true, index: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    orderCount: { type: Number, default: 0, min: 0 },
    firstOrderAt: { type: Date },
    lastOrderAt: { type: Date },
  },
  { timestamps: true }
);

customerSchema.index({ lastOrderAt: -1 });
customerSchema.index({ email: 1 }, { sparse: true });

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
