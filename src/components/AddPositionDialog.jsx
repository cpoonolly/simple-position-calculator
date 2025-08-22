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
  Typography
} from '@mui/material';

export default function AddPositionDialog({ open, onClose, onAdd, availableTickers }) {
  const [positionType, setPositionType] = useState('stock');
  const [formData, setFormData] = useState({
    ticker: '',
    price: '',
    quantity: '',
    strike: '',
    expiration: new Date(),
    side: 'CALL'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdd = () => {
    const position = {
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

  const isFormValid = () => {
    const baseValid = formData.ticker && formData.price && formData.quantity;
    if (positionType === 'option') {
      return baseValid && formData.strike;
    }
    return baseValid;
  };

  return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Position</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Position Type</InputLabel>
                  <Select
                    value={positionType}
                    onChange={(e) => setPositionType(e.target.value)}
                    label="Position Type"
                  >
                    <MenuItem value="stock">Stock</MenuItem>
                    <MenuItem value="option">Option</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Ticker</InputLabel>
                  <Select
                    value={formData.ticker}
                    onChange={(e) => handleChange('ticker', e.target.value)}
                    label="Ticker"
                  >
                    {availableTickers.map(ticker => (
                      <MenuItem key={ticker} value={ticker}>{ticker}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label={positionType === 'option' ? 'Premium (per share)' : 'Price (per share)'}
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  inputProps={{ step: 0.01, min: 0 }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Strike Price"
                      type="number"
                      value={formData.strike}
                      onChange={(e) => handleChange('strike', e.target.value)}
                      inputProps={{ step: 0.01, min: 0 }}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Option Side</InputLabel>
                      <Select
                        value={formData.side}
                        onChange={(e) => handleChange('side', e.target.value)}
                        label="Option Side"
                      >
                        <MenuItem value="CALL">Call</MenuItem>
                        <MenuItem value="PUT">Put</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Expiration Date"
                      type="date"
                      value={formData.expiration.toISOString().split('T')[0]}
                      onChange={(e) => handleChange('expiration', new Date(e.target.value))}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                    />
                  </Grid>
                </>
              )}

              {positionType === 'option' && (
                <Grid item xs={12}>
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