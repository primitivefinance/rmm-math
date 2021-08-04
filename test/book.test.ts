import * as math from '../src/BlackScholes'

const spot = 2000
const strike = 2500
const tau = 1

const pools = {
  [strike]: [
    { iv: '50', size: '45' },
    { iv: '100', size: '355' },
    { iv: '125', size: '322' },
    { iv: '150', size: '200' },
    { iv: '175', size: '50' },
  ],
}

const poolKeys = Object.keys(pools[strike])

describe('Book', () => {
  describe('depth', () => {
    it('return 0 if spot and strike are equal', () => {
      const premiums = poolKeys.map(key => {
        const iv = +pools[strike][key].iv / 100
        const premium = math.callPremium(strike, iv, tau, spot)
        return premium
      })

      const totalSize = 100
      let size = totalSize
      let i = 0
      let costs: number[] = []

      while (size > 0) {
        // get size to take at index
        const askSize = +pools[strike][i].size
        const premium = premiums[i]
        // subtract size from order
        if (size > askSize) {
          size -= askSize
          // add size taken price to avg price
          costs.push(askSize * premium)
        } else {
          // take the remaining size
          costs.push(size * premium)
          // set the new size to 0
          size = 0
        }

        i++
      }

      const calcAvgPrice = (costs, totalSize) => {
        return costs.reduce((a, b) => a + b) / totalSize
      }

      calcAvgPrice(costs, totalSize)
      //console.log({ avg, costs, premiums })
    })
  })
})
