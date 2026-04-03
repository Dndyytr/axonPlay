import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getHistory,
  updateHistory,
  clearHistory,
  removeFromHistory,
} from "../controllers/userController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Watchlist routes
router.get("/watchlist", getWatchlist);
router.post("/watchlist", addToWatchlist);
router.delete("/watchlist/:id", removeFromWatchlist);

// History routes
router.get("/history", getHistory);
router.patch("/history", updateHistory);
router.delete("/history", clearHistory);
router.delete("/history/:id", removeFromHistory);

export default router;
