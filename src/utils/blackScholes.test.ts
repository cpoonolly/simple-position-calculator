import { describe, it, expect } from 'vitest';
import {
  calculateOptionPrice,
  type OptionPriceParams
} from './blackScholes';

describe('Black-Scholes Option Pricing', () => {
  describe('calculateOptionPrice', () => {
    it('calculates call option price correctly', () => {
      const result = calculateOptionPrice({
        price: 100,
        type: 'CALL',
        strike: 105,
        riskFreeRate: 0.05,
        volatility: 0.2,
        timeToExpiry: 1
      });
      expect(result).toBeCloseTo(8.02, 2);
    });

    it('calculates put option price correctly', () => {
      const result = calculateOptionPrice({
        price: 100,
        type: 'PUT',
        strike: 95,
        riskFreeRate: 0.05,
        volatility: 0.2,
        timeToExpiry: 1
      });
      expect(result).toBeCloseTo(3.71, 2);
    });

    it('calculates at-the-money call option correctly', () => {
      const result = calculateOptionPrice({
        price: 100,
        type: 'CALL',
        strike: 100,
        riskFreeRate: 0.05,
        volatility: 0.2,
        timeToExpiry: 1
      });
      expect(result).toBeCloseTo(10.45, 2);
    });

    it('calculates at-the-money put option correctly', () => {
      const result = calculateOptionPrice({
        price: 100,
        type: 'PUT',
        strike: 100,
        riskFreeRate: 0.05,
        volatility: 0.2,
        timeToExpiry: 1
      });
      expect(result).toBeCloseTo(5.57, 2);
    });

    it('handles different time to expiry', () => {
      const result3Months = calculateOptionPrice({
        price: 100,
        type: 'CALL',
        strike: 105,
        riskFreeRate: 0.05,
        volatility: 0.2,
        timeToExpiry: 0.25
      });
      
      const result1Year = calculateOptionPrice({
        price: 100,
        type: 'CALL',
        strike: 105,
        riskFreeRate: 0.05,
        volatility: 0.2,
        timeToExpiry: 1
      });
      
      expect(result3Months).toBeLessThan(result1Year);
      expect(result3Months).toBeCloseTo(2.48, 2);
    });

    it('validates input parameters', () => {
      expect(() => calculateOptionPrice({
        price: -10,
        type: 'CALL',
        strike: 105,
        riskFreeRate: 0.05,
        volatility: 0.2,
        timeToExpiry: 1
      })).toThrow('Underlying price must be positive');
      
      expect(() => calculateOptionPrice({
        price: 100,
        type: 'CALL',
        strike: -105,
        riskFreeRate: 0.05,
        volatility: 0.2,
        timeToExpiry: 1
      })).toThrow('Strike price must be positive');
      
      expect(() => calculateOptionPrice({
        price: 100,
        type: 'CALL',
        strike: 105,
        riskFreeRate: 0.05,
        volatility: -0.2,
        timeToExpiry: 1
      })).toThrow('Volatility must be non-negative');
      
      expect(() => calculateOptionPrice({
        price: 100,
        type: 'CALL',
        strike: 105,
        riskFreeRate: 0.05,
        volatility: 0.2,
        timeToExpiry: -1
      })).toThrow('Time to expiry must be positive');
      
      expect(() => calculateOptionPrice({
        price: 100,
        type: 'CALL',
        strike: 105,
        riskFreeRate: -0.05,
        volatility: 0.2,
        timeToExpiry: 1
      })).toThrow('Risk-free rate must be non-negative');
      
      expect(() => calculateOptionPrice({
        price: 100,
        type: 'INVALID' as any,
        strike: 105,
        riskFreeRate: 0.05,
        volatility: 0.2,
        timeToExpiry: 1
      })).toThrow('Type must be either "CALL" or "PUT"');
    });

    it('uses default time to expiry when not provided', () => {
      const resultWithDefault = calculateOptionPrice({
        price: 100,
        type: 'CALL',
        strike: 105,
        riskFreeRate: 0.05,
        volatility: 0.2
      });
      
      const resultExplicit = calculateOptionPrice({
        price: 100,
        type: 'CALL',
        strike: 105,
        riskFreeRate: 0.05,
        volatility: 0.2,
        timeToExpiry: 1
      });
      
      expect(resultWithDefault).toBe(resultExplicit);
    });
  });

  describe('Option Price Behavior', () => {
    it('shows call prices decrease as strike increases', () => {
      const strikes = [90, 95, 100, 105, 110];
      const results = strikes.map(strike => 
        calculateOptionPrice({
          price: 100,
          type: 'CALL',
          strike,
          riskFreeRate: 0.05,
          volatility: 0.2,
          timeToExpiry: 1
        })
      );

      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i]).toBeGreaterThan(results[i + 1]);
      }
    });

    it('shows put prices increase as strike increases', () => {
      const strikes = [90, 95, 100, 105, 110];
      const results = strikes.map(strike => 
        calculateOptionPrice({
          price: 100,
          type: 'PUT',
          strike,
          riskFreeRate: 0.05,
          volatility: 0.2,
          timeToExpiry: 1
        })
      );

      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i]).toBeLessThan(results[i + 1]);
      }
    });

    it('shows option prices increase with higher volatility', () => {
      const volatilities = [0.1, 0.2, 0.3, 0.4];
      const callResults = volatilities.map(vol => 
        calculateOptionPrice({
          price: 100,
          type: 'CALL',
          strike: 100,
          riskFreeRate: 0.05,
          volatility: vol,
          timeToExpiry: 1
        })
      );

      const putResults = volatilities.map(vol => 
        calculateOptionPrice({
          price: 100,
          type: 'PUT',
          strike: 100,
          riskFreeRate: 0.05,
          volatility: vol,
          timeToExpiry: 1
        })
      );

      // Both calls and puts should increase with volatility
      for (let i = 0; i < callResults.length - 1; i++) {
        expect(callResults[i]).toBeLessThan(callResults[i + 1]);
        expect(putResults[i]).toBeLessThan(putResults[i + 1]);
      }
    });

    it('shows option prices decrease with shorter time to expiry', () => {
      const times = [0.25, 0.5, 0.75, 1.0];
      const callResults = times.map(time => 
        calculateOptionPrice({
          price: 100,
          type: 'CALL',
          strike: 105,
          riskFreeRate: 0.05,
          volatility: 0.2,
          timeToExpiry: time
        })
      );

      // Option prices should increase with more time
      for (let i = 0; i < callResults.length - 1; i++) {
        expect(callResults[i]).toBeLessThan(callResults[i + 1]);
      }
    });
  });

  describe('Put-Call Parity', () => {
    it('satisfies put-call parity relationship', () => {
      const S = 100; // Stock price
      const K = 100; // Strike price
      const r = 0.05; // Risk-free rate
      const sigma = 0.2; // Volatility
      const T = 1; // Time to expiry

      const callResult = calculateOptionPrice({
        price: S,
        type: 'CALL',
        strike: K,
        riskFreeRate: r,
        volatility: sigma,
        timeToExpiry: T
      });
      
      const putResult = calculateOptionPrice({
        price: S,
        type: 'PUT',
        strike: K,
        riskFreeRate: r,
        volatility: sigma,
        timeToExpiry: T
      });

      // Put-Call Parity: C - P = S - K * e^(-r*T)
      const leftSide = callResult - putResult;
      const rightSide = S - K * Math.exp(-r * T);

      expect(leftSide).toBeCloseTo(rightSide, 2);
    });

    it('satisfies put-call parity for different parameters', () => {
      const testCases = [
        { S: 50, K: 55, r: 0.02, sigma: 0.15, T: 0.5 },
        { S: 200, K: 180, r: 0.08, sigma: 0.35, T: 2.0 },
        { S: 75, K: 75, r: 0.04, sigma: 0.28, T: 0.25 }
      ];

      testCases.forEach(({ S, K, r, sigma, T }) => {
        const callResult = calculateOptionPrice({
          price: S,
          type: 'CALL',
          strike: K,
          riskFreeRate: r,
          volatility: sigma,
          timeToExpiry: T
        });
        
        const putResult = calculateOptionPrice({
          price: S,
          type: 'PUT',
          strike: K,
          riskFreeRate: r,
          volatility: sigma,
          timeToExpiry: T
        });

        const leftSide = callResult - putResult;
        const rightSide = S - K * Math.exp(-r * T);

        expect(leftSide).toBeCloseTo(rightSide, 2);
      });
    });
  });
});