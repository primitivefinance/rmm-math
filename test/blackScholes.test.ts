import * as math from '../src/BlackScholes'

describe('Black Scholes', () => {
  describe('moneyness', () => {
    it('return 0 if spot and strike are equal', () => {
      expect(math.moneyness(10, 10)).toEqual(0)
    })

    it('return -0.233 if spot and strike are equal', () => {
      expect(math.moneyness(2500, 2000)).toBeCloseTo(-0.223)
    })
  })

  describe('getProportionalVol', () => {
    it('return sigma if tau is 1', () => {
      const sigma = 0.5
      expect(math.getProportionalVol(sigma, 1)).toEqual(sigma)
    })

    it('return 0 if tau is 0', () => {
      const sigma = 0.5
      const tau = 0
      expect(math.getProportionalVol(sigma, tau)).toEqual(0)
    })
  })

  describe('calculateD1', () => {
    it('return 0 if tau is 0', () => {
      const tau = 0
      expect(math.calculateD1(1, 1, tau, 1)).toEqual(0)
    })
  })

  describe('calculateD2', () => {
    it('return 0 if tau is 0', () => {
      const tau = 0
      expect(math.calculateD2(1, 1, tau, 1)).toEqual(0)
    })
  })

  describe('callDelta', () => {
    it('return 0.5 if tau is 0', () => {
      const tau = 0
      expect(math.callDelta(1, 1, tau, 1)).toBeCloseTo(0.5)
    })
  })

  describe('callPremium', () => {
    it('return 0 if tau is 0', () => {
      const tau = 0
      expect(math.callPremium(1, 1, tau, 1)).toEqual(0)
    })
  })
})
