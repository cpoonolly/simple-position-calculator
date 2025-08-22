import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Box,
  Typography,
  SelectChangeEvent
} from '@mui/material';

interface FormData {
  ticker: string;
  price: string;
  quantity: string;
  strike: string;
  expiration: Date;
  side: 'CALL' | 'PUT';
}

interface PositionData {
  type: 'stock' | 'option';
  ticker: string;
  price: number;
  quantity: number;
  strike?: number;
  expiration?: Date;
  side?: 'CALL' | 'PUT';
}

interface AddPositionDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (position: PositionData) => void;
  availableTickers: string[];
}

export default function AddPositionDialog({ open, onClose, onAdd, availableTickers }: AddPositionDialogProps): React.ReactElement {
  const [positionType, setPositionType] = useState<'stock' | 'option'>('stock');
  const [formData, setFormData] = useState<FormData>({
    ticker: '',
    price: '',
    quantity: '',
    strike: '',
    expiration: new Date(),
    side: 'CALL'
  });

  const handleChange = (field: keyof FormData, value: string | Date): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePositionTypeChange = (event: SelectChangeEvent<string>): void => {
    setPositionType(event.target.value as 'stock' | 'option');
  };

  const handleTickerChange = (event: SelectChangeEvent<string>): void => {
    handleChange('ticker', event.target.value);
  };

  const handleSideChange = (event: SelectChangeEvent<string>): void => {
    handleChange('side', event.target.value as 'CALL' | 'PUT');
  };

  const handleAdd = (): void => {
    const position: PositionData = {
      type: positionType,
      ticker: formData.ticker,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      ...(positionType === 'option' && {
        strike: parseFloat(formData.strike),
        expiration: formData.expiration,
        side: formData.side
      })
    };
    
    onAdd(position);
    
    // Reset form
    setFormData({
      ticker: '',
      price: '',
      quantity: '',
      strike: '',
      expiration: new Date(),
      side: 'CALL'
    });
    onClose();
  };

  const isFormValid = (): boolean => {
    const baseValid = formData.ticker && formData.price && formData.quantity;
    if (positionType === 'option') {
      return !!(baseValid && formData.strike);
    }
    return !!baseValid;
  };

  return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Position</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} {...({} as any)}>
                <FormControl fullWidth>
                  <InputLabel>Position Type</InputLabel>
                  <Select
                    value={positionType}
                    onChange={handlePositionTypeChange}
                    label="Position Type"
                  >
                    <MenuItem value="stock">Stock</MenuItem>
                    <MenuItem value="option">Option</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}  {...({} as any)}>
                <FormControl fullWidth>
                  <InputLabel>Ticker</InputLabel>
                  <Select
                    value={formData.ticker}
                    onChange={handleTickerChange}
                    label="Ticker"
                  >
                    {availableTickers.map(ticker => (
                      <MenuItem key={ticker} value={ticker}>{ticker}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}  {...({} as any)}>
                <TextField
                  label={positionType === 'option' ? 'Premium (per share)' : 'Price (per share)'}
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  inputProps={{ step: 0.01, min: 0 }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}  {...({} as any)}>
                <TextField
                  label={positionType === 'option' ? 'Contracts' : 'Shares'}
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  inputProps={{ step: 1, min: 1 }}
                  fullWidth
                />
              </Grid>

              {positionType === 'option' && (
                <>
                  <Grid item xs={12} sm={6}  {...({} as any)}>
                    <TextField
                      label="Strike Price"
                      type="number"
                      value={formData.strike}
                      onChange={(e) => handleChange('strike', e.target.value)}
                      inputProps={{ step: 0.01, min: 0 }}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}  {...({} as any)}>
                    <FormControl fullWidth>
                      <InputLabel>Option Side</InputLabel>
                      <Select
                        value={formData.side}
                        onChange={handleSideChange}
                        label="Option Side"
                      >
                        <MenuItem value="CALL">Call</MenuItem>
                        <MenuItem value="PUT">Put</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}  {...({} as any)}>
                    <TextField
                      label="Expiration Date"
                      type="date"
                      value={formData.expiration.toISOString().split('T')[0]}
                      onChange={(e) => handleChange('expiration', new Date(e.target.value))}
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
                </>
              )}

              {positionType === 'option' && (
                <Grid item xs={12}  {...({} as any)}>
                  <Typography variant="caption" color="text.secondary">
                    Note: Premium is per share (multiply by 100 for contract value)
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" disabled={!isFormValid()}>
            Add Position
          </Button>
        </DialogActions>
      </Dialog>
  );
}