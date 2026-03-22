import paypal from '@paypal/checkout-server-sdk';
import dotenv from 'dotenv';
dotenv.config({ override: true });

const sandbox = process.env.SANDBOX;

let environment;

if (sandbox) {
    environment = new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_SB_CLIENT_ID,
        process.env.PAYPAL_SB_CLIENT_SECRET
    );
} else {
    environment = new paypal.core.LiveEnvironment(
        process.env.PAYPAL_LIVE_CLIENT_ID,
        process.env.PAYPAL_LIVE_CLIENT_SECRET
    );
}

console.log(environment)

const client = new paypal.core.PayPalHttpClient(environment);

export { client, paypal };