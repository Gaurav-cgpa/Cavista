import * as elevenlabsService from "../services/elevenlabsService.js";

/**
 * POST /api/elevenlabs/tts
 * Body: { text: string, languageCode?: string }
 * Returns: audio/mpeg buffer
 */
export async function tts(req, res) {
  try {
    const { text, languageCode = "en" } = req.body || {};
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'text' in body." });
    }
    const audio = await elevenlabsService.textToSpeech(text, {
      languageCode: languageCode || "en",
    });
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.send(audio);
  } catch (err) {
    console.error("ElevenLabs TTS error:", err.message);
    if (err.message.includes("ELEVENLABS_API_KEY")) {
      return res.status(503).json({ error: "TTS not configured. Set ELEVENLABS_API_KEY." });
    }
    res.status(500).json({ error: err.message || "TTS failed." });
  }
}

/**
 * POST /api/elevenlabs/stt
 * Multipart: file (audio file), optional languageCode
 * Returns: { text: string, languageCode?: string }
 */
export async function stt(req, res) {
  try {
    const file = req.file;
    if (!file || !file.buffer) {
      return res.status(400).json({ error: "Missing audio file. Upload a file in the 'audio' field." });
    }
    const languageCode = req.body?.languageCode || req.body?.language_code || null;
    const result = await elevenlabsService.speechToText(file.buffer, {
      languageCode: languageCode || undefined,
    });
    res.json(result);
  } catch (err) {
    console.error("ElevenLabs STT error:", err.message);
    if (err.message.includes("ELEVENLABS_API_KEY")) {
      return res.status(503).json({ error: "STT not configured. Set ELEVENLABS_API_KEY." });
    }
    res.status(500).json({ error: err.message || "STT failed." });
  }
}
