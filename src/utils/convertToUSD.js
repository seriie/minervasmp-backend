/**
 * Fetches the current exchange rate and converts an amount to USD.
 * Falls back to a default rate if the API request fails.
 *
 * @param {number} amount - The amount in the source currency
 * @param {string} currency - The source currency code (e.g. 'IDR', 'MYR', 'SGD')
 * @returns {Promise<number>} - The converted amount in USD
 */
export const convertIDRtoUSD = async (amount, currency) => {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch exchange rate: ${response.status}`);
    }

    const data = await response.json();
    const rate = data.rates.USD;

    if (!rate) {
        throw new Error(`USD rate not found for currency: ${currency}`);
    }

    return Number((amount * rate).toFixed(2));
};
