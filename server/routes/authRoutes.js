import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
  logout,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", protect, getMe);
router.patch("/update-profile", updateProfile);
router.patch("/change-password", changePassword);
router.delete("/delete-account", deleteAccount);
router.post("/logout", protect, logout);

export default router;
