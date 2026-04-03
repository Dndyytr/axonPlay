import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getDashboardStats,
} from "../controllers/adminController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(restrictTo("admin"));

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

export default router;
