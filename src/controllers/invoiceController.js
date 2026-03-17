import prisma from '../config/prisma.js';

const createInvoice = async (req, res) => {
  try {
    const { transactionId, amount, fee, gateway, username, message } = req.body;

    if (!transactionId || amount === undefined || fee === undefined || !gateway) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const invoice = await prisma.invoice.create({
      data: {
        transactionId,
        amount: Number(amount),
        fee: Number(fee),
        gateway,
        username,
        message
      }
    });

    res.status(201).json({ success: true, invoice });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRecentInvoices = async (req, res) => {
  try {
    const { since } = req.query;
    
    const sinceDate = since ? new Date(parseInt(since, 10)) : new Date(Date.now() - 60000); // Default to last 1 minute

    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: {
          gt: sinceDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.status(200).json({ success: true, invoices });
  } catch (error) {
    console.error('Error fetching recent invoices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllInvoices = async (req, res) => {
  try {
    const { days } = req.query;
    const lookbackDays = days ? parseInt(days, 10) : 30;
    const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);

    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: {
          gt: since
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.status(200).json({ success: true, invoices });
  } catch (error) {
    console.error('Error fetching all invoices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { createInvoice, getRecentInvoices, getAllInvoices };
