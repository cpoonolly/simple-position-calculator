import { Market, Portfolio, OptionTrade, StockTrade, OptionSide } from '../types';

export interface ExportData {
  market: {
    date: string;
    riskFreeRate: number;
    prices: { [ticker: string]: { price: number; volatility?: number } };
  };
  portfolio: {
    positions: Array<{
      type: 'stock' | 'option';
      ticker: string;
      price: number;
      quantity: number;
      strike?: number;
      expiration?: string;
      side?: string;
    }>;
  };
}

export function exportData(market: Market, portfolio: Portfolio): void {
  try {
    const exportData: ExportData = {
      market: {
        date: market.date.toISOString(),
        riskFreeRate: market.riskFreeRate || 0,
        prices: market.prices
      },
      portfolio: {
        positions: portfolio.positions.map(position => {
          if (position instanceof OptionTrade) {
            return {
              type: 'option' as const,
              ticker: position.ticker,
              strike: position.strike,
              price: position.price,
              quantity: position.quantity,
              expiration: position.expiration.toISOString(),
              side: position.side
            };
          } else if (position instanceof StockTrade) {
            return {
              type: 'stock' as const,
              ticker: position.ticker,
              price: position.price,
              quantity: position.quantity
            };
          }
          throw new Error(`Unknown position type: ${position}`);
        })
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('Failed to export data');
  }
}

export function importData(jsonString: string): { market: Market; portfolio: Portfolio } {
  try {
    const importData: ExportData = JSON.parse(jsonString);
    
    // Create new Market instance
    const market = new Market();
    market.date = new Date(importData.market.date);
    market.riskFreeRate = importData.market.riskFreeRate;
    market.prices = importData.market.prices;
    
    // Create new Portfolio instance
    const portfolio = new Portfolio();
    portfolio.positions = importData.portfolio.positions.map(posData => {
      if (posData.type === 'option') {
        const option = new OptionTrade();
        option.ticker = posData.ticker;
        option.strike = posData.strike!;
        option.price = posData.price;
        option.quantity = posData.quantity;
        option.expiration = new Date(posData.expiration!);
        option.side = posData.side as OptionSide;
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
    
    return { market, portfolio };
  } catch (error) {
    console.error('Import failed:', error);
    throw new Error('Failed to import data. Please check the file format.');
  }
}

export function importFromFile(file: File): Promise<{ market: Market; portfolio: Portfolio }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = importData(e.target?.result as string);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}