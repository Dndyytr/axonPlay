import catchAsync from "../utils/catchAsync.js";

export const healthCheck = catchAsync(async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running smoothly 🚀",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});
