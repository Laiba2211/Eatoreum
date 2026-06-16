import { Router } from "express";
import { requireAdmin } from "../middlewares/authAdmin.middleware.js";
import * as adminDashboardController from "../controllers/adminDashboard.controller.js";

const router = Router();

router.use(requireAdmin);

router.get("/", adminDashboardController.getDashboard);

export default router;
