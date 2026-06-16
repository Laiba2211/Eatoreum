import { Router } from "express";
import { requireAdmin } from "../middlewares/authAdmin.middleware.js";
import * as adminOrderController from "../controllers/adminOrder.controller.js";

const router = Router();

router.use(requireAdmin);

router.get("/", adminOrderController.listOrders);
router.get("/:orderId", adminOrderController.getOrder);

export default router;
