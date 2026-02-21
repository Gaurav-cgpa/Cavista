import { getChatbotReply } from "../services/chatbotService.js";

/**
 * POST /api/chat
 * Body: { message: string, userId?: string }
 * Returns: { reply: string }
 * Throws: Error if API call fails
 */
export async function chat(req, res) {
  try {
    const { message, userId, bearerToken } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'message' in body." });
    }

    if (!bearerToken) {
      return res.status(401).json({ error: "Bearer token not provided. Please login first." });
    }

    try {
      // Call AI Chat API - will throw if it fails
      const reply = await getChatbotReply(message, userId, bearerToken);

      res.json({
        reply,
        userId: userId || null,
      });
    } catch (apiErr) {
      // Return API error message to frontend
      console.error("❌ External API Error:", apiErr.message);
      res.status(503).json({
        error: apiErr.message || "External AI API unavailable. Please try again later.",
      });
    }
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: err.message || "Chat failed." });
  }
}
