import React from 'react';
import {
  Box,
  Stack,
  IconButton,
  Typography
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import PriceControl from './PriceControl';

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
        <PriceControl
          label="Price"
          value={price}
          onChange={(value) => onPriceChange(ticker, 'price', value.toString())}
          min={0}
          max={1000}
          step={0.01}
        />
        
        {/* Volatility Row */}
        <PriceControl
          label="Volatility"
          value={volatility || 0}
          onChange={(value) => onPriceChange(ticker, 'volatility', value.toString())}
          min={0}
          max={2}
          step={0.01}
        />
      </Stack>
    </Box>
  );
}