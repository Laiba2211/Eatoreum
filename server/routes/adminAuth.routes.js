import { Router } from "express";
import * as adminAuthController from "../controllers/adminAuth.controller.js";
import { requireAdmin } from "../middlewares/authAdmin.middleware.js";

const router = Router();

router.post("/login", adminAuthController.login);
router.get("/me", requireAdmin, adminAuthController.me);

export default router;
