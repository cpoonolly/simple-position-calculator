import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

export default function TickerSummary({ ticker, portfolio, market }) {
  const getSummary = () => {
    try {
      const costBasis = portfolio.getCostBasis(ticker);
      const markToMarket = portfolio.getMarkToMarket(market, ticker);
      const pnl = portfolio.getPnL(market, ticker);
      return { costBasis, markToMarket, pnl };
    } catch (error) {
      return { costBasis: 0, markToMarket: 0, pnl: 0, error: error.message };
    }
  };

  const summary = getSummary();

  return (
    <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
      <Typography variant="h6" gutterBottom>
        {ticker}
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
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
      {summary.error && (
        <Typography color="error" variant="caption">
          Error: {summary.error}
        </Typography>
      )}
    </Box>
  );
}