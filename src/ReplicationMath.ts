import {
  inverse_std_n_cdf,
  std_n_cdf,
  std_n_pdf,
  quantilePrime,
  getInverseCDFSolidity,
  getCDFSolidity,
} from './CumulativeNormalDistribution'
import { getProportionalVol } from './BlackScholes'
import { bisection, MAX_PRECISION } from './utils'

// ===== Approximations as in the Solidity implementation =====
/**
 * Forward trading function to calculate the risky reserve given a stable reserve which has a 0 invariant
 *
 * @remarks
 * Uses the same approximations as in the solidity contract
 *
 * @param reserveRisky Pool's reserve of risky tokens per unit of liquidity
 * @param strike Price point that defines complete stable token composition of the pool
 * @param sigma Implied volatility of the pool as a decimal percentage
 * @param tau Time until expiry in years
 * @param invariantLast Previous invariant with the same `tau` input as the parameter `tau`
 *
 * @returns = K * Φ(Φ^-1(1 - reserveRisky) - σ*sqrt(T - t)) + invariant
 *
 * @beta
 */
export function getStableGivenRiskyApproximation(
  reserveRisky: number,
  strike: number,
  sigma: number,
  tau: number,
  invariantLast: number = 0
): number {
  if (reserveRisky >= 1 || reserveRisky <= 0) return 0
  const K = strike
  const vol = getProportionalVol(sigma, tau)
  if (vol <= 0) return 0
  const inverseInput: number = 1 - reserveRisky
  const phi: number = getInverseCDFSolidity(inverseInput)
  const input = phi - vol
  const reserveStable = K * getCDFSolidity(input) + invariantLast
  return reserveStable
}

/**
 * Using approximations in the forward function `getStableGivenRisky` will cause this inverse function
 * to not be exactly equal. Therefore, a numerical bisection method is used to find the exact amount based on the function which
 * uses the approximations.
 *
 * @remarks
 * Uses a bisection to find the `reserveRisky` which sets the invariant to  0 given a `reserveStable`
 *
 * @beta
 */
export function getRiskyGivenStableApproximation(
  reserveStable: number,
  strike: number,
  sigma: number,
  tau: number,
  invariantLast = 0
): number {
  const func = reserveRisky => getInvariantApproximation(reserveRisky, reserveStable, strike, sigma, tau, invariantLast)

  const MAX_RISKY = 1
  let optimalDeltaOut: number
  if (Math.sign(func(MAX_PRECISION)) !== Math.sign(func(MAX_RISKY - MAX_PRECISION))) {
    optimalDeltaOut = bisection(func, MAX_PRECISION, MAX_RISKY - MAX_PRECISION)
  } else {
    optimalDeltaOut = MAX_RISKY
  }

  return optimalDeltaOut
}

/**
 * Computes the invariant of the CFMM using the forward trading function with the same solidity
 * approximations for the CDF function.
 *
 * @param reserveRisky Pool's reserve of risky tokens per unit of liquidity
 * @param reserveStable Pool's reserve of stable tokens per unit of liquidity
 * @param strike Price point that defines complete stable token composition of the pool
 * @param sigma Implied volatility of the pool as a decimal percentage
 * @param tau Time until expiry in years
 *
 * @returns Invariant = Reserve stable - getStableGivenRiskyApproximation(...)
 *
 * @beta
 */
export function getInvariantApproximation(
  reserveRisky: number,
  reserveStable: number,
  strike: number,
  sigma: number,
  tau: number,
  invariantLast = 0
): number {
  return reserveStable - getStableGivenRiskyApproximation(reserveRisky, strike, sigma, tau, invariantLast)
}

// ===== Precise math =====

/**
 * Forward trading function to calculate the risky reserve given a stable reserve which has a 0 invariant
 *
 * @param reserveRisky Pool's reserve of risky tokens per unit of liquidity
 * @param strike Price point that defines complete stable token composition of the pool
 * @param sigma Implied volatility of the pool as a decimal percentage
 * @param tau Time until expiry in years
 * @param invariantLast Previous invariant with the same `tau` input as the parameter `tau`
 *
 * @returns = K * Φ(Φ^-1(1 - reserveRisky) - σ*sqrt(T - t)) + invariant
 *
 * @beta
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
 * Inverse trading function to calculate the stable reserve given a risky reserve which has a 0 invariant
 *
 * @remarks
 * In the smart contracts, an approximation is used in the forward direction. Therefore, this
 * is not the same result as the inverse of the approximated forward direction.
 *
 * @param reserveStable Pool's reserve of stable tokens per unit of liquidity
 * @param strike Price point that defines complete stable token composition of the pool
 * @param sigma Implied volatility of the pool as a decimal percentage
 * @param tau Time until expiry in years
 * @param invariantLast Previous invariant with the same `tau` input as the parameter `tau`
 *
 * @returns = 1 - Φ(Φ^-1((reserveStable - invariant) / K) + σ*sqrt(T - t))
 *
 * @beta
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
 * Computes the invariant of the CFMM.
 *
 * @param reserveRisky Pool's reserve of risky tokens per unit of liquidity
 * @param reserveStable Pool's reserve of stable tokens per unit of liquidity
 * @param strike Price point that defines complete stable token composition of the pool
 * @param sigma Implied volatility of the pool as a decimal percentage
 * @param tau Time until expiry in years
 *
 * @returns Invariant = Reserve stable - getStableGivenRisky(...)
 *
 * @beta
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
 * Computes the reported price, also named marginal price, of the CFMM given the risky reserves.
 *
 * @remarks
 * Source: https://github.com/primitivefinance/rmm-research/blob/93c0627d128b5253ea95e885c49151f7d089164a/whitepaper.pdf
 *
 * @param reserveRisky - Pool's reserve of risky tokens
 * @param strike - Price point that defines complete stable token composition of the pool
 * @param sigma - Implied volatility of the pool as a decimal percentage
 * @param tau - Time until expiry in years
 *
 * @returns Ke^( Φ^-1(1-x) * σ * sqrt(T) ) * e^ ( -1 / 2 * σ^2 * T)
 *
 * @beta
 */
export function getSpotPrice(reserveRisky: number, strike: number, sigma: number, tau: number): number {
  return (
    strike *
    Math.exp(inverse_std_n_cdf(1 - reserveRisky) * sigma * Math.sqrt(tau)) *
    Math.exp((-1 / 2) * Math.pow(sigma, 2) * tau)
  )
}

/**
 * Uses the approximations in the solidity contract to compute the reported price of the CFMM.
 *
 *
 * @remarks
 * Source: https://github.com/primitivefinance/rmm-research/blob/93c0627d128b5253ea95e885c49151f7d089164a/whitepaper.pdf
 *
 * @param reserveRisky - Pool's reserve of risky tokens
 * @param strike - Price point that defines complete stable token composition of the pool
 * @param sigma - Implied volatility of the pool as a decimal percentage
 * @param tau - Time until expiry in years
 *
 * @returns Ke^( Φ^-1(1-x) * σ * sqrt(T) ) * e^ ( -1 / 2 * σ^2 * T)
 *
 * @beta
 */
export function getSpotPriceApproximation(reserveRisky: number, strike: number, sigma: number, tau: number): number {
  return (
    strike *
    Math.exp(getInverseCDFSolidity(1 - reserveRisky) * sigma * Math.sqrt(tau)) *
    Math.exp((-1 / 2) * Math.pow(sigma, 2) * tau)
  )
}

/**
 * See https://arxiv.org/pdf/2012.08040.pdf
 *
 * @remarks
 * Source: https://github.com/primitivefinance/rmm-research/blob/93c0627d128b5253ea95e885c49151f7d089164a/whitepaper.pdf
 *
 * @param amountIn Amount of risky token to add to risky reserve
 * @param reserveRisky Pool's reserve of risky tokens
 * @param strike Price point that defines complete stable token composition of the pool
 * @param sigma Implied volatility of the pool as a decimal percentage
 * @param tau Time until expiry in years
 *
 * @return Marginal price after a trade with size `amountIn` with the current reserves.
 *
 * @beta
 */
export function getMarginalPriceSwapRiskyIn(
  amountIn: number,
  reserveRisky: number,
  strike: number,
  sigma: number,
  tau: number,
  fee: number
): number {
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
 * See https://arxiv.org/pdf/2012.08040.pdf
 *
 * @remarks
 * Source: https://github.com/primitivefinance/rmm-research/blob/93c0627d128b5253ea95e885c49151f7d089164a/whitepaper.pdf
 *
 * @param amountIn Amount of stable token to add to stable reserve
 * @param reserveStable Pool's reserve of stable tokens
 * @param strike Price point that defines complete stable token composition of the pool
 * @param sigma Implied volatility of the pool as a decimal percentage
 * @param tau Time until expiry in years
 *
 * @return Marginal price after a trade with size `amountIn` with the current reserves.
 *
 * @beta
 */
export function getMarginalPriceSwapStableIn(
  amountIn: number,
  invariant: number,
  reserveStable: number,
  strike: number,
  sigma: number,
  tau: number,
  fee: number
): number {
  if (!nonNegative(amountIn)) return 0
  const gamma = 1 - fee
  const step0 = (reserveStable + gamma * amountIn - invariant) / strike
  const step1 = sigma * Math.sqrt(tau)
  const step3 = inverse_std_n_cdf(step0)
  const step4 = std_n_pdf(step3 + step1)
  const step6 = quantilePrime(step0) * (1 / strike)
  const step7 = gamma * step4 * step6
  return 1 / step7
}

/**
 * See https://arxiv.org/pdf/2012.08040.pdf
 *
 * @remarks
 * Uses same approximations used in solidity contracts
 *
 * @param amountIn Amount of risky token to add to risky reserve
 * @param reserveRisky Pool's reserve of risky tokens
 * @param strike Price point that defines complete stable token composition of the pool
 * @param sigma Implied volatility of the pool as a decimal percentage
 * @param tau Time until expiry in years
 *
 * @return Marginal price after a trade with size `amountIn` with the current reserves.
 *
 * @beta
 */
export function getMarginalPriceSwapRiskyInApproximation(
  amountIn: number,
  reserveRisky: number,
  strike: number,
  sigma: number,
  tau: number,
  fee: number
): number {
  if (!nonNegative(amountIn)) return 0
  const gamma = 1 - fee
  const step0 = 1 - reserveRisky - gamma * amountIn
  const step1 = sigma * Math.sqrt(tau)
  const step2 = quantilePrime(step0)
  const step3 = gamma * strike
  const step4 = getInverseCDFSolidity(step0)
  const step5 = std_n_pdf(step4 - step1)
  return step3 * step5 * step2
}

/**
 * See https://arxiv.org/pdf/2012.08040.pdf
 *
 * @remarks
 * Uses same approximations used in solidity contracts
 *
 * @param amountIn Amount of stable token to add to stable reserve
 * @param reserveStable Pool's reserve of stable tokens
 * @param strike Price point that defines complete stable token composition of the pool
 * @param sigma Implied volatility of the pool as a decimal percentage
 * @param tau Time until expiry in years
 *
 * @return Marginal price after a trade with size `amountIn` with the current reserves.
 *
 * @beta
 */
export function getMarginalPriceSwapStableInApproximation(
  amountIn: number,
  invariant: number,
  reserveStable: number,
  strike: number,
  sigma: number,
  tau: number,
  fee: number
): number {
  if (!nonNegative(amountIn)) return 0
  const gamma = 1 - fee
  const step0 = (reserveStable + gamma * amountIn - invariant) / strike
  const step1 = sigma * Math.sqrt(tau)
  const step3 = getInverseCDFSolidity(step0)
  const step4 = std_n_pdf(step3 + step1)
  const step6 = quantilePrime(step0) * (1 / strike)
  const step7 = gamma * step4 * step6
  return 1 / step7
}

/**
 * @param x - A number
 * @returns is x greater than or equal to 0?
 */
export function nonNegative(x: number): boolean {
  return x >= 0
}
