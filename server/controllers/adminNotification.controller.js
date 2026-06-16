import mongoose from "mongoose";
import AdminNotification from "../models/AdminNotification.js";
import { parsePagination } from "../utils/productQueries.js";

function serialize(doc) {
  const o = doc?.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = o;
  return {
    id: String(_id),
    ...rest,
    meta: o.meta && typeof o.meta === "object" && !Array.isArray(o.meta) ? o.meta : {},
  };
}

/** GET /api/admin/notifications */
export async function listNotifications(req, res) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [rows, total] = await Promise.all([
      AdminNotification.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AdminNotification.countDocuments({}),
    ]);
    return res.json({
      items: rows.map(serialize),
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load notifications" });
  }
}

/** GET /api/admin/notifications/unread-count */
export async function unreadCount(req, res) {
  try {
    const unreadCount = await AdminNotification.countDocuments({ read: false });
    return res.json({ unreadCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load unread count" });
  }
}

/** PATCH /api/admin/notifications/:id/read */
export async function markRead(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid notification id" });
    }
    const doc = await AdminNotification.findByIdAndUpdate(id, { read: true }, { new: true }).lean();
    if (!doc) {
      return res.status(404).json({ message: "Notification not found" });
    }
    return res.json({ notification: serialize(doc) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not update notification" });
  }
}

/** POST /api/admin/notifications/read-all */
export async function markAllRead(req, res) {
  try {
    const result = await AdminNotification.updateMany({ read: false }, { $set: { read: true } });
    return res.json({ updated: result.modifiedCount ?? 0 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not mark all as read" });
  }
}
