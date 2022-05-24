/**
 * Uses Newton's Method to solve the root of the function `fx` within `maxRuns` with error `epsilon`.
 *
 * @param x Initial guess of the root of `fx`.
 * @param epsilon Error boundary of the root.
 * @param maxRuns Maximum iterations before exiting the computation and returning the latest run's result.
 * @param fx Function to solve the root of.
 * @param dx Derivative of the function `fx`.
 * @return x Computed root, within the `maxRuns` of `fx`.
 */
export function newtonMethod(
  x: number,
  epsilon: number,
  maxRuns: number,
  fx: (x: number) => number,
  dx: (x: number) => number
) {
  let runs = 0
  let h = fx(x) / dx(x)

  while (Math.abs(h) >= epsilon && runs < maxRuns) {
    h = fx(x) / dx(x)
    x = x - h
    runs++
  }

  return x
}
