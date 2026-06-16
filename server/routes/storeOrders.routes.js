import { Router } from "express";
import * as storeOrderController from "../controllers/storeOrder.controller.js";

const router = Router();

router.post("/", storeOrderController.createOrder);

export default router;
