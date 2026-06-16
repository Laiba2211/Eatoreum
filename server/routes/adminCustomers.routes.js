import { Router } from "express";
import { requireAdmin } from "../middlewares/authAdmin.middleware.js";
import * as adminCustomerController from "../controllers/adminCustomer.controller.js";

const router = Router();

router.use(requireAdmin);

router.get("/", adminCustomerController.listCustomers);
router.get("/:customerId", adminCustomerController.getCustomer);

export default router;
