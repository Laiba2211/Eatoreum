import { Router } from "express";
import * as productReviewController from "../controllers/productReview.controller.js";

const router = Router();

router.get("/:idOrSlug/reviews", productReviewController.listReviews);
router.post("/:idOrSlug/reviews", productReviewController.createReview);
router.post("/:idOrSlug/reviews/:reviewId/replies", productReviewController.createReply);

export default router;
