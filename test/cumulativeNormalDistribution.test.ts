import * as math from '../src/CumulativeNormalDistribution'

describe('Stats Math Library', () => {
  describe('standard normal cumulative distribution function', () => {
    it('return 0.5 if x is 0', () => {
      expect(math.std_n_cdf(0)).toBeCloseTo(0.5)
    })
  })

  describe('standard normal probability density function', () => {
    it('moneyness', () => {
      expect(2).toEqual(2)
    })
  })

  describe('inverse standard normal cdf (quantile)', () => {
    /* it('return nan for out of bounds value: x > 1', () => {
      const x = 1.5
      expect(math.inverse_std_n_cdf(x)).toEqual(NaN)
    }) */
  })

  describe('quantilePrime', () => {
    it('return nan for out of bounds value: x > 1', () => {
      const x = 1.5
      expect(math.quantilePrime(x)).toEqual(NaN)
    })
  })

  describe('solidityNormalCDF', () => {
    it('moneyness', () => {
      expect(2).toEqual(2)
    })
  })

  describe('solidityInverseCDF', () => {
    it('moneyness', () => {
      expect(2).toEqual(2)
    })
  })
})
