import { newtonMethod } from '../src/Newton'

describe('Newton', function() {
  it('computes the root for a basic polynomial function', async function() {
    const fx = (x: number) => Math.pow(x, 3) - Math.pow(x, 2) + 2
    const dx = (x: number) => 3 * Math.pow(x, 2) - 2 * x
    const epsilon = 1e-8
    const initial = -4
    const expected = -1
    const actual = newtonMethod(initial, epsilon, 100, fx, dx)
    expect(actual).toEqual(expected)
  })
})
