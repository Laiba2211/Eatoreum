import { Router } from "express";
import { requireAdmin } from "../middlewares/authAdmin.middleware.js";
import * as adminProductController from "../controllers/adminProduct.controller.js";

const router = Router();

router.use(requireAdmin);

router.get("/", adminProductController.listProducts);
router.post("/", adminProductController.createProduct);
router.get("/:idOrSlug", adminProductController.getProduct);
router.patch("/:idOrSlug", adminProductController.updateProduct);
router.delete("/:idOrSlug", adminProductController.deleteProduct);

export default router;
