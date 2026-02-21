import express from "express";
import { generateVitalsForPatient } from "../utils/automaticCall";

const router = express.Router();

router.get("/", async (req, res) => {
  const patientId = req.query.patientId || "P001";
  const vitals = await generateVitalsForPatient(patientId);
  res.json(vitals);
});

export default router;