import { Market, Portfolio, OptionTrade, StockTrade, OptionSide, Position } from '../types';

const MARKET_KEY = 'portfolio-calculator-market';
const PORTFOLIO_KEY = 'portfolio-calculator-portfolio';

// Market serialization/deserialization
export function saveMarket(market: Market): void {
  try {
    const marketData = {
      date: market.date.toISOString(),
      riskFreeRate: market.riskFreeRate,
      prices: market.prices
    };
    localStorage.setItem(MARKET_KEY, JSON.stringify(marketData));
  } catch (error) {
    console.error('Failed to save market data:', error);
  }
}

export function loadMarket(): Market | null {
  try {
    const data = localStorage.getItem(MARKET_KEY);
    if (!data) return null;
    
    const marketData = JSON.parse(data);
    const market = new Market();
    market.date = new Date(marketData.date);
    market.riskFreeRate = marketData.riskFreeRate;
    market.prices = marketData.prices;
    
    return market;
  } catch (error) {
    console.error('Failed to load market data:', error);
    return null;
  }
}

// Portfolio serialization/deserialization
export function savePortfolio(portfolio: Portfolio): void {
  try {
    const portfolioData = {
      positions: portfolio.positions.map(position => {
        if (position instanceof OptionTrade) {
          return {
            type: 'option',
            ticker: position.ticker,
            strike: position.strike,
            price: position.price,
            quantity: position.quantity,
            expiration: position.expiration.toISOString(),
            side: position.side
          };
        } else if (position instanceof StockTrade) {
          return {
            type: 'stock',
            ticker: position.ticker,
            price: position.price,
            quantity: position.quantity
          };
        }
        throw new Error(`Unknown position type: ${position}`);
      })
    };
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolioData));
  } catch (error) {
    console.error('Failed to save portfolio data:', error);
  }
}

export function loadPortfolio(): Portfolio | null {
  try {
    const data = localStorage.getItem(PORTFOLIO_KEY);
    if (!data) return null;
    
    const portfolioData = JSON.parse(data);
    const portfolio = new Portfolio();
    
    portfolio.positions = portfolioData.positions.map((posData: any): Position => {
      if (posData.type === 'option') {
        const option = new OptionTrade();
        option.ticker = posData.ticker;
        option.strike = posData.strike;
        option.price = posData.price;
        option.quantity = posData.quantity;
        option.expiration = new Date(posData.expiration);
        option.side = posData.side;
        return option;
      } else if (posData.type === 'stock') {
        const stock = new StockTrade();
        stock.ticker = posData.ticker;
        stock.price = posData.price;
        stock.quantity = posData.quantity;
        return stock;
      }
      throw new Error(`Unknown position type: ${posData.type}`);
    });
    
    return portfolio;
  } catch (error) {
    console.error('Failed to load portfolio data:', error);
    return null;
  }
}