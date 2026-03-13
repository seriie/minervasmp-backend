import prisma from '../config/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import { convertIDRtoUSD } from '../utils/convertToUSD.js';

export const createDonation = async (req, res) => {    
    try {
        const { amount_raw, donator_name, cut, message } = req.body;
        const transactionId = `MINERVA-${uuidv4().substring(0,10).toUpperCase()}`;

        // Convert the IDR amounts to USD
        const finalAmountUSD = await convertIDRtoUSD(parseInt(amount_raw));
        const finalFeeUSD = await convertIDRtoUSD(parseFloat(cut));

        const transaction = await prisma.invoice.create({
            data: {
                transactionId,
                amount: finalAmountUSD,
                fee: finalFeeUSD,
                gateway: 'saweria',
                message,
                username: donator_name,
            },
        });

        res.json({ transaction });
    } catch (error) {
        console.error('Error creating Saweria donation:', error);
        res.status(500).json({ error: 'Failed to create donation' });
    }
};