import express from "express";
import { saveChatMessage } from "../controller/chatController.js";


const router = express.Router();

router.post("/save", saveChatMessage);

export default router;