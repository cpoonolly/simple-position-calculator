import React, { useState } from 'react';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Paper,
  Fab
} from '@mui/material';
import { Settings as SettingsIcon, Add as AddIcon } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import MarketSettingsDialog from './components/MarketSettingsDialog';
import AddPositionDialog from './components/AddPositionDialog';
import PositionsTable from './components/PositionsTable';

import { formatCurrency } from './utils/formatters';

// Import our data types
import { Market, Portfolio, OptionTrade, StockTrade, OptionSide } from './dataTypes';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});


function App() {
  const [market, setMarket] = useState(() => {
    const m = new Market();
    m.setRiskFreeRate(0.05);
    m.setPrice('AAPL', 150, 0.25);
    m.setPrice('MSFT', 300, 0.22);
    m.setPrice('TSLA', 200, 0.40);
    return m;
  });

  const [portfolio, setPortfolio] = useState(new Portfolio());
  const [marketDialogOpen, setMarketDialogOpen] = useState(false);
  const [addPositionDialogOpen, setAddPositionDialogOpen] = useState(false);

  const handleMarketSave = (newMarketData) => {
    const newMarket = new Market();
    newMarket.setDate(newMarketData.date);
    newMarket.setRiskFreeRate(newMarketData.riskFreeRate);
    
    Object.entries(newMarketData.prices).forEach(([ticker, data]) => {
      newMarket.setPrice(ticker, data.price, data.volatility);
    });
    
    setMarket(newMarket);
  };

  const handleAddPosition = (positionData) => {
    let position;
    
    if (positionData.type === 'stock') {
      position = new StockTrade();
      position.ticker = positionData.ticker;
      position.price = positionData.price;
      position.quantity = positionData.quantity;
    } else {
      position = new OptionTrade();
      position.ticker = positionData.ticker;
      position.price = positionData.price;
      position.quantity = positionData.quantity;
      position.strike = positionData.strike;
      position.expiration = positionData.expiration;
      position.side = OptionSide[positionData.side];
    }
    
    const newPortfolio = new Portfolio();
    newPortfolio.positions = [...portfolio.positions, position];
    setPortfolio(newPortfolio);
  };

  const handleDeletePosition = (index) => {
    const newPortfolio = new Portfolio();
    newPortfolio.positions = portfolio.positions.filter((_, i) => i !== index);
    setPortfolio(newPortfolio);
  };

  const getAvailableTickers = () => {
    return Object.keys(market.prices);
  };

  const getPortfolioSummary = () => {
    try {
      const totalCostBasis = portfolio.getCostBasis();
      const totalMarkToMarket = portfolio.getMarkToMarket(market);
      const totalPnL = portfolio.getPnL(market);
      return { totalCostBasis, totalMarkToMarket, totalPnL };
    } catch (error) {
      return { totalCostBasis: 0, totalMarkToMarket: 0, totalPnL: 0, error: error.message };
    }
  };

  const summary = getPortfolioSummary();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Portfolio Calculator
            </Typography>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Market Date: {market.date.toLocaleDateString()}
            </Typography>
            <Button
              color="inherit"
              onClick={() => setMarketDialogOpen(true)}
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <SettingsIcon />
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ p: 3 }}>
          {/* Portfolio Summary */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Portfolio Summary
            </Typography>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cost Basis
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(summary.totalCostBasis)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Market Value
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(summary.totalMarkToMarket)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    P&L
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color={summary.totalPnL >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatCurrency(summary.totalPnL)}
                  </Typography>
                </Box>
              </Box>
              {summary.error && (
                <Typography color="error" sx={{ mt: 1 }}>
                  Error: {summary.error}
                </Typography>
              )}
            </Paper>
          </Box>

          {/* Positions */}
          <Box>
            <Typography variant="h5" gutterBottom>
              Positions
            </Typography>
            {portfolio.getAllTickers().length === 0 ? (
              <PositionsTable 
                positions={portfolio.positions}
                market={market}
                onDelete={handleDeletePosition}
              />
            ) : (
              portfolio.getAllTickers().map(ticker => (
                <PositionsTable 
                  key={ticker}
                  positions={portfolio.getPositionsByTicker(ticker)}
                  market={market}
                  onDelete={(index) => {
                    const tickerPositions = portfolio.getPositionsByTicker(ticker);
                    const positionToDelete = tickerPositions[index];
                    const globalIndex = portfolio.positions.indexOf(positionToDelete);
                    handleDeletePosition(globalIndex);
                  }}
                  ticker={ticker}
                  portfolio={portfolio}
                />
              ))
            )}
          </Box>
        </Container>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setAddPositionDialogOpen(true)}
        >
          <AddIcon />
        </Fab>

        {/* Dialogs */}
        <MarketSettingsDialog
          open={marketDialogOpen}
          onClose={() => setMarketDialogOpen(false)}
          market={market}
          onSave={handleMarketSave}
        />

        <AddPositionDialog
          open={addPositionDialogOpen}
          onClose={() => setAddPositionDialogOpen(false)}
          onAdd={handleAddPosition}
          availableTickers={getAvailableTickers()}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
