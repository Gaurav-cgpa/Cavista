import express from "express";
import { getLastOneDayVitals } from "../controller/dynamicInfoController.js";


const router = express.Router();

router.get("/last-day/:patientId", getLastOneDayVitals);

export default router;