import { Router } from "express";
import { requireAdmin } from "../middlewares/authAdmin.middleware.js";
import * as adminNotificationController from "../controllers/adminNotification.controller.js";

const router = Router();

router.use(requireAdmin);

router.get("/unread-count", adminNotificationController.unreadCount);
router.post("/read-all", adminNotificationController.markAllRead);
router.get("/", adminNotificationController.listNotifications);
router.patch("/:id/read", adminNotificationController.markRead);

export default router;
