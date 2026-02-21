
import express from 'express';
import { updateHealthHistory } from '../controller/healthHistoryController';

const router = express.Router();

router.put("/update-health-history", updateHealthHistory);

export default router;