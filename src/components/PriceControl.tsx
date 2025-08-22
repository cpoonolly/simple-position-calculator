import React from 'react';
import { Stack, TextField, Slider, Typography } from '@mui/material';

interface PriceControlProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  textFieldWidth?: number;
  showLabel?: boolean;
}

export default function PriceControl({
  label = 'Price',
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 0.01,
  textFieldWidth = 120,
  showLabel = true
}: PriceControlProps): React.ReactElement {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value) || 0;
    onChange(newValue);
  };

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    onChange(newValue as number);
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      {showLabel && (
        <Typography sx={{ minWidth: 80 }}>
          {label}:
        </Typography>
      )}
      <TextField
        type="number"
        value={value}
        onChange={handleInputChange}
        variant="filled"
        size="small"
        inputProps={{ step, min, max }}
        sx={{ width: textFieldWidth }}
      />
      <Slider
        value={value}
        onChange={handleSliderChange}
        min={min}
        max={max}
        step={step}
        sx={{ flex: 1 }}
      />
    </Stack>
  );
}