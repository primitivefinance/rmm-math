import gaussian from 'gaussian'

/**
 * @notice Standard Normal Cumulative Distribution Function
 * source: https://github.com/errcw/gaussian/blob/master/lib/gaussian.js
 * @returns CDF of x
 */
export function std_n_cdf(x) {
  return gaussian(0, 1).cdf(x)
}

/**
 * @notice  Standard Normal Probability Density Function
 * source: https://github.com/errcw/gaussian/blob/master/lib/gaussian.js
 * @returns CDF of x
 */
export function std_n_pdf(x) {
  return gaussian(0, 1).pdf(x)
}

/**
 * @notice Quantile function
 * source: https://github.com/errcw/gaussian/blob/master/lib/gaussian.js
 * @returns CDF^-1 of x
 */
export function inverse_std_n_cdf(x) {
  if (x >= 1) return Infinity
  if (x <= 0) return -Infinity
  return gaussian(0, 1).ppf(x)
}

/**
 * uses source: https://github.com/errcw/gaussian/blob/master/lib/gaussian.js
 * @returns CDF(CDF(x)^-1)^-1
 */
export function quantilePrime(x) {
  return gaussian(0, 1).pdf(inverse_std_n_cdf(x)) ** -1
}

/**
 * @notice Used in solidity smart contracts
 * source: https://stackoverflow.com/questions/14846767/std-normal-cdf-normal-cdf-or-error-function
 * @returns Cumulative distribution function
 */
function solidityCDF(x, mean, variance) {
  return 0.5 * (1 + solidityErf((x - mean) / Math.sqrt(2 * variance)))
}

/**
 * @notice Used in solidity smart contracts
 * source: https://stackoverflow.com/questions/14846767/std-normal-cdf-normal-cdf-or-error-function
 * @returns error function of x
 */
function solidityErf(x) {
  // save the sign of x
  var sign = x >= 0 ? 1 : -1
  x = Math.abs(x)

  // constants
  var a1 = 0.254829592
  var a2 = -0.284496736
  var a3 = 1.421413741
  var a4 = -1.453152027
  var a5 = 1.061405429
  var p = 0.3275911

  // A&S formula 7.1.26
  var t = 1.0 / (1.0 + p * x)
  var y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  return sign * y // erf(-x) = -erf(x);
}
/**
 * 
 * 
 * 
 */
export function A(x) { 
  // constants
  var a1 = 0.254829592
  var a2 = -0.284496736
  var a3 = 1.421413741
  var a4 = -1.453152027
  var a5 = 1.061405429
  return (Math.exp((x**2)/2))*( a1 + a2 + a3 + a4 + a5)
}
/**
 * apply the chain rule to (Math.exp((x**2)/2)) = x*(Math.exp((x**2)/2))
 * 
 * 
 */
 export function APrime(x) { 
  // constants
  var a1 = 0.254829592
  var a2 = -0.284496736
  var a3 = 1.421413741
  var a4 = -1.453152027
  var a5 = 1.061405429
  return x*(Math.exp((x**2)/2))*( a1 + a2 + a3 + a4 + a5)
}
/**
* 
* 
* 
*/
export function BPrime(x) { // needs to be fixed
  var p = 0.3275911
  return (2 * ((1/(1-(p*(x/Math.sqrt(2)))) + (1/(1-(p*(x/Math.sqrt(2)))))**2 +
    (1/(1-(p*(x/Math.sqrt(2)))))**3 + (1/(1-(p*(x/Math.sqrt(2)))))**4 +
    (1/(1-(p*(x/Math.sqrt(2)))))**5)))
}
/**
* 
* 
* 
*/
export function B(x) { // needs to be fixed
  var p = 0.3275911
  return (2 * ((1/(1-(p*(x/Math.sqrt(2)))) + (1/(1-(p*(x/Math.sqrt(2)))))**2 +
    (1/(1-(p*(x/Math.sqrt(2)))))**3 + (1/(1-(p*(x/Math.sqrt(2)))))**4 +
    (1/(1-(p*(x/Math.sqrt(2)))))**5)))
}
/**
 * @notice Used in solidity smart contracts
 * source: Numerical Methods pg 265
 * @returns standard normal cumulative distribution function of x
 */
function alphaSolidityErf(x){
  var z = Math.abs(x);
  var t = 1 / (1 + z / 2);
  var r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 +
          t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 +
          t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 +
          t * (-0.82215223 + t * 0.17087277)))))))))
  return x >= 0 ? r : 2 - r;
};

/**
 * @notice Used in solidity smart contracts
 * source: https://stackoverflow.com/questions/14846767/std-normal-cdf-normal-cdf-or-error-function
 * @returns standard normal cumulative distribution function of x
 */
export function getCDFSolidity(x) {
  return solidityCDF(x, 0, 1)
}

export const HIGH_TAIL = 0.975
export const LOW_TAIL = 0.025

/**
 * @notice  Returns the inverse CDF, or quantile function of `p`.
 * Source: https://arxiv.org/pdf/1002.0567.pdf
 * Maximum error of central region is 1.16x10−4
 * @dev Used in solidity smart contracts
 * @returns standard normal invervse cumulative distribution (quantile) function of x
 */
export function getInverseCDFSolidity(p) {
  if (p >= 1 || p <= 0) return Infinity
  if (p <= HIGH_TAIL && p >= LOW_TAIL) {
    return centralInverseCDFSolidity(p)
  } else if (p < LOW_TAIL) {
    return tailInverseCDFSolidity(p)
  } else {
    return -tailInverseCDFSolidity(1 - p)
  }
}

/**
 * @dev     Maximum error: 1.16x10−4
 * @param p Probability to find inverse cdf of
 * @returns Inverse CDF around the central area of 0.025 <= p <= 0.975
 */
export function centralInverseCDFSolidity(p) {
  const q = p - 0.5
  const r = Math.pow(q, 2)
  const a0 = 0.151015505647689
  const a1 = -0.5303572634357367
  const a2 = 1.365020122861334
  const b0 = 0.132089632343748
  const b1 = -0.7607324991323768
  const numerator = a1 * r + a0
  const denominator = Math.pow(r, 2) + b1 * r + b0
  const input = a2 + numerator / denominator
  const result = q * input
  return result
}

/**
 * @dev     Maximum error: 2.458x10-5
 * @param p Probability to find inverse cdf of
 * @returns Inverse CDF of the tail, defined for p < 0.0465, used with p < 0.025
 */
export function tailInverseCDFSolidity(p) {
  const r = Math.sqrt(Math.log(1 / Math.pow(p, 2)))
  const c3 = -1.000182518730158122
  const c0_D = 16.682320830719986527
  const c1_D = 4.120411523939115059
  const c2_D = 0.029814187308200211
  const D0 = 7.173787663925508066
  const D1 = 8.759693508958633869

  const numerator = c1_D * r + c0_D
  const denominator = Math.pow(r, 2) + D1 * r + D0
  const quotient = numerator / denominator
  const result = c3 * r + c2_D + quotient
  return result
}
/**
* Inverse Complementary error function
* Source: https://github.com/errcw/gaussian/blob/3a4f5f179288c736baaa283f513f2fc7a7ff0be1/lib/gaussian.js#L19
* Numberical Recipies pg 265
* @returns Inverse error function of x
*/
export function alphaSolidityIErf(x) {
  if (x >= 2) { return -100; }
  if (x <= 0) { return 100; }

  var xx = (x < 1) ? x : 2 - x;
  var t = Math.sqrt(-2 * Math.log(xx / 2));

  var r = -0.70711 * ((2.30753 + t * 0.27061) /
          (1 + t * (0.99229 + t * 0.04481)) - t);

  for (var j = 0; j < 2; j++) {
    var err = alphaSolidityErf(r) - xx;
    r += err / (1.12837916709551257 * Math.exp(-(r * r)) - r * err);
  }

  return (x < 1) ? r : -r;
}
/**
* @notice Temporarily use hardcoded pi up to 8 digits, late upgrade to Ramanujan algorithm for calculating Pi.
* soure: https://www.i4cy.com/pi/
* @returns the Probability density function
*/
export function solidityPDF(x, mean, variance) { // needs to be fixed
  var m = Math.sqrt(variance) * Math.sqrt(2 * Math.PI);
  var e = Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
  return e / m;
}
/**
 * @notice Used in solidity smart contracts
 * @returns standard Probability density function function of x
 */
 export function getPDFSolidity(x) {
  return solidityPDF(x, 0, 1)
}
/**
 * @notice  Returns the derivative of the inverse CDF.
 * Source: https://math.stackexchange.com/questions/910355/derivative-of-the-inverse-cumulative-distribution-function-for-the-standard-norm
 * @dev Used in solidity smart contracts
 * @returns standard normal derivative of invervse cumulative distribution function of x
 */
export function InverseCDFPrimeSolidity(p) {
  var denomenator = getPDFSolidity(getInverseCDFSolidity(p))
  return 1 / denomenator
}
/**
* @param Strike Strike Price
* @param Tau Expiry
* @param Sigma Anualized Volitity indix
* @param Ry Reserves of asset y
* @returns Derivative of trading function with respect to Ry
*/
export function fPrime(Strike, Tau, Sigma, Rx, Ry) {
  var ICDF = getInverseCDFSolidity(1 - Ry)
  var cdfPrimeParams = ICDF - (Sigma * Math.sqrt(Tau))
  var PDF = getPDFSolidity(cdfPrimeParams)
  var ICDFPrime = InverseCDFPrimeSolidity(1-Rx)
  return -Strike * PDF * ICDFPrime
}
