export type Ticker = string;

export enum OptionSide {
    CALL = "CALL",
    PUT = "PUT",
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

    clone(): Market {
        const newMarket = new Market();
        newMarket.date = new Date(this.date);
        newMarket.prices = JSON.parse(JSON.stringify(this.prices));
        return newMarket;
    }
}

export interface Position {
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
        const { calculateOptionPrice } = require('./utils/blackScholes');
        
        const tickerData = market.prices[this.ticker];
        if (!tickerData) {
            throw new Error(`No price data found for ticker: ${this.ticker}`);
        }
        
        if (!tickerData.volatility) {
            throw new Error(`No volatility data found for ticker: ${this.ticker}`);
        }
        
        if (!market.riskFreeRate) {
            throw new Error('Risk-free rate not set in market');
        }
        
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
            riskFreeRate: market.riskFreeRate,
            volatility: tickerData.volatility,
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

export class Portfolio implements Position {
    positions: Position[] = [];

    getCostBasis(): number {
        return this.positions.reduce((total, position) => {
            return total + position.getCostBasis();
        }, 0);
    }

    getMarkToMarket(market: Market) {
        return this.positions.reduce((total, position) => {
            return total + position.getMarkToMarket(market);
        }, 0);
    }

    getPnL(market: Market): number {
        return this.getMarkToMarket(market) - this.getCostBasis();
    }
}