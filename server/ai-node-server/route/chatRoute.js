import express from "express";
import { chatWithAI } from "../controller/chatController.js";



const router = express.Router();

router.post("/save", chatWithAI);

export default router;