import express from 'express';
const router = express.Router();
import * as donationController from '../controllers/donationController.js';

router.post('/donate', donationController.createDonation);
router.post('/midtrans-webhook', donationController.handleWebhook);

export default router;