import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Stack,
  IconButton
} from '@mui/material';

import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Market } from '../dataTypes';

interface MarketData {
  date: Date;
  riskFreeRate: number;
  prices: { [ticker: string]: { price: number; volatility?: number } };
}

interface MarketSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  market: Market;
  onSave: (marketData: MarketData) => void;
}

export default function MarketSettingsDialog({ open, onClose, market, onSave }: MarketSettingsDialogProps): React.ReactElement {
  const [marketDate, setMarketDate] = useState<Date>(market?.date || new Date());
  const [riskFreeRate, setRiskFreeRate] = useState<number | string>(market?.riskFreeRate || 0.05);
  const [prices, setPrices] = useState<{ [ticker: string]: { price: number; volatility?: number } }>(market?.prices || {});
  const [newTicker, setNewTicker] = useState<string>('');

  const handleAddTicker = (): void => {
    if (newTicker && !prices[newTicker]) {
      setPrices(prev => ({
        ...prev,
        [newTicker]: { price: 100, volatility: 0.2 }
      }));
      setNewTicker('');
    }
  };

  const handleRemoveTicker = (ticker: string): void => {
    setPrices(prev => {
      const newPrices = { ...prev };
      delete newPrices[ticker];
      return newPrices;
    });
  };

  const handlePriceChange = (ticker: string, field: 'price' | 'volatility', value: string): void => {
    setPrices(prev => ({
      ...prev,
      [ticker]: {
        ...prev[ticker],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleSave = (): void => {
    const newMarket: MarketData = {
      date: marketDate,
      riskFreeRate: parseFloat(riskFreeRate.toString()) || 0,
      prices
    };
    onSave(newMarket);
    onClose();
  };

  return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Market Settings</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {/* Market Date & Risk-Free Rate */}
            <Stack direction="row" spacing={2}>
              <TextField
                label="Market Date"
                type="date"
                value={marketDate.toISOString().split('T')[0]}
                onChange={(e) => setMarketDate(new Date(e.target.value))}
                variant="filled"
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& input[type="date"]::-webkit-calendar-picker-indicator': {
                    filter: 'invert(1)',
                  },
                }}
                fullWidth
              />
              <TextField
                label="Risk-Free Rate"
                type="number"
                value={riskFreeRate}
                onChange={(e) => setRiskFreeRate(e.target.value)}
                variant="filled"
                size="small"
                inputProps={{ step: 0.001, min: 0 }}
                fullWidth
              />
            </Stack>

            <Typography variant="h6" sx={{ mt: 1 }}>
              Stock Prices & Volatilities
            </Typography>

            {/* Add New Ticker Row */}
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Add New Ticker"
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTicker()}
                variant="filled"
                size="small"
                sx={{ flex: 2 }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddTicker}
                disabled={!newTicker}
                sx={{ flex: 1 }}
              >
                Add
              </Button>
            </Stack>

            {/* Ticker Rows */}
            {Object.entries(prices).map(([ticker, data]) => (
              <Box key={ticker} sx={{ p: 2, border: '1px solid #5f5f5f', borderRadius: 1 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ minWidth: 80 }}>
                    <Typography variant="h6">{ticker}</Typography>
                  </Box>
                  <TextField
                    label="Price"
                    type="number"
                    value={data.price}
                    onChange={(e) => handlePriceChange(ticker, 'price', e.target.value)}
                    variant="filled"
                    size="small"
                    inputProps={{ step: 0.01, min: 0 }}
                    fullWidth
                  />
                  <TextField
                    label="Volatility"
                    type="number"
                    value={data.volatility || ''}
                    onChange={(e) => handlePriceChange(ticker, 'volatility', e.target.value)}
                    variant="filled"
                    size="small"
                    inputProps={{ step: 0.01, min: 0 }}
                    fullWidth
                  />
                  <IconButton 
                    onClick={() => handleRemoveTicker(ticker)}
                    sx={{ color: 'white', minWidth: 48 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
  );
}