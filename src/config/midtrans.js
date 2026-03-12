import midtransClient from 'midtrans-client';
import dotenv from 'dotenv';
dotenv.config({ override: true });

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: (process.env.MIDTRANS_SERVER_KEY || '').trim(),
  clientKey: (process.env.MIDTRANS_CLIENT_KEY || '').trim()
});

export default snap;
