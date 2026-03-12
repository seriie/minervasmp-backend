import express from 'express';
const router = express.Router();
import * as paypalController from '../controllers/paypalController.js';

router.post('/paypal/donate', paypalController.createDonation);
router.post('/paypal/webhook', paypalController.handleWebhook);

export default router;
