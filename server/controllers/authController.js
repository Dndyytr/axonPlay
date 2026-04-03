import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";

// 🔑 Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// 📝 Register New User
export const register = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    return next(
      new AppError(
        existingUser.email === email
          ? "Email already registered"
          : "Username already taken",
        400,
      ),
    );
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
  });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    status: "success",
    message: "User registered successfully",
    data: {
      user: user.getPublicProfile(),
      token,
    },
  });
});

// 🔐 Login User
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // Find user with password field
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    status: "success",
    message: "Login successful",
    data: {
      user: user.getPublicProfile(),
      token,
    },
  });
});

// Get Current User Profile
export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user: user.getPublicProfile() },
  });
});

// Update User Profile
export const updateProfile = catchAsync(async (req, res, next) => {
  const { username, email, avatar } = req.body;
  const userId = req.user.id;

  // Check if email or username already exists (excluding current user)
  const existingUser = await User.findOne({
    _id: { $ne: userId },
    $or: [{ email: email }, { username: username }],
  });

  if (existingUser) {
    return next(
      new AppError(
        existingUser.email === email
          ? "Email already in use"
          : "Username already taken",
        400,
      ),
    );
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { username, email, avatar },
    { new: true, runValidators: true },
  );

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: { user: user.getPublicProfile() },
  });
});

// Change Password
export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.id;

  // Validate input
  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new AppError("Please provide all password fields", 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new AppError("New passwords do not match", 400));
  }

  if (newPassword.length < 6) {
    return next(new AppError("Password must be at least 6 characters", 400));
  }

  // Get user with password
  const user = await User.findById(userId).select("+password");

  // Verify current password
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError("Current password is incorrect", 401));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password changed successfully",
  });
});

// Delete Account
export const deleteAccount = catchAsync(async (req, res, next) => {
  const { password } = req.body;
  const userId = req.user.id;

  // Verify password
  const user = await User.findById(userId).select("+password");

  if (!(await user.comparePassword(password))) {
    return next(new AppError("Password is incorrect", 401));
  }

  // Delete user
  await User.findByIdAndDelete(userId);

  res.status(200).json({
    status: "success",
    message: "Account deleted successfully",
  });
});

// 🚪 Logout (Client-side token removal, but we can log it)
export const logout = catchAsync(async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

// Validation rules
export const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be 3-30 characters"),
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  validate,
];

export const loginValidation = [
  body("email").trim().isEmail().normalizeEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];
