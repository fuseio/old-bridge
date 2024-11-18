import { Flex, Text } from 'rebass/styled-components'
import { Currency, CurrencyAmount, Percent, TradeType } from '@voltage-finance/sdk-core'

import SwapRoute from '../SwapRoute'
import { ONE_BIPS } from '../../../constants'
import { Trade } from '../../../hooks/useTrade'
import { Field } from '../../../state/swap/actions'
import { warningSeverity } from '../../../utils/prices'

interface TradeSummaryProps {
  trade: Trade
  priceImpact: Percent
  slippageAdjustedAmounts: {
    INPUT?: CurrencyAmount<Currency>
    OUTPUT?: CurrencyAmount<Currency>
  }
}

interface TradeSummaryRowProps {
  leftLabel: string
  rightContent: any
}

const TradeSummaryRow = ({ leftLabel, rightContent }: TradeSummaryRowProps) => (
  <Flex justifyContent="space-between" mb={3} height="24px" alignItems="center">
    <Text opacity={0.7} fontSize={1}>
      {leftLabel}
    </Text>
    <Text fontSize={1}>{rightContent}</Text>
  </Flex>
)

export default function FormattedPriceImpact({ priceImpact }: { priceImpact?: Percent }) {
  if (!priceImpact) {
    return <Text>-</Text>
  }

  const severity = warningSeverity(priceImpact)

  let priceImpactFallback
  if (severity === 1 || severity === 2 || severity === 3 || severity === 4) {
    priceImpactFallback = '0.0%'
  } else {
    priceImpactFallback = '-'
  }

  return (
    <Text>
      {priceImpact ? (priceImpact.lessThan(ONE_BIPS) ? '<0.01%' : `${priceImpact.toFixed(2)}%`) : priceImpactFallback}
    </Text>
  )
}

export function TradeSummary({ trade, priceImpact, slippageAdjustedAmounts }: TradeSummaryProps) {
  const isExactIn = trade?.tradeType === TradeType.EXACT_INPUT

  return (
    <Flex flexDirection={'column'} mt={1}>
      <TradeSummaryRow
        leftLabel={isExactIn ? 'Minimum received' : 'Maximum sold'}
        rightContent={
          trade
            ? `${
                isExactIn
                  ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)
                  : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)
              } ${isExactIn ? trade.outputAmount.currency.symbol : trade.inputAmount.currency.symbol}`
            : '0.0'
        }
      />

      <TradeSummaryRow leftLabel="Price Impact" rightContent={<FormattedPriceImpact priceImpact={priceImpact} />} />

      {trade?.sources.length > 0 && (
        <TradeSummaryRow leftLabel="Route" rightContent={<SwapRoute sources={trade.sources} />} />
      )}
    </Flex>
  )
}
