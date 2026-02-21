import express from "express";
import multer from "multer";
import { tts, stt } from "../controller/elevenlabsController.js";

const router = express.Router();

// In-memory upload for STT (single file, field name "audio")
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "audio/webm",
      "audio/mp3",
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/mp4",
      "audio/x-wav",
      "audio/wave",
    ];
    const ok = allowed.includes(file.mimetype) || (file.mimetype && file.mimetype.startsWith("audio/"));
    if (ok) cb(null, true);
    else cb(new Error("Invalid file type. Use an audio file."), false);
  },
});

router.post("/tts", tts);
router.post("/stt", (req, res, next) => {
  upload.single("audio")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "File upload failed." });
    }
    next();
  });
}, stt);

export default router;
