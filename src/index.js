const express = require('express');
const cors = require('cors');
require('dotenv').config({ override: true });

const donationRoutes = require('./routes/donationRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paypalRoutes = require('./routes/paypalRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', donationRoutes);
app.use('/api', invoiceRoutes);
app.use('/api', paypalRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Minerva SMP Backend is running (Modular JS)' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
