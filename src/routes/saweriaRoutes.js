import express from 'express';
import { createDonation } from '../controllers/saweriaController.js';
const router = express.Router();

router.post('/saweria/webhook', createDonation);

export default router;