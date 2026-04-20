import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import webhookRoutes from "./routes/webhook.routes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, "../public")));

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