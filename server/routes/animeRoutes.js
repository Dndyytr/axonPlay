import express from "express";
import {
  getTopAnime,
  getAnimeById,
  getAnimeEpisodes,
  searchAnime,
  getSeasonalAnime,
  getRandomAnime,
} from "../controllers/animeController.js";

const router = express.Router();

// Search endpoint (must be before /:id to avoid conflict)
router.get("/search", searchAnime);

// Public routes (no authentication required)
router.get("/", getTopAnime);
router.get("/search", searchAnime);
router.get("/random", getRandomAnime);
router.get("/season/:year/:season", getSeasonalAnime);
router.get("/:id", getAnimeById);
router.get("/:id/episodes", getAnimeEpisodes);

export default router;
