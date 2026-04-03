import express from "express";
import {
  getAnimeReviews,
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
  markHelpful,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public route - Get reviews for anime
router.get("/anime/:animeId", getAnimeReviews);

// Protected routes
router.use(protect);

// User's own reviews
router.get("/my-reviews", getMyReviews);

// Create review
router.post("/", createReview);

// Update/Delete own review
router.route("/:id").patch(updateReview).delete(deleteReview);

// Mark review as helpful
router.post("/:id/helpful", markHelpful);

export default router;
