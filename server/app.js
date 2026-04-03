import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import routes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";
import AppError from "./utils/AppError.js";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Rate limiting
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many requests from this IP, please try again in an hour!",
// });
// app.use("/api", limiter);

// ✅ Sesudah — pisah per kategori
// Auth limiter — lebih ketat tapi window lebih pendek
const authLimiter = rateLimit({
  max: 20, // 20 attempt login per 15 menit
  windowMs: 15 * 60 * 1000,
  message: {
    status: "fail",
    message: "Too many login attempts, try again in 15 minutes",
  },
  skipSuccessfulRequests: true, // ✅ request sukses tidak dihitung
});

// General API limiter — lebih longgar
const apiLimiter = rateLimit({
  max: 500, // 500 request per 15 menit
  windowMs: 15 * 60 * 1000,
  message: { status: "fail", message: "Too many requests" },
  skip: (req) => process.env.NODE_ENV === "development", // ✅ skip di development
});

app.use("/api/v1/auth", authLimiter); // hanya auth yang ketat
app.use("/api", apiLimiter); // general lebih longgar

// Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// API Routes
app.use("/api/v1", routes);

// Health check at root
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Welcome to Anime Streaming API 🎬",
    version: "1.0.0",
  });
});

// ⚠️ FIXED: Handle undefined routes (path-to-regexp compatible)
app.all("*any", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

export default app;
