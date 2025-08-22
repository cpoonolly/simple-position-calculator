import React from 'react';
import {
  Box,
  Stack,
  IconButton,
  TextField,
  Typography,
  Slider
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

interface TickerRowProps {
  ticker: string;
  price: number;
  volatility?: number;
  onPriceChange: (ticker: string, field: 'price' | 'volatility', value: string) => void;
  onRemove: (ticker: string) => void;
}

export default function TickerRow({ 
  ticker, 
  price, 
  volatility, 
  onPriceChange, 
  onRemove 
}: TickerRowProps): React.ReactElement {
  return (
    <Box sx={{ p: 2, border: '1px solid #5f5f5f', borderRadius: 1 }}>
      <Stack spacing={2}>
        {/* Ticker Header with Delete Button */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{ticker}</Typography>
          <IconButton 
            onClick={() => onRemove(ticker)}
            sx={{ color: 'white' }}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
        
        {/* Price Row */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography sx={{ minWidth: 80 }}>Price:</Typography>
          <TextField
            type="number"
            value={price}
            onChange={(e) => onPriceChange(ticker, 'price', e.target.value)}
            variant="filled"
            size="small"
            inputProps={{ step: 0.01, min: 0, max: 1000 }}
            sx={{ width: 120 }}
          />
          <Slider
            value={price}
            onChange={(_, value) => onPriceChange(ticker, 'price', value.toString())}
            min={0}
            max={1000}
            step={0.01}
            sx={{ flex: 1 }}
          />
        </Stack>
        
        {/* Volatility Row */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography sx={{ minWidth: 80 }}>Volatility:</Typography>
          <TextField
            type="number"
            value={volatility || ''}
            onChange={(e) => onPriceChange(ticker, 'volatility', e.target.value)}
            variant="filled"
            size="small"
            inputProps={{ step: 0.01, min: 0, max: 2 }}
            sx={{ width: 120 }}
          />
          <Slider
            value={volatility || 0}
            onChange={(_, value) => onPriceChange(ticker, 'volatility', value.toString())}
            min={0}
            max={2}
            step={0.01}
            sx={{ flex: 1 }}
          />
        </Stack>
      </Stack>
    </Box>
  );
}