import { Router } from "express";
import { requireAdmin } from "../middlewares/authAdmin.middleware.js";
import * as adminCategoryController from "../controllers/adminCategory.controller.js";

const router = Router();

router.use(requireAdmin);

router.get("/", adminCategoryController.listAdminCategories);
router.post("/", adminCategoryController.createAdminCategory);

export default router;
