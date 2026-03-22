import prisma from '../config/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import { convertIDRtoUSD } from '../utils/convertToUSD.js';

export const createDonation = async (req, res) => {    
    try {
        const { ammount, supporter, message } = req.body;
        const transactionId = `MINERVA-${uuidv4().substring(0,10).toUpperCase()}`;

        // Convert the IDR amounts to USD
        const finalAmountUSD = await convertIDRtoUSD(parseFloat(ammount));

        const transaction = await prisma.invoice.create({
            data: {
                transactionId,
                amount: finalAmountUSD,
                fee: 0,
                gateway: 'sociabuzz',
                message,
                username: supporter,
            },
        });

        res.json({ transaction });
    } catch (error) {
        console.error('Error creating Sociabuzz donation:', error);
        res.status(500).json({ error: 'Failed to create donation' });
    }
};