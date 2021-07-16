import { std_n_cdf } from './CumulativeNormalDistribution'

/**
 * @param strike Strike price of option
 * @param spot Spot price of underlying asset
 * @returns log(spot / strike)
 */
export function moneyness(strike: number, spot: number): number {
  return Math.log(spot / strike)
}

/**
 * @notice Calculates a common expression
 * @param sigma Volatility as a float
 * @param tau Time until expiry, in years, as a float
 * @returns volatilty * sqrt(tau)
 */
export function getProportionalVol(sigma: number, tau: number): number {
  return sigma * Math.sqrt(tau)
}

/**
 * @notice Calculates the d1 auxiliary variable in the black-scholes formula
 * @param strike Strike price of option, as a float
 * @param sigma Implied volatility of option, as a float
 * @param tau Time until expiry, in years
 * @param spot Reference spot price of underlying asset, as a float
 * @param rate Interest rate
 * @returns (Log(spot / strike) + sigma^2 / 2 * tau) / (sigma * sqrt(tau))
 */
export function calculateD1(strike: number, sigma: number, tau: number, spot: number, rate: number = 0): number {
  if (tau < 0) return 0
  return (moneyness(spot, strike) + (rate + Math.pow(sigma, 2) / 2) * tau) / getProportionalVol(sigma, tau)
}

/**
 * @notice Calculates the d2 auxiliary variable in the black-scholes formula
 * @param strike Strike price of option, as a float
 * @param sigma Implied volatility of option, as a float
 * @param tau Time until expiry, in years
 * @param spot Reference spot price of underlying asset, as a float
 * @param rate Interest rate
 * @returns d1 - sigma * sqrt(tau)
 */
export function calculateD2(strike: number, sigma: number, tau: number, spot: number, rate: number = 0): number {
  return calculateD1(strike, sigma, tau, spot, rate) - getProportionalVol(sigma, tau)
}

/**
 * @param strike Strike price of option, as a float
 * @param sigma Implied volatility of option, as a float
 * @param tau Time until expiry, in years
 * @param spot Reference spot price of underlying asset, as a float
 * @param rate Interest rate
 * @returns Greek `delta` of a call option with parameters `strike`, `sigma,` and `tau`
 */
export function callDelta(strike: number, sigma: number, tau: number, spot: number, rate: number = 0): number {
  const d1 = calculateD1(strike, sigma, tau, spot, rate)
  const delta: number = std_n_cdf(d1)
  return delta
}

/**
 * @param strike Strike price of option, as a float
 * @param sigma Implied volatility of option, as a float
 * @param tau Time until expiry, in years
 * @param spot Reference spot price of underlying asset, as a float
 * @param rate Interest rate
 * @returns Black-Scholes price of call option with parameters
 */
export function callPremium(strike: number, sigma: number, tau: number, spot: number, rate: number = 0): number {
  const d1 = calculateD1(strike, sigma, tau, spot, rate)
  const d2 = d1 - getProportionalVol(sigma, tau)
  return std_n_cdf(d1) * spot - std_n_cdf(d2) * strike * Math.exp(-tau * rate)
}
