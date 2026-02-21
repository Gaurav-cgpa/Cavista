import * as translationService from "../services/translationService.js";

/**
 * POST /api/translate
 * Body: { text: string, targetLang: string, sourceLang?: string }
 * Returns: { translated: string, sourceLang: string, targetLang: string }
 */
export async function translate(req, res) {
  try {
    const { text, targetLang, sourceLang = "en" } = req.body || {};

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'text' in body." });
    }

    if (!targetLang) {
      return res.status(400).json({ error: "Missing 'targetLang' in body." });
    }

    const translated = await translationService.translateText(text, targetLang, sourceLang);

    res.json({
      translated: translated || text,
      sourceLang,
      targetLang,
    });
  } catch (err) {
    console.error("Translation error:", err.message);
    res.status(500).json({ error: err.message || "Translation failed." });
  }
}
