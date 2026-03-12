import prisma from '../config/prisma.js';

const createInvoice = async (req, res) => {
  try {
    const { transactionId, amount, fee, gateway } = req.body;

    if (!transactionId || amount === undefined || fee === undefined || !gateway) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const invoice = await prisma.invoice.create({
      data: {
        transactionId,
        amount: Number(amount),
        fee: Number(fee),
        gateway
      }
    });

    res.status(201).json({ success: true, invoice });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { createInvoice };
