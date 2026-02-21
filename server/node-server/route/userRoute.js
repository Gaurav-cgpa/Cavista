import express from "express";

import { updateDetails } from "../controller/userController.js";

const router = express.Router();

router.put("/updateDetails", updateDetails);

export default router;