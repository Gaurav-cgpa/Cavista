import express from "express";

import { getProfile, updateDetails } from "../controller/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/profile", getProfile);
router.put("/updateDetails", updateDetails);

export default router;