import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config({ override: true });

import donationRoutes from './routes/donationRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import paypalRoutes from './routes/paypalRoutes.js';
import saweriaRoutes from './routes/saweriaRoutes.js';
import sociabuzzRoutes from './routes/sociabuzz.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', donationRoutes);
app.use('/api', invoiceRoutes);
app.use('/api', paypalRoutes);
app.use('/api', saweriaRoutes);
app.use('/api', sociabuzzRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'healthy', message: 'Minerva SMP Backend is running' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;
