import dotenv from 'dotenv';
dotenv.config();

import { client, paypal } from './src/config/paypal.js';

async function test() {
    console.log("Starting test...");
    try {
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        
        const exchangeRate = 15000;
        const amount = 50000;
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

        console.log("Executing client request...", request);
        const orderResponse = await client.execute(request);
        console.log("Response received!");
        
        const orderID = orderResponse.result.id;
        const approveLink = orderResponse.result.links.find(link => link.rel === 'approve');

        console.log("Result:", { 
            orderID, 
            url: approveLink ? approveLink.href : null 
        });
    } catch (err) {
        console.error("SDK Error caught:", err);
    }
}

test();
