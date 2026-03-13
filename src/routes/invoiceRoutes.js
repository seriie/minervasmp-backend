import express from 'express';
const router = express.Router();
import * as invoiceController from '../controllers/invoiceController.js';

router.post('/invoices', invoiceController.createInvoice);
router.get('/invoices', invoiceController.getRecentInvoices);

export default router;
