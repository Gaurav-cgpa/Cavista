import express from "express";
import { translate } from "../controller/translateController.js";

const router = express.Router();

// POST /api/translate
router.post("/", translate);

export default router;
