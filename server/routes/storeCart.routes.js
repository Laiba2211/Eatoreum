import { Router } from "express";
import * as storeCartController from "../controllers/storeCart.controller.js";

const router = Router();

router.post("/validate", storeCartController.validateCart);

export default router;
