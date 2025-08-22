import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
};

const formatPnL = (value) => {
  const color = value >= 0 ? 'success' : 'error';
  return (
    <Typography color={color} fontWeight="bold">
      {formatCurrency(value)}
    </Typography>
  );
};

export default function PositionsTable({ positions, market, onDelete }) {
  const calculatePositionValues = (position) => {
    try {
      const costBasis = position.getCostBasis();
      const markToMarket = position.getMarkToMarket(market);
      const pnl = position.getPnL(market);
      return { costBasis, markToMarket, pnl };
    } catch (error) {
      return { 
        costBasis: 0, 
        markToMarket: 0, 
        pnl: 0, 
        error: error.message 
      };
    }
  };

  if (!positions || positions.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No positions yet. Add your first position to get started.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Type</strong></TableCell>
            <TableCell><strong>Ticker</strong></TableCell>
            <TableCell><strong>Price/Premium</strong></TableCell>
            <TableCell><strong>Quantity</strong></TableCell>
            <TableCell><strong>Strike</strong></TableCell>
            <TableCell><strong>Expiration</strong></TableCell>
            <TableCell><strong>Side</strong></TableCell>
            <TableCell><strong>Cost Basis</strong></TableCell>
            <TableCell><strong>Mark-to-Market</strong></TableCell>
            <TableCell><strong>P&L</strong></TableCell>
            <TableCell><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {positions.map((position, index) => {
            const values = calculatePositionValues(position);
            const isOption = position.constructor.name === 'OptionTrade';
            
            return (
              <TableRow key={index}>
                <TableCell>
                  <Chip 
                    label={isOption ? 'Option' : 'Stock'} 
                    size="small"
                    color={isOption ? 'secondary' : 'primary'}
                  />
                </TableCell>
                <TableCell><strong>{position.ticker}</strong></TableCell>
                <TableCell>{formatCurrency(position.price)}</TableCell>
                <TableCell>
                  {position.quantity}
                  {isOption && ' contracts'}
                </TableCell>
                <TableCell>
                  {isOption ? formatCurrency(position.strike) : '-'}
                </TableCell>
                <TableCell>
                  {isOption ? formatDate(position.expiration) : '-'}
                </TableCell>
                <TableCell>
                  {isOption ? (
                    <Chip 
                      label={position.side} 
                      size="small"
                      color={position.side === 'CALL' ? 'success' : 'warning'}
                    />
                  ) : '-'}
                </TableCell>
                <TableCell>
                  {values.error ? (
                    <Typography color="error" fontSize="small">Error</Typography>
                  ) : (
                    formatCurrency(values.costBasis)
                  )}
                </TableCell>
                <TableCell>
                  {values.error ? (
                    <Typography color="error" fontSize="small">Error</Typography>
                  ) : (
                    formatCurrency(values.markToMarket)
                  )}
                </TableCell>
                <TableCell>
                  {values.error ? (
                    <Typography color="error" fontSize="small" title={values.error}>
                      Error
                    </Typography>
                  ) : (
                    formatPnL(values.pnl)
                  )}
                </TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => onDelete(index)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}