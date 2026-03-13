/**
 * Fetches the current exchange rate and converts an IDR amount to USD.
 * Falls back to a default rate if the API request fails.
 * 
 * @param {number} amountIdr - The amount in Indonesian Rupiah (IDR)
 * @returns {Promise<number>} - The converted amount in USD
 */
export const convertIDRtoUSD = async (amountIdr) => {
    // Default fallback rate (approx. 15,500 IDR = 1 USD)
    const FALLBACK_RATE = 1 / 15500; 

    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/IDR');
        
        if (!response.ok) {
            throw new Error(`API returned status: ${response.status}`);
        }

        const data = await response.json();
        const rate = data.rates.USD;

        if (!rate) {
            throw new Error('USD rate not found in response');
        }

        return Number((amountIdr * rate).toFixed(2));
    } catch (error) {
        console.error('Failed to fetch live exchange rate, using fallback.', error.message);
        return Number((amountIdr * FALLBACK_RATE).toFixed(2));
    }
};
