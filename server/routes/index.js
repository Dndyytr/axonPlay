import express from "express";
import healthRoutes from "./healthRoutes.js";
import authRoutes from "./authRoutes.js";
import animeRoutes from "./animeRoutes.js";
import userRoutes from "./userRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import adminRoutes from "./adminRoutes.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "API v1 Running 🎬",
    endpoints: {
      health: "/api/v1/health",
    },
  });
});

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/anime", animeRoutes);
router.use("/users", userRoutes);
router.use("/reviews", reviewRoutes);
router.use("/admin", adminRoutes);

export default router;
