import { Router } from "express";
import * as productController from "../controllers/product.controller.js";

const router = Router();

router.get("/", productController.listPublishedProducts);
router.get("/:idOrSlug", productController.getPublishedProduct);

export default router;
