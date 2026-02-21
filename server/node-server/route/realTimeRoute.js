import express from "express";
import { getLastOneDayVitals } from "../controller/dynamicInfoController.js";
import {protect} from "../middleware/auth.js";


const router = express.Router();

router.get("/last-day/:patientId", protect, getLastOneDayVitals);

export default router;