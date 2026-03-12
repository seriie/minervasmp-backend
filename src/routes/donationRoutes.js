const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');

router.post('/donate', donationController.createDonation);
router.post('/midtrans-webhook', donationController.handleWebhook);

module.exports = router