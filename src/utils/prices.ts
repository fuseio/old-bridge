import JSBI from 'jsbi'
import { CurrencyAmount, Currency, Percent, Fraction } from '@voltage-finance/sdk-core'

import { Trade } from '../hooks/useTrade'
import { Field } from '../state/swap/actions'
import { basisPointsToPercent } from './index'
import { BLOCKED_PRICE_IMPACT_NON_EXPERT } from '../constants'
import { ALLOWED_PRICE_IMPACT_HIGH, ALLOWED_PRICE_IMPACT_LOW, ALLOWED_PRICE_IMPACT_MEDIUM } from '../constants'

// computes the minimum amount out and maximum amount in for a trade given a user specified allowed slippage in bips
export function computeSlippageAdjustedAmounts(
  trade: Trade | undefined,
  allowedSlippage: number
): { [field in Field]?: CurrencyAmount<Currency> } {
  if (!trade) {
    return {
      [Field.INPUT]: null,
      [Field.OUTPUT]: null,
    }
  }

  const pct = basisPointsToPercent(allowedSlippage)

  const maximumAmountIn = new Fraction(JSBI.BigInt(1)).add(pct).multiply(trade?.inputAmount.quotient).quotient
  const slippageAdjustedAmountIn = CurrencyAmount.fromRawAmount(trade?.inputAmount.currency, maximumAmountIn)

  const maximumAmountOut = new Fraction(JSBI.BigInt(1))
    .add(pct)
    .invert()
    .multiply(trade?.outputAmount.quotient).quotient
  const slippageAdjustedAmountOut = CurrencyAmount.fromRawAmount(trade?.outputAmount.currency, maximumAmountOut)

  return {
    [Field.INPUT]: slippageAdjustedAmountIn,
    [Field.OUTPUT]: slippageAdjustedAmountOut,
  }
}

export function warningSeverity(priceImpact: Percent | undefined): 0 | 1 | 2 | 3 | 4 {
  if (!priceImpact) return 0
  if (!priceImpact.lessThan(BLOCKED_PRICE_IMPACT_NON_EXPERT)) return 4
  if (!priceImpact.lessThan(ALLOWED_PRICE_IMPACT_HIGH)) return 3
  if (!priceImpact.lessThan(ALLOWED_PRICE_IMPACT_MEDIUM)) return 2
  if (!priceImpact.lessThan(ALLOWED_PRICE_IMPACT_LOW)) return 1
}
