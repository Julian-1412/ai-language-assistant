import express from "express";
import dotenv from "dotenv";
import webhookRoutes from "./routes/webhook.routes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    message: "Server is running"
  });
});

app.use("/api", webhookRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});