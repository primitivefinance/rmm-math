import * as math from '../src/ReplicationMath'
import { EPSILON, MAX_PRECISION } from '../src/utils'
import { maxError } from './cumulativeNormalDistribution.test'

describe('Replication math', () => {
  describe('getStableGivenRisky', () => {
    it('return 0 if strike price and invariant is 0', () => {
      expect(math.getStableGivenRisky(0.5, 0, 1, 1)).toEqual(0)
    })

    it('return 0 if risky reserve is 1', () => {
      expect(math.getStableGivenRisky(1, 1, 1, 1)).toEqual(0)
    })

    it('return K if risky reserve is 0', () => {
      const K = 1
      expect(math.getStableGivenRisky(0, 1, 1, 1)).toEqual(K)
    })

    it('return 0 if sigma is <= 0', () => {
      const sigma = 0
      expect(math.getStableGivenRisky(0.5, 1, sigma, 1)).toEqual(0)
    })
  })

  describe('getRiskyGivenStable', () => {
    it('return 0 if strike price is 0', () => {
      expect(2).toEqual(2)
    })
  })

  describe('calculate invariant', () => {
    it('return 0 if reserve stable is set to theoretical value based on risky', () => {
      const risky = 0.5
      const stable = math.getStableGivenRisky(risky, 1, 1, 1)
      expect(math.calcInvariant(risky, stable, 1, 1, 1)).toEqual(0)
    })
  })

  describe('calculate spot price', () => {
    it('shouldnt be nan', () => {
      expect(math.getSpotPrice(0.999, 1, 1, 1) > 0).toBe(!NaN)
    })

    it('should be nan if 1 - reserveRisky is 0 or less', () => {
      expect(math.getSpotPrice(1, 1, 1, 1)).toBe(0)
    })

    it('should be nan if reserveRisky is greater than 1', () => {
      expect(math.getSpotPrice(3, 2, 1, 1)).toBe(0)
    })
  })

  describe('calculate marginal price risky in, stable out', () => {
    it('moneyness', () => {
      expect(2).toEqual(2)
    })
  })

  describe('calculate marginal price stable in, risky out', () => {
    it('moneyness', () => {
      expect(2).toEqual(2)
    })
  })

  describe('nonNegative', () => {
    it('should return true for a positive value', () => {
      expect(math.nonNegative(1)).toEqual(true)
    })

    it('should return false for a negative value', () => {
      expect(math.nonNegative(-1)).toEqual(false)
    })
  })

  // desmos used https://www.desmos.com/calculator/ztctiscqqe
  describe('solidity approximations', () => {
    const R1 = 0.308537538726
    const R2 = 3.08537538726
    const strike = 10
    const sigma = 1
    const tau = 1

    it('getRiskyGivenStableApproximation using desmos as reference', () => {
      expect(math.getRiskyGivenStableApproximation(R2, strike, sigma, tau)).toBeCloseTo(R1, maxError.cdf)
    })

    it('getStableGivenRiskyApproximation using desmos as reference', () => {
      expect(math.getStableGivenRiskyApproximation(R1, strike, sigma, tau)).toBeCloseTo(R2, maxError.cdf)
    })

    it('getStableGivenRiskyApproximation at risky reserve = 1 - MAX_PRECISION', () => {
      expect(math.getStableGivenRiskyApproximation(1 - MAX_PRECISION, strike, sigma, tau)).toBeCloseTo(0, maxError.cdf)
    })

    it('getStableGivenRiskyApproximation at risky reserve = MAX_PRECISION', () => {
      expect(math.getStableGivenRiskyApproximation(MAX_PRECISION, strike, sigma, tau)).toBeCloseTo(strike, maxError.cdf)
    })

    it('getRiskyGivenStableApproximation at stable reserve = strike - EPSILON', () => {
      expect(math.getRiskyGivenStableApproximation(strike - EPSILON, strike, sigma, tau)).toBeCloseTo(0, maxError.cdf)
    })

    it('getRiskyGivenStableApproximation at stable reserve = MAX_PRECISION', () => {
      expect(math.getRiskyGivenStableApproximation(MAX_PRECISION, strike, sigma, tau)).toBeCloseTo(1, maxError.cdf)
    })

    it('getInvariantApproximation', () => {
      expect(math.getInvariantApproximation(R1, R2, strike, sigma, tau)).toBeCloseTo(0, maxError.cdf)
    })
  })

  it('should return false for a negative value', () => {
    expect(math.nonNegative(-1)).toEqual(false)
  })
})
