import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config({ path: "./.env" });
connectDB();

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(
    `🎬 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`,
  );
  console.log(`📍 API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/v1/health`);
});

process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err);
  server.close(() => {
    process.exit(1);
  });
});
