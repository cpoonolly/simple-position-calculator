import React, { useState, useRef } from 'react';
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
  Divider
} from '@mui/material';

import { Add as AddIcon, FileUpload as ImportIcon, FileDownload as ExportIcon } from '@mui/icons-material';
import { Market, Portfolio } from '../dataTypes';
import { exportData, importFromFile } from '../utils/export';
import TickerRow from './TickerRow';

interface MarketData {
  date: Date;
  riskFreeRate: number;
  prices: { [ticker: string]: { price: number; volatility?: number } };
}

interface MarketSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  market: Market;
  portfolio: Portfolio;
  onSave: (marketData: MarketData) => void;
  onImport: (market: Market, portfolio: Portfolio) => void;
}

export default function MarketSettingsDialog({ open, onClose, market, portfolio, onSave, onImport }: MarketSettingsDialogProps): React.ReactElement {
  const [marketDate, setMarketDate] = useState<Date>(market?.date || new Date());
  const [riskFreeRate, setRiskFreeRate] = useState<number | string>(market?.riskFreeRate || 0.05);
  const [prices, setPrices] = useState<{ [ticker: string]: { price: number; volatility?: number } }>(market?.prices || {});
  const [newTicker, setNewTicker] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExport = (): void => {
    try {
      exportData(market, portfolio);
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleImportClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { market: newMarket, portfolio: newPortfolio } = await importFromFile(file);
      onImport(newMarket, newPortfolio);
      onClose();
    } catch (error) {
      alert((error as Error).message);
    }
    
    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Market Settings</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {/* Import/Export Section */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Data Management
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<ImportIcon />}
                  onClick={handleImportClick}
                  fullWidth
                >
                  Import Data
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  onClick={handleExport}
                  fullWidth
                >
                  Export Data
                </Button>
              </Stack>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".json"
                style={{ display: 'none' }}
              />
            </Box>
            
            <Divider />
            
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
              <TickerRow
                key={ticker}
                ticker={ticker}
                price={data.price}
                volatility={data.volatility}
                onPriceChange={handlePriceChange}
                onRemove={handleRemoveTicker}
              />
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