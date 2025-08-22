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
  Grid,
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
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}  {...({} as any)}>
                <TextField
                  label="Market Date"
                  type="date"
                  value={marketDate.toISOString().split('T')[0]}
                  onChange={(e) => setMarketDate(new Date(e.target.value))}
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
              </Grid>
              <Grid item xs={12} sm={6}  {...({} as any)}>
                <TextField
                  label="Risk-Free Rate"
                  type="number"
                  value={riskFreeRate}
                  onChange={(e) => setRiskFreeRate(e.target.value)}
                  inputProps={{ step: 0.001, min: 0 }}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Stock Prices & Volatilities
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={8}  {...({} as any)}>
                  <TextField
                    label="Add New Ticker"
                    value={newTicker}
                    onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTicker()}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}  {...({} as any)}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddTicker}
                    disabled={!newTicker}
                    fullWidth
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {Object.entries(prices).map(([ticker, data]) => (
              <Box key={ticker} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={3}  {...({} as any)}>
                    <Typography variant="h6">{ticker}</Typography>
                  </Grid>
                  <Grid item xs={3}  {...({} as any)}>
                    <TextField
                      label="Price"
                      type="number"
                      value={data.price}
                      onChange={(e) => handlePriceChange(ticker, 'price', e.target.value)}
                      inputProps={{ step: 0.01, min: 0 }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={3}  {...({} as any)}>
                    <TextField
                      label="Volatility"
                      type="number"
                      value={data.volatility || ''}
                      onChange={(e) => handlePriceChange(ticker, 'volatility', e.target.value)}
                      inputProps={{ step: 0.01, min: 0 }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={3}  {...({} as any)}>
                    <IconButton 
                      onClick={() => handleRemoveTicker(ticker)}
                      sx={{ color: 'white' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
  );
}