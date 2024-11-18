import { Percent } from '@voltage-finance/sdk-core'
import { warningSeverity } from '../utils/prices'

export const usePriceImpactColor = (priceImpact: Percent) => {
  if (!priceImpact) return 'blk70'
  const severity = warningSeverity(priceImpact)

  if (severity === 3 || severity === 4) {
    return 'red'
  }
  if (severity === 2) {
    return 'yellow'
  }
  if (severity === 1) {
    return 'green'
  }
  
  return 'blk70'
}
