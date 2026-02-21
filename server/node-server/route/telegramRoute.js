import express from "express";
import { handleWebhook } from "../controller/telegramController.js";

const router = express.Router();

// Telegram sends POST with application/json (update object)
router.post("/webhook", handleWebhook);

// Helper: Check current webhook info
router.get("/webhook-info", async (req, res) => {
  try {
    const token = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
    if (!token) {
      return res.status(400).json({ error: "TELEGRAM_BOT_TOKEN not set" });
    }
    const url = `https://api.telegram.org/bot${token}/getWebhookInfo`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: Set webhook URL (GET for easy browser access)
router.get("/set-webhook", async (req, res) => {
  try {
    const token = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
    const webhookUrl = req.query.url;
    if (!token) {
      return res.status(400).json({ error: "TELEGRAM_BOT_TOKEN not set" });
    }
    if (!webhookUrl) {
      return res.status(400).json({ error: "Missing ?url= parameter" });
    }
    const url = `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
