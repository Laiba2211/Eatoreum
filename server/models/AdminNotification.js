import mongoose from "mongoose";

const TYPES = ["order_received", "review_new", "review_reply"];

const adminNotificationSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: TYPES, index: true },
    read: { type: Boolean, default: false, index: true },
    title: { type: String, required: true, trim: true, maxlength: 220 },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

adminNotificationSchema.index({ createdAt: -1 });

const AdminNotification = mongoose.model("AdminNotification", adminNotificationSchema);
export default AdminNotification;
