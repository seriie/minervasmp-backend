import { client, paypal } from "../config/paypal.js";
import prisma from '../config/prisma.js';

// sekalian masukkan ke db agar di record
const createDonation = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({ error: 'Missing amount' });
        }

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        
        // PayPal does not support IDR, convert to USD
        const exchangeRate = 15000;
        const usdAmount = (amount / exchangeRate).toFixed(2);

        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        value: usdAmount,
                        currency_code: 'USD'
                    }
                }
            ]
        });

        const orderResponse = await client.execute(request);
        const orderID = orderResponse.result.id;

        res.json({ orderID });
    } catch (error) {
        console.error('Error creating PayPal order:', error);
        res.status(500).json({ error: 'Failed to create order', details: error.message || error.toString() });
    }
};

const handleWebhook = async (req, res) => {
    try {
        const { orderID } = req.body;

        if (!orderID) {
            return res.status(400).json({ error: 'Missing order ID' });
        }

        const request = new paypal.orders.OrdersGetRequest(orderID);
        const orderResponse = await client.execute(request);

        const orderData = orderResponse.result;

        if (orderData.status === 'COMPLETED') {
            // Process the completed order
            const amount = parseFloat(orderData.purchase_units[0].amount.value);
            
            const existingInvoice = await prisma.invoice.findUnique({
                where: { transactionId: orderID }
            });

            if (!existingInvoice) {
                await prisma.invoice.create({
                    data: {
                        transactionId: orderID,
                        amount: amount,
                        fee: 0,
                        gateway: 'paypal'
                    }
                });
                console.log(`✅ Processed PayPal Donation: ${orderID} for ${amount}`);
            } else {
                console.log(`✅ PayPal Donation ${orderID} already processed.`);
            }
        }

        res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error('Error handling PayPal webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

export {
    createDonation,
    handleWebhook
};
