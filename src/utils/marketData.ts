import { StockData } from "../types";


export async function getStockData(ticker: string, period: string = '1y'): Promise<StockData | null> {
    /**
     * Calculate annualized volatility and get current stock price for Black-Scholes
     * 
     * @param ticker - Stock ticker symbol (e.g., 'AAPL', 'MSFT')
     * @param period - Time period for volatility calculation ('1y', '6mo', '2y', '5y', etc.)
     * @returns Promise resolving to StockData object or null if error
     */
    
    try {
        // Get historical data for volatility calculation
        const histUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=0&period2=9999999999&interval=1d&range=${period}`;
        
        // Get current price with recent data (1-minute intervals for last day)
        const currentUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1m&range=1d`;
        
        const [histResponse, currentResponse] = await Promise.all([
            fetch(histUrl),
            fetch(currentUrl)
        ]);
        
        const [histData, currentData] = await Promise.all([
            histResponse.json(),
            currentResponse.json()
        ]);
        
        // Validate historical data
        if (!histData.chart || !histData.chart.result || !histData.chart.result[0]) {
            throw new Error('Invalid ticker or no historical data available');
        }
        
        // Validate current data
        if (!currentData.chart || !currentData.chart.result || !currentData.chart.result[0]) {
            throw new Error('No current price data available');
        }
        
        // Calculate volatility from historical daily data
        const prices = histData.chart.result[0].indicators.quote[0].close;
        const validPrices = prices.filter((price: number | null) => price !== null);
        const dailyReturns: number[] = [];
        
        for (let i = 1; i < validPrices.length; i++) {
            const returnVal = (validPrices[i] - validPrices[i-1]) / validPrices[i-1];
            dailyReturns.push(returnVal);
        }
        
        if (dailyReturns.length === 0) {
            throw new Error('Not enough data to calculate volatility');
        }
        
        // Calculate standard deviation of daily returns
        const mean = dailyReturns.reduce((sum, val) => sum + val, 0) / dailyReturns.length;
        const variance = dailyReturns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dailyReturns.length;
        const dailyVol = Math.sqrt(variance);
        
        // Annualize volatility (252 trading days)
        const volatility = dailyVol * Math.sqrt(252);
        
        // Get current price from minute data (most recent available)
        const currentPrices = currentData.chart.result[0].indicators.quote[0].close;
        const timestamps = currentData.chart.result[0].timestamp;
        
        // Find the most recent non-null price
        let currentPrice: number | null = null;
        let lastTimestamp: number = 0;
        
        for (let i = currentPrices.length - 1; i >= 0; i--) {
            if (currentPrices[i] !== null) {
                currentPrice = currentPrices[i];
                lastTimestamp = timestamps[i];
                break;
            }
        }
        
        if (currentPrice === null) {
            throw new Error('No current price data available');
        }
        
        return {
            volatility,
            currentPrice,
            lastUpdated: new Date(lastTimestamp * 1000),
            ticker: ticker.toUpperCase()
        };
        
    } catch (error) {
        console.error(`Error fetching data for ${ticker}:`, (error as Error).message);
        return null;
    }
}
