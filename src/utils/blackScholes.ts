// Type definitions
type OptionType = 'CALL' | 'PUT';

interface OptionPriceParams {
  price: number;
  type: OptionType;
  strike: number;
  riskFreeRate: number;
  volatility: number;
  timeToExpiry?: number;
}

function calculateOptionPrice(params: OptionPriceParams): number {
  const {
    price,
    type,
    strike,
    riskFreeRate,
    volatility,
    timeToExpiry = 1
  } = params;

  // Input validation
  if (price <= 0) throw new Error('Underlying price must be positive');
  if (strike <= 0) throw new Error('Strike price must be positive');
  if (volatility < 0) throw new Error('Volatility must be non-negative');
  if (timeToExpiry <= 0) throw new Error('Time to expiry must be positive');
  if (riskFreeRate < 0) throw new Error('Risk-free rate must be non-negative');

  // Error function approximation
  function erf(x: number): number {
    const a1: number = 0.254829592;
    const a2: number = -0.284496736;
    const a3: number = 1.421413741;
    const a4: number = -1.453152027;
    const a5: number = 1.061405429;
    const p: number = 0.3275911;
    
    const sign: number = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    
    const t: number = 1.0 / (1.0 + p * x);
    const y: number = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return sign * y;
  }

  // Standard normal cumulative distribution function
  function normalCDF(x: number): number {
    return 0.5 * (1 + erf(x / Math.sqrt(2)));
  }
  
  // Black-Scholes calculation
  const d1: number = (Math.log(price / strike) + (riskFreeRate + 0.5 * volatility * volatility) * timeToExpiry) / 
                     (volatility * Math.sqrt(timeToExpiry));
  const d2: number = d1 - volatility * Math.sqrt(timeToExpiry);
  
  let optionPrice: number;
  
  if (type === 'CALL') {
    optionPrice = price * normalCDF(d1) - strike * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(d2);
  } else if (type === 'PUT') {
    optionPrice = strike * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(-d2) - price * normalCDF(-d1);
  } else {
    throw new Error('Type must be either "CALL" or "PUT"');
  }
  
  return optionPrice;
}

// // Example usage:
// const callResult = calculateOptionPrice({
//   price: 100,
//   type: 'CALL',
//   strike: 105,
//   riskFreeRate: 0.05,
//   volatility: 0.2,
//   timeToExpiry: 0.25 // 3 months
// });

// const putResult = calculateOptionPrice({
//   price: 100,
//   type: 'PUT',
//   strike: 95,
//   riskFreeRate: 0.05,
//   volatility: 0.2
//   // timeToExpiry defaults to 1 year
// });

// console.log('Call Option Result:', callResult);
// console.log('Put Option Result:', putResult);

export {
  calculateOptionPrice,
  type OptionType,
  type OptionPriceParams
};