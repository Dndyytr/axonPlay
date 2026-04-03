import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * Get All Users (Admin Only)
 * GET /api/v1/admin/users
 */
export const getAllUsers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, role, search } = req.query;

  // Build query
  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(query)
    .select("-password -__v")
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .sort("-createdAt");

  const total = await User.countDocuments(query);

  res.status(200).json({
    status: "success",
    results: users.length,
    total,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

/**
 * Get User by ID (Admin Only)
 * GET /api/v1/admin/users/:id
 */
export const getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password -__v");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

/**
 * Update User Role (Admin Only)
 * PATCH /api/v1/admin/users/:id/role
 */
export const updateUserRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !["user", "admin"].includes(role)) {
    return next(new AppError("Invalid role", 400));
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true },
  ).select("-password -__v");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "User role updated successfully",
    data: { user },
  });
});

/**
 * Delete User (Admin Only)
 * DELETE /api/v1/admin/users/:id
 */
export const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (id === req.user.id) {
    return next(new AppError("You cannot delete your own account", 400));
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "User deleted successfully",
  });
});

/**
 * Get Dashboard Stats (Admin Only)
 * GET /api/v1/admin/stats
 */
export const getDashboardStats = catchAsync(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalAdmins = await User.countDocuments({ role: "admin" });
  const totalRegularUsers = await User.countDocuments({ role: "user" });

  res.status(200).json({
    status: "success",
    data: {
      stats: {
        totalUsers,
        totalAdmins,
        totalRegularUsers,
      },
    },
  });
});
