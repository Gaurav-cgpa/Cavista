import express from "express";
import { chatWithAI } from "../controller/chatController.js";
import { protect } from "../middleware/auth.js";



const router = express.Router();

router.post("/save", protect, chatWithAI);

export default router;