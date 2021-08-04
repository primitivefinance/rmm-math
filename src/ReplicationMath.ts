import { inverse_std_n_cdf, std_n_cdf, std_n_pdf, quantilePrime } from './CumulativeNormalDistribution'
import { getProportionalVol } from './BlackScholes'

/**
 * @notice Core math trading function of the AMM to calculate the stable reserve using risky
 * @param reserveRisky Pool's reserve of risky tokens per unit of liquidity
 * @param strike Price point that defines complete stable token composition of the pool
 * @param sigma Implied volatility of the pool
 * @param tau Time until expiry
 * @param invariantLast Previous invariant with the same `tau` input as the parameter `tau`
 * @returns Covered Call AMM black-scholes trading function
 */
export function getStableGivenRisky(
  reserveRisky: number,
  strike: number,
  sigma: number,
  tau: number,
  invariantLast: number = 0
): number {
  const K = strike
  const vol = getProportionalVol(sigma, tau)
  if (vol <= 0) return 0
  const inverseInput: number = 1 - reserveRisky
  const phi: number = inverse_std_n_cdf(inverseInput)
  const input = phi - vol
  const reserveStable = K * std_n_cdf(input) + invariantLast
  return reserveStable
}

/**
 * @notice Core math trading function of the AMM to calculate the risky reserve using stable
 * @param reserveStable Pool's reserve of stable tokens per unit of liquidity
 * @param strike Price point that defines complete stable token composition of the pool
 * @param sigma Implied volatility of the pool
 * @param tau Time until expiry
 * @param invariantLast Previous invariant with the same `tau` input as the parameter `tau`
 * @returns Covered Call AMM black-scholes inverse trading function
 */
export function getRiskyGivenStable(
  reserveStable: number,
  strike: number,
  sigma: number,
  tau: number,
  invariantLast: number = 0
): number {
  const K = strike
  const vol = getProportionalVol(sigma, tau)
  if (vol <= 0) return 0
  const inverseInput: number = (reserveStable - invariantLast) / K
  const phi: number = inverse_std_n_cdf(inverseInput)
  const input = phi + vol
  const reserveRisky = 1 - std_n_cdf(input)
  return reserveRisky
}

/**
 * @param reserveRisky Pool's reserve of risky tokens
 * @param reserveStable Pool's reserve of stable tokens
 * @param strike Price point that defines complete stable token composition of the pool
 * @param sigma Implied volatility of the pool
 * @param tau Time until expiry
 * @returns Invariant = Reserve stable - getStableGivenRisky(...)
 */
export function calcInvariant(
  reserveRisky: number,
  reserveStable: number,
  strike: number,
  sigma: number,
  tau: number
): number {
  return reserveStable - getStableGivenRisky(reserveRisky, strike, sigma, tau)
}

/**
 * @param reserveRisky Pool's reserve of risky tokens
 * @param strike Price point that defines complete stable token composition of the pool
 * @param sigma Implied volatility of the pool
 * @param tau Time until expiry
 * @returns getStableGivenRisky(...) * pdf(ppf(1 - risky))^-1
 */
export function getSpotPrice(reserveRisky: number, strike: number, sigma: number, tau: number): number {
  return getStableGivenRisky(reserveRisky, strike, sigma, tau) * quantilePrime(1 - reserveRisky)
}

/**
 * @notice See https://arxiv.org/pdf/2012.08040.pdf
 * @param amountIn Amount of risky token to add to risky reserve
 * @param reserveRisky Pool's reserve of risky tokens
 * @param strike Price point that defines complete stable token composition of the pool
 * @param sigma Implied volatility of the pool
 * @param tau Time until expiry, in years
 * @return Marginal price after a trade with size `amountIn` with the current reserves.
 */
export const getMarginalPriceSwapRiskyIn = (
  amountIn: number,
  reserveRisky: number,
  strike: number,
  sigma: number,
  tau: number,
  fee: number
) => {
  if (!nonNegative(amountIn)) return 0
  const gamma = 1 - fee
  const step0 = 1 - reserveRisky - gamma * amountIn
  const step1 = sigma * Math.sqrt(tau)
  const step2 = quantilePrime(step0)
  const step3 = gamma * strike
  const step4 = inverse_std_n_cdf(step0)
  const step5 = std_n_pdf(step4 - step1)
  return step3 * step5 * step2
}

/**
 * @notice See https://arxiv.org/pdf/2012.08040.pdf
 * @param amountIn Amount of stable token to add to stable reserve
 * @param reserveStable Pool's reserve of stable tokens
 * @param strike Price point that defines complete stable token composition of the pool
 * @param sigma Implied volatility of the pool
 * @param tau Time until expiry, in years
 * @return Marginal price after a trade with size `amountIn` with the current reserves.
 */
export const getMarginalPriceSwapStableIn = (
  amountIn: number,
  invariant: number,
  reserveStable: number,
  strike: number,
  sigma: number,
  tau: number,
  fee: number
) => {
  if (!nonNegative(amountIn)) return 0
  const gamma = 1 - fee
  const step0 = (reserveStable + gamma * amountIn - invariant) / strike
  const step1 = sigma * Math.sqrt(tau)
  const step3 = inverse_std_n_cdf(step0)
  const step4 = std_n_pdf(step3 + step1)
  const step5 = step0 * (1 / strike)
  const step6 = quantilePrime(step5)
  const step7 = gamma * step4 * step6
  return 1 / step7
}

/**
 * @param x A number
 * @returns is x greater than or equal to 0?
 */
export const nonNegative = (x: number): boolean => {
  return x >= 0
}
