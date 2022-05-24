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
export function solidityErf(x) {
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
 * @returns the polynomial A(x) where g(x) = A(x)/B(x), and g(x) is our aproximated CDF
 */
export function A(x) {
  // constants
  var a1 = 0.254829592
  var a2 = -0.284496736
  var a3 = 1.421413741
  var a4 = -1.453152027
  var a5 = 1.061405429
  return Math.exp(x ** 2 / 2) * (a1 + a2 + a3 + a4 + a5)
}
/**
 * apply the chain rule to (Math.exp((x**2)/2)) = x*(Math.exp((x**2)/2))
 * @returns the derivative of A(x) to be used in calculating the derivative of our CDF aprox
 */
export function APrime(x) {
  // constants
  var a1 = 0.254829592
  var a2 = -0.284496736
  var a3 = 1.421413741
  var a4 = -1.453152027
  var a5 = 1.061405429
  return x * Math.exp(x ** 2 / 2) * (a1 + a2 + a3 + a4 + a5)
}
/**
 * @returns the polynomial B(x) where g(x) = A(x)/B(x), and g(x) is our aproximated CDF
 */
export function B(x) {
  var p = 0.3275911
  return (
    2 *
    (1 / (1 - p * (x / Math.sqrt(2))) +
      (1 / (1 - p * (x / Math.sqrt(2)))) ** 2 +
      (1 / (1 - p * (x / Math.sqrt(2)))) ** 3 +
      (1 / (1 - p * (x / Math.sqrt(2)))) ** 4 +
      (1 / (1 - p * (x / Math.sqrt(2)))) ** 5)
  )
}

export function A2(x: number) {
  const terms = 5
  let y = 0
  let i = 1

  var a1 = 0.254829592
  var a2 = -0.284496736
  var a3 = 1.421413741
  var a4 = -1.453152027
  var a5 = 1.061405429
  const A = [a1, a2, a3, a4, a5]

  while (i <= terms) {
    y += A[i - 1] * Math.exp(Math.pow(-x, 2))
    i++
  }

  return y
}

export function C(x: number) {
  const terms = 5
  let y = 0
  let i = 1
  var p = 0.3275911
  var a1 = 0.254829592
  var a2 = -0.284496736
  var a3 = 1.421413741
  var a4 = -1.453152027
  var a5 = 1.061405429
  const A = [a1, a2, a3, a4, a5]

  while (i <= terms) {
    const t = Math.pow(1 / (1 + p * x), i)
    y += A[i - 1] * t * Math.exp(-x * x)
    i++
  }

  return y
}

export function dxerf(x: number) {
  const p = 0.3275911
  const e = Math.exp(-x * x)
  const a = -0.4999999995 * (-2 * e * x * (p * x + 1) - p * e)
  const b = (p * x + 1) ** 2
  return a / b
}

export function derf(x: number) {
  const p = 0.3275911
  const e = Math.exp(-x * x)
  const a =
    0.5 *
    e *
    (0.00192 * x ** 6 +
      0.02279 * x ** 5 +
      0.20006 * x ** 4 +
      0.7891 * x ** 3 +
      1.81797 * x ** 2 +
      2.21765 * x +
      1.12838)
  const b = (p * x + 1) ** 6
  return a / b
}

export function derf0(x: number) {
  const p = 0.3275911
  const e = Math.exp(-x * x)
  const b = (p * x + 1) ** 2

  return (-0.127414796 * (-2 * e * x * (p * x + 1) - p * x)) / b
}

/**
 * Denominator polynomial used in the approximated cdf.
 *
 * B(x) = \sum{ ( \frac{1}{1 + px} )^i }
 * B(x) = Sum( ( 1 / 1 + px)^i )
 *
 * @param x Value passed to the erf function.
 */
export function B2(x: number) {
  const terms = 5
  const p = 0.3275911
  let y = 0
  let i = 1
  while (i <= terms) {
    y += Math.pow(1 / 1 + p * x, i)
    i++
  }

  return y
}

/**
 * @returns the derivative of B(x) to be used in calculating the derivative of our CDF aprox
 * TODO: Simplify
 */

export function BPrime(x) {
  var p = 0.3275911
  var poverroot2 = p / Math.sqrt(2)
  var t1 = poverroot2 / (1 - poverroot2 * x) ** 2
  var t2 = (2 * poverroot2) / (1 - poverroot2 * x) ** 3
  var t3 = (3 * poverroot2) / (1 - poverroot2 * x) ** 4
  var t4 = (4 * poverroot2) / (1 - poverroot2 * x) ** 5
  var t5 = (4 * poverroot2) / (1 - poverroot2 * x) ** 6
  return t1 + t2 + t3 + t4 + t5
}
/**
 * @notice Used in solidity smart contracts
 * source: Numerical Methods pg 265
 * @returns standard normal cumulative distribution function of x
 */
export function alphaSolidityErf(x) {
  var z = Math.abs(x)
  var t = 1 / (1 + z / 2)
  var r =
    t *
    Math.exp(
      -z * z -
        1.26551223 +
        t *
          (1.00002368 +
            t *
              (0.37409196 +
                t *
                  (0.09678418 +
                    t *
                      (-0.18628806 +
                        t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))
    )
  return x >= 0 ? r : 2 - r
}

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
  return q * input
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
  return c3 * r + c2_D + quotient
}
/**
 * Inverse Complementary error function
 * Source: https://github.com/errcw/gaussian/blob/3a4f5f179288c736baaa283f513f2fc7a7ff0be1/lib/gaussian.js#L19
 * Numberical Recipies pg 265
 * @returns Inverse error function of x
 */
export function alphaSolidityIErf(x) {
  if (x >= 2) {
    return -100
  }
  if (x <= 0) {
    return 100
  }

  var xx = x < 1 ? x : 2 - x
  var t = Math.sqrt(-2 * Math.log(xx / 2))

  var r = -0.70711 * ((2.30753 + t * 0.27061) / (1 + t * (0.99229 + t * 0.04481)) - t)

  for (var j = 0; j < 2; j++) {
    var err = alphaSolidityErf(r) - xx
    r += err / (1.12837916709551257 * Math.exp(-(r * r)) - r * err)
  }

  return x < 1 ? r : -r
}
/**
 * @notice Temporarily use hardcoded pi up to 8 digits, late upgrade to Ramanujan algorithm for calculating Pi.
 * soure: https://www.i4cy.com/pi/
 * @returns the Probability density function
 */
export function solidityPDF(x, mean, variance) {
  // needs to be fixed
  var m = Math.sqrt(variance) * Math.sqrt(2 * Math.PI)
  var e = Math.exp(-Math.pow(x - mean, 2) / (2 * variance))
  return e / m
}
/**
 * @returns standard Probability density function function of x
 */
export function getPDFSolidity(x) {
  return solidityPDF(x, 0, 1)
}
/**
 * @notice  Returns the derivative of the inverse CDF.
 * Source: https://math.stackexchange.com/questions/910355/derivative-of-the-inverse-cumulative-distribution-function-for-the-standard-norm
 * @returns standard normal derivative of invervse cumulative distribution function of x
 */
export function InverseCDFPrimeSolidity(p) {
  var denomenator = CDFPrimeAprox(getInverseCDFSolidity(p))
  return 1 / denomenator
}
/**
 * @notice  Returns the derivative of the inverse CDF.
 * Source: https://math.stackexchange.com/questions/910355/derivative-of-the-inverse-cumulative-distribution-function-for-the-standard-norm
 * @returns standard normal derivative of invervse cumulative distribution function of x
 */
export function CDFPrimeAprox(x) {
  var numeratore = APrime(x) * B(x) - BPrime(x) * A(x)
  return numeratore / B(x) ** 2
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
  var cdfPrimeParams = ICDF - Sigma * Math.sqrt(Tau)
  var PDF = CDFPrimeAprox(cdfPrimeParams)
  var ICDFPrime = InverseCDFPrimeSolidity(1 - Rx)
  return -Strike * PDF * ICDFPrime
}

/**
 * WORKS BUT I DONT KNOW WHY
 *
 * @param x
 * @returns
 */
export function A3(x: number) {
  var a1 = 0.254829592
  var a2 = -0.284496736
  var a3 = 1.421413741
  var a4 = -1.453152027
  var a5 = 1.061405429

  const A = [a1, a2, a3, a4, a5]

  let y = 0
  let i = 1
  let runs = 5
  while (i <= runs) {
    const a = A[i - 1]
    y += a * Math.exp(-x * x) // ai * e^(-1 * x^2)
    i++
  }
  y

  return 0.00293479851 * x ** 4 + 0.0258331982 * x ** 3 + 0.22503089 * x ** 2 + 0.50956914 * x + 0.9999999999
}

export function A3Prime(x: number) {
  //return 0.00293 * 4 * x ** 3 + 0.02583 * 3 * x ** 2 + 0.22503 * 2 * x ** 1 + 0.50956
  //return 0.01172 * x ** 3 + 0.07749 * x ** 2 + 0.45006 * x + 0.50956
  return 0.509569 + 0.450062 * x + 0.0774996 * x ** 2 + 0.0117392 * x ** 3
}

export function A4Prime(x: number) {
  return -0.777889 * x ** 4 - 4.19625 * x ** 3 - 116.232 * x ** 2 - 176.11 * x - 912.988
}

export function Primes(x: number) {
  const i =
    (Math.exp(-(x ** 2)) *
      (-1.55578 * x ** 6 -
        18.4437 * x ** 5 -
        161.874 * x ** 4 -
        638.476 * x ** 3 -
        1470.94 * x ** 2 -
        1794.33 * x -
        912.988)) /
    (x + 3.05259) ** 6

  const a =
    -1.55578 * x ** 6 -
    18.4437 * x ** 5 -
    161.874 * x ** 4 -
    638.476 * x ** 3 -
    1470.94 * x ** 2 -
    1794.33 * x -
    912.988

  const b = (x + 3.05259) ** 6 * Math.exp(-(x ** 2))
  a
  b

  return i
}

/**
 * WORKS!
 *
 *
 * @param x
 * @returns
 */
export function B3(x: number) {
  var p = 0.3275911
  let i = 1
  let runs = 5

  let y = 0
  y

  for (; i <= runs; i++) {
    y += (1 + p * x) ** i
  }

  // (px + 1)^5 * e^(x^2)
  return Math.pow(p * x + 1, 5) * Math.exp(x ** 2)
}

export function B3Prime(x: number) {
  // d/dx((0.3275911 x + 1)^5 exp(x^2)) = e^(x^2) (0.327591 x + 1)^4 (0.655182 x^2 + 2 x + 1.63796)
  // 2 e^(x^2) (0.327591 x + 1)^4 (0.327591 x^2 + x + 0.818978)
  var p = 0.3275911
  const constant = 2
  const exp = Math.exp(Math.pow(x, 2))
  const molonomial = Math.pow(p * x + 1, 4)
  const quadratic = p * Math.pow(x, 2) + x + 0.818978
  const product = constant * exp * molonomial * quadratic
  return product
  //const part0 = Math.exp(Math.pow(x, 2))
  //const part1 = Math.pow(p * x + 1, 4)
  //const part2 = p * 2 * Math.pow(x, 2)
  //const part3 = 2 * x
  //const part4 = p * 5
  //return part0 * part1 * (part2 * part3 * part4)
  //return Math.exp(x ** 2) * (p * x + 1) ** 4 * (2 * p * x ** 2 + 2 * x + p * 5)
}

export function A4(x: number) {
  const p = 0.3275911

  var a1 = 0.254829592
  var a2 = -0.284496736
  var a3 = 1.421413741
  var a4 = -1.453152027
  var a5 = 1.061405429

  const A = [a1, a2, a3, a4, a5]
  let y = 0
  for (let i = 1; i <= 5; i++) {
    const a = A[i - 1]
    const b = (1 + p * x) ** i
    y += a / b
  }
  return y
}

export function A5(x: number) {
  return (
    0.25483 / (0.327591 * x + 1) -
    0.284497 / (0.327591 * x + 1) ** 2 +
    1.42141 / (0.327591 * x + 1) ** 3 -
    1.45315 / (0.327591 * x + 1) ** 4 +
    1.06141 / (0.327591 * x + 1) ** 5
  )
}

export function cdf(x: number) {
  const z = x / Math.sqrt(2)
  const sign = z >= 0 ? 1 : -1
  const erf = sign * (1 - A3(z) / B3(z))
  return 0.5 * (1 + erf)
}

export function pdf(x: number) {
  //const cdf = 0.5 * (1 + (1 - A3(x) / B3(x)))
  const z = x / Math.sqrt(2)
  //const num = 0.5 * A3(z) * B3Prime(z) - 0.5 * B3(z) * A3Prime(z)
  //const den = Math.pow(B3(z), 2)
  //return num / den

  //const num = -0.5 * (B3(z) * A3Prime(z) - A3(z) * B3Prime(z))
  //const denom = Math.pow(B3(z), 2)
  //return num / denom

  //const num = A3(z) * B3Prime(z) - B3(z) * A3Prime(z)
  //const denom = Math.pow(B3(z), 2) * 2
  //return num / denom

  const num = A3(z) * B3Prime(z) - B3(z) * A3Prime(z)
  const denom = Math.pow(B3(z), 2)
  return 0.5 * (num / denom)
}

export function erfPrimeActual(x: number) {
  const z = x / Math.sqrt(2)
  const constant = 2 / Math.sqrt(Math.PI)
  const exp = Math.exp(-z * z)
  return constant * exp
}

export function erfPrime(x: number) {
  const z = x / Math.sqrt(2)
  const num = A3(z) * B3Prime(z) - B3(z) * A3Prime(z)
  const denom = Math.pow(B3(z), 2)
  return num / denom
}
