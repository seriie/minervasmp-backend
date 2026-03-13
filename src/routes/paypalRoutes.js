import express from 'express';
const router = express.Router();
import * as paypalController from '../controllers/paypalController.js';

router.post('/paypal/donate', paypalController.createDonation);
router.post('/paypal/webhook', paypalController.handleWebhook);
router.post('/paypal/capture', paypalController.capturePayment);

export default router;
