import { client, paypal } from "../config/paypal.js";
import prisma from '../config/prisma.js';

const createDonation = async (req, res) => {
    try {
        const { amount, username, message, return_url, cancel_url } = req.body;

        if (!amount || !username) {
            return res.status(400).json({ error: 'Missing amount or username' });
        }

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        
        const usdAmount = parseFloat(amount).toFixed(2);

        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        value: usdAmount,
                        currency_code: 'USD'
                    },
                    custom_id: JSON.stringify({ username, message: message || "" })
                }
            ],
            application_context: {
                return_url: return_url || 'http://localhost:5173/paypal-success',
                cancel_url: cancel_url || 'http://localhost:5173/donate'
            }
        });

        const orderResponse = await client.execute(request);
        const orderID = orderResponse.result.id;
        
        // Find the approve link to redirect the frontend
        const approveLink = orderResponse.result.links.find(link => link.rel === 'approve');

        res.json({ 
            orderID, 
            url: approveLink ? approveLink.href : null 
        });
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
            const amount = parseFloat(orderData.purchase_units[0].amount.value);
            
            let username = null;
            let message = null;
            
            try {
                const customData = JSON.parse(orderData.purchase_units[0].custom_id || '{}');
                username = customData.username || null;
                message = customData.message || null;
            } catch (e) {
                console.warn(`Failed to parse custom_id for order ${orderID}`);
            }
            
            const existingInvoice = await prisma.invoice.findUnique({
                where: { transactionId: orderID }
            });

            if (!existingInvoice) {
                await prisma.invoice.create({
                    data: {
                        transactionId: orderID,
                        amount: amount,
                        fee: 0,
                        gateway: 'paypal',
                        username,
                        message
                    }
                });
                console.log(`✅ Processed PayPal Donation: ${orderID} for ${amount} by ${username}`);
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

const capturePayment = async (req, res) => {
    try {
        const { orderID } = req.body;

        if (!orderID) {
            return res.status(400).json({ error: 'Missing order ID' });
        }

        const request = new paypal.orders.OrdersCaptureRequest(orderID);
        request.requestBody({});

        const captureResponse = await client.execute(request);
        const orderData = captureResponse.result;

        if (orderData.status === 'COMPLETED') {
            const amount = parseFloat(orderData.purchase_units[0].payments.captures[0].amount.value);
            
            let username = null;
            let message = null;
            
            try {
                const getRequest = new paypal.orders.OrdersGetRequest(orderID);
                const getResponse = await client.execute(getRequest);
                const fullOrder = getResponse.result;

                const customData = JSON.parse(fullOrder.purchase_units[0]?.custom_id || '{}');
                username = customData.username || null;
                message = customData.message || null;
            } catch (e) {
                console.warn(`Failed to parse custom_id for order ${orderID} upon capture`, e);
            }
            
            const existingInvoice = await prisma.invoice.findUnique({
                where: { transactionId: orderID }
            });

            if (!existingInvoice) {
                await prisma.invoice.create({
                    data: {
                        transactionId: orderID,
                        amount: amount,
                        fee: 0,
                        gateway: 'paypal',
                        username,
                        message
                    }
                });
                console.log(`✅ Processed PayPal Donation (Capture): ${orderID} for ${amount} by ${username}`);
            }

            return res.status(200).json({ status: 'success', data: orderData });
        } else {
            return res.status(400).json({ status: 'failed', data: orderData });
        }
    } catch (error) {
        console.error('Error capturing PayPal order:', error);
        res.status(500).json({ error: 'Failed to capture order', details: error.message || error.toString() });
    }
};

export {
    createDonation,
    handleWebhook,
    capturePayment
};
