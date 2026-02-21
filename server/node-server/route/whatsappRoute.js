import express from "express";
import { handleIncoming } from "../controller/whatsappController.js";

const router = express.Router();

// Twilio sends POST with application/x-www-form-urlencoded
router.post("/incoming", handleIncoming);

export default router;
