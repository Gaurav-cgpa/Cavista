import express from 'express';
import { updatePatientDynamicDetails } from '../controller/dynamicInfoController.js';

const router = express.Router();

router.post('/updatePatientDynamicDetails', updatePatientDynamicDetails);

export default router;