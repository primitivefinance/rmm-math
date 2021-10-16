import { getCDFSolidity } from '.'
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
 * @notice Calculates a common equation
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
  if (tau <= 0) return 0
  return (moneyness(strike, spot) + (rate + Math.pow(sigma, 2) / 2) * tau) / getProportionalVol(sigma, tau)
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
 * @notice D1 = (Log(spot / strike) + sigma^2 / 2 * tau) / (sigma * sqrt(tau))
 * D2 = D1 - sigma * sqrt(tau)
 * @returns D1 and D2, auxiliary variables of the black-scholes formula
 */
export function getD1AndD2(
  strike: number,
  sigma: number,
  tau: number,
  spot: number,
  rate: number = 0
): { d1: number; d2: number } {
  const d1 = calculateD1(strike, sigma, tau, spot, rate)
  const d2 = d1 - getProportionalVol(sigma, tau)
  return { d1, d2 }
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
  const { d1, d2 } = getD1AndD2(strike, sigma, tau, spot, rate ?? rate)
  return Math.max(0, std_n_cdf(d1) * spot - std_n_cdf(d2) * strike * Math.exp(-tau * rate))
}

/**
 * @notice Uses solidity CDF approximation
 * @dev Use to determine the theoretical theta which can accrue to a position
 * @returns Premium of a call option using the solidity CDF approximation formula
 */
export function callPremiumApproximation(
  strike: number,
  sigma: number,
  tau: number,
  spot: number,
  rate: number = 0
): number {
  const { d1, d2 } = getD1AndD2(strike, sigma, tau, spot, rate ?? rate)
  const cdfD1 = getCDFSolidity(d1)
  const cdfD2 = getCDFSolidity(d2)
  return Math.max(0, cdfD1 * spot - cdfD2 * strike * Math.exp(-tau * rate))
}
