import express from "express";

import { getProfile, updateDetails, getUserByPhone } from "../controller/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/by-phone", getUserByPhone);

router.use(protect);
router.get("/profile", getProfile);
router.put("/updateDetails", updateDetails);

export default router;