import React from 'react';
import { Box, Typography } from '@mui/material';
import PriceControl from './PriceControl';

import { formatCurrency } from '../utils/formatters';
import { Portfolio, Market } from '../dataTypes';

interface Summary {
  costBasis: number;
  markToMarket: number;
  pnl: number;
  error?: string;
}

interface TickerSummaryProps {
  ticker: string;
  portfolio: Portfolio;
  market: Market;
  onPriceChange?: (ticker: string, newPrice: number) => void;
}

export default function TickerSummary({ ticker, portfolio, market, onPriceChange }: TickerSummaryProps): React.ReactElement {
  const getSummary = (): Summary => {
    try {
      const costBasis = portfolio.getCostBasis(ticker);
      const markToMarket = portfolio.getMarkToMarket(market, ticker);
      const pnl = portfolio.getPnL(market, ticker);
      return { costBasis, markToMarket, pnl };
    } catch (error) {
      return { costBasis: 0, markToMarket: 0, pnl: 0, error: (error as Error).message };
    }
  };

  const summary = getSummary();
  const currentPrice = market.prices[ticker]?.price || 0;

  const handlePriceChange = (newPrice: number) => {
    if (onPriceChange) {
      onPriceChange(ticker, newPrice);
    }
  };

  return (
    <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
      <Typography variant="h6" gutterBottom>
        {ticker}
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Cost Basis
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {formatCurrency(summary.costBasis)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Market Value
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {formatCurrency(summary.markToMarket)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            P&L
          </Typography>
          <Typography 
            variant="body1" 
            fontWeight="bold"
            color={summary.pnl >= 0 ? 'success.main' : 'error.main'}
          >
            {formatCurrency(summary.pnl)}
          </Typography>
        </Box>
      </Box>
      
      {/* Price Control */}
      {onPriceChange && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Market Price
          </Typography>
          <PriceControl
            value={currentPrice}
            onChange={handlePriceChange}
            showLabel={false}
            min={0}
            max={1000}
            step={0.01}
          />
        </Box>
      )}
      
      {summary.error && (
        <Typography color="error" variant="caption">
          Error: {summary.error}
        </Typography>
      )}
    </Box>
  );
}