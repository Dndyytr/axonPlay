import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

app.get("/api/v1/health", (req, res) => {
  res.json({ status: "success", message: "Test OK" });
});

app.listen(5000, () => {
  console.log("Test server running on port 5000");
});
