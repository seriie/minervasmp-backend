import express from 'express';
import { createDonation } from '../controllers/sociabuzzController.js';

const router = express.Router();

router.post('/sociabuzz', createDonation);

export default router;