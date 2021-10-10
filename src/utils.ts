export const EPSILON = 1e-3
export const MAX_PRECISION = 1e-6

/**
 * @notice source: https://www.geeksforgeeks.org/program-for-bisection-method/
 * This code is contributed by susmitakundugoaldanga.
 * @param func Returns a value, run the bisection such that the return value is 0
 * @param a Left most point
 * @param b Right most point
 * @returns Root of function
 */
export function bisection(func, a, b) {
  if (func(a) * func(b) >= 0) {
    console.log('\n You have not assumed right a and b')
    return
  }

  let c = a
  while (b - a >= EPSILON) {
    // Find middle point
    c = (a + b) / 2

    // Check if middle point is root
    if (func(c) === 0.0) break
    // Decide the side to repeat the steps
    else if (func(c) * func(a) < 0) b = c
    else a = c
  }
  return c
}
