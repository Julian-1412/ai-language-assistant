import express from "express";
import { askAssistant, getMetricsHandler } from "../controllers/assistant.controller.js";

const router = express.Router();

router.post("/ask", askAssistant);
router.get("/metrics", getMetricsHandler);

export default router;