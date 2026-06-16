import { Router } from "express";
import { requireAdmin } from "../middlewares/authAdmin.middleware.js";
import * as adminReviewController from "../controllers/adminReview.controller.js";

const router = Router();

router.use(requireAdmin);

router.get("/", adminReviewController.listReviews);
router.delete("/:reviewId/replies/:replyId", adminReviewController.deleteReply);
router.delete("/:reviewId", adminReviewController.deleteReview);

export default router;
