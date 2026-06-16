import { Router } from "express";
import { requireAdmin } from "../middlewares/authAdmin.middleware.js";
import { handleProductImageUpload } from "../middlewares/multerProduct.js";
import * as adminUploadController from "../controllers/adminUpload.controller.js";

const router = Router();

router.use(requireAdmin);
router.post("/product-image", handleProductImageUpload, adminUploadController.postProductImage);

export default router;
