import * as math from '../src/CumulativeNormalDistribution'

describe('Stats Math Library', () => {
  describe('standard normal cumulative distribution function', () => {
    it('return 0.5 if x is 0', () => {
      expect(math.std_n_cdf(0)).toBeCloseTo(0.5)
    })
  })

  describe('standard normal probability density function', () => {
    it('moneyness', () => {
      const x = 0.5
      expect(math.std_n_pdf(x)).toEqual(0.3520653267642995)
    })
  })

  describe('inverse standard normal cdf (quantile)', () => {
    it('return infinity for out of bounds value: x >= 1', () => {
      const x = 1
      expect(math.inverse_std_n_cdf(x)).toEqual(Infinity)
    })

    it('return -infinity for out of bounds value: x <= 0', () => {
      const x = 0
      expect(math.inverse_std_n_cdf(x)).toEqual(-Infinity)
    })
  })

  describe('quantilePrime', () => {
    it('return infinity for out of bounds value: x >= 1', () => {
      const x = 1
      expect(math.quantilePrime(x)).toEqual(Infinity)
    })

    it('return infinity for out of bounds value: x <= 0', () => {
      const x = 0
      expect(math.quantilePrime(x)).toEqual(Infinity)
    })

    it('return a number for in bounds number', () => {
      const x = 0.5
      expect(math.quantilePrime(x) > 0).toEqual(!NaN)
    })
    it('return a number for in bounds number', () => {
      const x = 0.5
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

  describe.only('approximations', function() {
    it.skip('expanded polynomials are equal to the approximations', async function() {
      const x = 0.5
      const gx = math.A(x) / math.B(x)
      const actual = math.getCDFSolidity(x)
      const real = math.std_n_cdf(x)
      console.log({ gx, actual, real })
      expect(gx).toEqual(actual)
    })

    it('A(x) / B(x)', async function() {
      const value = 0.5
      const x = value /// Math.sqrt(2)
      const ax = math.A2(x)
      const bx = math.B2(x)
      const ax0 = math.A(value)
      const bx0 = math.B(value)
      const cdf = math.std_n_cdf(value)
      const cdf0 = math.getCDFSolidity(value)
      const ex = 1 - ax / bx
      const ex0 = 1 - ax0 / bx0
      const erf = math.solidityErf(x)
      const gx = 0.5 * (1 + ex)
      const gx0 = 1 - ax0 / bx0 / 2
      const c = 1 - math.C(x)
      const derf = math.derf0(x / Math.sqrt(2))
      const pdf = math.std_n_pdf(x)
      console.log({ cdf, pdf, cdf0, derf })
      console.log({ c })
      console.log({ ex, ex0, erf })
      console.log({ ax, bx, ax0, bx0, gx, gx0, cdf, cdf0, mx: ax0 / bx0 })
    })
    it('WORKS, ex ~ erf', async function() {
      const val = 0.5
      const x = val / Math.sqrt(2)
      const a = math.A3(x)
      const b = math.B3(x)
      const exc = a / b
      const ex = 1 - exc
      const erf = math.solidityErf(x)
      const c = 0.5 * (1 + ex)
      const p = math.pdf(val)
      const pdf = math.std_n_pdf(val)
      const primes = math.Primes(val)
      console.log({ primes, a, b, ap: math.A3Prime(x), bp: math.B3Prime(x) })
      console.log({ exc, ex, erf, p, pdf, c })
    })
  })
})

export const maxError = {
  cdf: 3.15e-3,
  centralInverseCDF: 1.16e-4,
  tailInverseCDF: 2.458e-5,
}
