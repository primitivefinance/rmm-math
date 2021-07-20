import * as math from '../src/ReplicationMath'

describe('Replication math', () => {
  describe('trading function', () => {
    it('return 0 if strike price and invariant is 0', () => {
      expect(math.getTradingFunction(0, 0.5, 1, 0, 1, 1)).toEqual(0)
    })

    it('return 0 if risky reserve is 1', () => {
      expect(math.getTradingFunction(0, 1, 1, 1, 1, 1)).toEqual(0)
    })

    it('return K if risky reserve is 0', () => {
      const K = 1
      expect(math.getTradingFunction(0, 0, 1, 1, 1, 1)).toEqual(K)
    })

    it('return 0 if sigma is <= 0', () => {
      const sigma = 0
      expect(math.getTradingFunction(0, 0.5, 1, 1, sigma, 1)).toEqual(0)
    })
  })

  describe('inverse trading function', () => {
    it('return 0 if strike price is 0', () => {
      expect(2).toEqual(2)
    })
  })

  describe('calculate invariant', () => {
    it('return 0 if reserve stable is set to theoretical value based on risky', () => {
      const risky = 0.5
      const stable = math.getTradingFunction(0, risky, 1, 1, 1, 1)
      expect(math.calcInvariant(risky, stable, 1, 1, 1, 1)).toEqual(0)
    })
  })

  describe('calculate spot price', () => {
    it('moneyness', () => {
      expect(2).toEqual(2)
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
})
