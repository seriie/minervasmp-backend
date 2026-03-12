const express = require('express');
const router = express.Router();
const paypalController = require('../controllers/paypalController');

router.post('/paypal/donate', paypalController.createDonation);
router.post('/paypal/webhook', paypalController.handleWebhook);

module.exports = router;
