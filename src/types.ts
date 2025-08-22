import { calculateOptionPrice } from "./utils/blackScholes";

export type Ticker = string;

export enum OptionSide {
    CALL = "CALL",
    PUT = "PUT",
}

export interface StockData {
    volatility: number;
    currentPrice: number;
    lastUpdated: Date;
    ticker: string;
}

export class Market {
    date: Date = new Date();
    riskFreeRate?: number;
    prices: { [ticker: Ticker]: { price: number; volatility?: number; } } = {};

    setDate(date: Date) {
        this.date = date;
    }

    setPrice(ticker: Ticker, price: number, volatility?: number) {
        this.prices[ticker] = { price, volatility };
    }

    setRiskFreeRate(rate: number) {
        this.riskFreeRate = rate;
    }

    async fetchLatest(ticker?: Ticker) {
        if (!ticker) {
            await Promise.all(Object.keys(this.prices).map(ticker => this.fetchLatest(ticker)));
        } else {
            // use getStockData in marketData.ts 
        }
    }

    clone(): Market {
        const newMarket = new Market();
        newMarket.date = new Date(this.date);
        newMarket.prices = JSON.parse(JSON.stringify(this.prices));
        return newMarket;
    }
}

export interface Position {
    ticker: Ticker;
    
    getCostBasis(): number;
    getMarkToMarket(market: Market): number;
    getPnL(market: Market): number;
}

export class OptionTrade implements Position {
    ticker: Ticker;
    strike: number;
    price: number; // Per-share premium (e.g., $5 per share)
    quantity: number; // Number of contracts
    expiration: Date;
    side: OptionSide;

    getCostBasis(): number {
        return this.price * 100 * this.quantity;
    }

    getMarkToMarket(market: Market): number {
        const tickerData = market.prices[this.ticker];
        if (!tickerData) {
            throw new Error(`No price data found for ticker: ${this.ticker}`);
        }

        const volatility = tickerData.volatility || 0.5;
        const riskFreeRate = market.riskFreeRate || 0.5;
        const timeToExpiry = (this.expiration.getTime() - market.date.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        
        if (timeToExpiry <= 0) {
            // Intrinsic value at expiration
            const intrinsicValue = Math.max(
                this.side === OptionSide.CALL ? tickerData.price - this.strike : this.strike - tickerData.price,
                0
            );
            return intrinsicValue * 100 * this.quantity;
        }
        
        const optionPrice = calculateOptionPrice({
            price: tickerData.price,
            type: this.side === OptionSide.CALL ? 'CALL' : 'PUT',
            strike: this.strike,
            riskFreeRate: riskFreeRate,
            volatility: volatility,
            timeToExpiry
        });
        
        return optionPrice * 100 * this.quantity;
    }

    getPnL(market: Market): number {
        return this.getMarkToMarket(market) - this.getCostBasis();
    }
}

export class StockTrade implements Position {
    ticker: Ticker;
    price: number;
    quantity: number;

    getCostBasis(): number {
        return this.price * this.quantity;
    }

    getMarkToMarket(market: Market): number {
        const tickerData = market.prices[this.ticker];
        if (!tickerData) {
            throw new Error(`No price data found for ticker: ${this.ticker}`);
        }
        
        return tickerData.price * this.quantity;
    }

    getPnL(market: Market): number {
        return this.getMarkToMarket(market) - this.getCostBasis();
    }
}

export class Portfolio {
    positions: Position[] = [];

    getCostBasis(ticker?: string): number {
        const filteredPositions = ticker 
            ? this.positions.filter(p => p.ticker === ticker)
            : this.positions;
            
        return filteredPositions.reduce((total, position) => {
            return total + position.getCostBasis();
        }, 0);
    }

    getMarkToMarket(market: Market, ticker?: string): number {
        const filteredPositions = ticker 
            ? this.positions.filter(p => p.ticker === ticker)
            : this.positions;
            
        return filteredPositions.reduce((total, position) => {
            return total + position.getMarkToMarket(market);
        }, 0);
    }

    getPnL(market: Market, ticker?: string): number {
        return this.getMarkToMarket(market, ticker) - this.getCostBasis(ticker);
    }

    getPositionsByTicker(ticker: string): Position[] {
        return this.positions.filter(p => p.ticker === ticker);
    }

    getAllTickers(market?: Market): string[] {
        const tickers = new Set(this.positions.map(p => p.ticker));
        const tickerArray = Array.from(tickers);
        
        if (market) {
            return tickerArray.sort((a, b) => {
                const marketValueA = this.getMarkToMarket(market, a);
                const marketValueB = this.getMarkToMarket(market, b);
                return marketValueB - marketValueA; // Descending order
            });
        }
        
        return tickerArray.sort();
    }
}