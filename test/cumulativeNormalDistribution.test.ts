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

    it('return a number for in bounds number', () => {
      const x = 1
      expect(math.quantilePrime(x) > 0).toEqual(!NaN)
    })
    it('return a number for in bounds number', () => {
      const x = 0
      expect(math.quantilePrime(x) > 0).toEqual(!NaN)
    })
  })

  describe('solidity cdf', () => {
    it('cdf of 0', () => {
      expect(math.getCDFSolidity(0)).toBeCloseTo(0.5, maxError.cdf)
    })

    it('cdf of -1', () => {
      expect(math.getCDFSolidity(-1)).toBeCloseTo(0.1586552539314570514148, maxError.cdf)
    })

    it('cdf of 1', () => {
      expect(math.getCDFSolidity(1)).toBeCloseTo(0.8413447460685429485852, maxError.cdf)
    })
  })

  describe('solidity inverse cdf', () => {
    it('inverseCDF of 0.5', () => {
      expect(math.getInverseCDFSolidity(0.5)).toBeCloseTo(0, maxError.centralInverseCDF)
    })

    it('inverseCDF of 0.7', () => {
      expect(math.getInverseCDFSolidity(0.7)).toBeCloseTo(0.5244005127080407840383, maxError.centralInverseCDF)
    })

    it('inverseCDF high tail', () => {
      expect(math.getInverseCDFSolidity(0.98)).toBeCloseTo(2.053748910631823052937, maxError.tailInverseCDF)
    })

    it('inverseCDF low tail', () => {
      expect(math.getInverseCDFSolidity(0.01)).toBeCloseTo(-2.32634787404084110089, maxError.tailInverseCDF)
    })
  })
})

export const maxError = {
  cdf: 3.15e-3,
  centralInverseCDF: 1.16e-4,
  tailInverseCDF: 2.458e-5,
}
