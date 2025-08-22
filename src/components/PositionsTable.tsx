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
  IconButton,
  Box
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import TickerSummary from './TickerSummary';

import { formatCurrency, formatDate } from '../utils/formatters';
import { Position, Market, Portfolio } from '../types';

export const formatPnL = (value: number): React.ReactElement => {
  const color = value >= 0 ? 'success' : 'error';
  return (
    <Typography color={color} fontWeight="bold">
      {formatCurrency(value)}
    </Typography>
  );
};

interface PositionValues {
  costBasis: number;
  markToMarket: number;
  pnl: number;
  error?: string;
}

interface PositionsTableProps {
  positions: Position[];
  market: Market;
  onDelete: (index: number) => void;
  onMarketDataChange?: (ticker: string, field: 'price' | 'volatility', value: number) => void;
  ticker?: string;
  portfolio?: Portfolio;
}

export default function PositionsTable({ positions, market, onDelete, onMarketDataChange, ticker, portfolio }: PositionsTableProps): React.ReactElement {
  const calculatePositionValues = (position: Position): PositionValues => {
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
        error: (error as Error).message 
      };
    }
  };

  if (!positions || positions.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {ticker ? `No positions for ${ticker} yet.` : 'No positions yet. Add your first position to get started.'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ mb: 3 }}>
      {ticker && portfolio && (
        <TickerSummary ticker={ticker} portfolio={portfolio} market={market} onMarketDataChange={onMarketDataChange} />
      )}
      <TableContainer>
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
                <TableCell>{formatCurrency((position as any).price)}</TableCell>
                <TableCell>
                  {(position as any).quantity}
                  {isOption && ' contracts'}
                </TableCell>
                <TableCell>
                  {isOption ? formatCurrency((position as any).strike) : '-'}
                </TableCell>
                <TableCell>
                  {isOption ? formatDate((position as any).expiration) : '-'}
                </TableCell>
                <TableCell>
                  {isOption ? (
                    <Chip 
                      label={(position as any).side} 
                      size="small"
                      color={(position as any).side === 'CALL' ? 'success' : 'warning'}
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
                    size="small"
                    sx={{ color: 'white' }}
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
    </Paper>
  );
}