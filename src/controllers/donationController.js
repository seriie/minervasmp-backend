const prisma = require('../config/prisma');
const snap = require('../config/midtrans');
const { v4: uuidv4 } = require('uuid');

const createDonation = async (req, res) => {
  try {
    const { username, amount } = req.body;

    if (!username || !amount) {
      return res.status(400).json({ error: 'Missing username or amount' });
    }

    const transactionId = `MINERVA-${uuidv4().substring(0,10).toUpperCase()}`;

    const parameters = {
      transaction_details: {
        order_id: transactionId,
        gross_amount: Number(amount),
      },
      customer_details: {
        first_name: username,
      },
      credit_card: {
        secure: true
      }
    };

    const transaction = await snap.createTransaction(parameters);
    res.json({ token: transaction.token, transactionId });

  } catch (error) {
    if (error.ApiResponse && error.ApiResponse.error_messages) {
      console.error('Midtrans API Error:', error.ApiResponse.error_messages);
      res.status(500).json({ error: 'Failed to create transaction token', details: error.ApiResponse.error_messages });
    } else {
      console.error('Error creating snap transaction:', error.message || error);
      res.status(500).json({ error: 'Failed to create transaction token', details: error.message || error });
    }
  }
};

const handleWebhook = async (req, res) => {
  try {
    const notificationJson = req.body;
    
    const statusResponse = await snap.transaction.notification(notificationJson);
    
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    if (transactionStatus == 'capture' || transactionStatus == 'settlement') {
      if (fraudStatus == 'accept' || !fraudStatus) {
        
        const existingInvoice = await prisma.invoice.findUnique({
          where: { transactionId: orderId }
        });

        if (!existingInvoice) {
          await prisma.invoice.create({
            data: {
              transactionId: orderId,
              amount: Number(statusResponse.gross_amount),
              fee: 0,
              gateway: statusResponse.payment_type
            }
          });
          console.log(`✅ Processed Midtrans Donation: ${orderId} for ${statusResponse.gross_amount}`);
        }
      }
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Error handling midtrans webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

module.exports = {
  createDonation,
  handleWebhook
};
