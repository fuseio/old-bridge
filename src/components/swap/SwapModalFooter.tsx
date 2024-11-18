import { Percent, TradeType } from '@voltage-finance/sdk-core'
import { useMemo } from 'react'
import { Button } from 'rebass/styled-components'
import { Field } from '../../state/swap/actions'
import { TYPE } from '../../theme'
import { Box } from 'rebass/styled-components'
import {
  computeSlippageAdjustedAmounts,
  warningSeverity
} from '../../utils/prices'
import { AutoColumn } from '../Column'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import FormattedPriceImpact from './FormattedPriceImpact'
import { SwapCallbackError } from './styleds'
import { Trade } from '../../hooks/useTrade'

export default function SwapModalFooter({
  trade,
  onConfirm,
  allowedSlippage,
  swapErrorMessage,
  disabledConfirm,
  priceImpact
}: {
  trade: Trade
  allowedSlippage: number
  onConfirm: () => void
  swapErrorMessage: string | undefined
  disabledConfirm: boolean
  priceImpact: Percent | undefined
}) {
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    allowedSlippage,
    trade
  ])
  // const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const severity = warningSeverity(priceImpact)

  return (
    <>
      <AutoColumn gap="6px">
        <RowBetween>
          <RowFixed>
            <TYPE.main fontSize={1}>
              {trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'}
            </TYPE.main>
          </RowFixed>
          <RowFixed>
            <TYPE.main fontSize={1}>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? '-'
                : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? '-'}
            </TYPE.main>
            <TYPE.main fontSize={1}>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? trade.outputAmount.currency.symbol
                : trade.inputAmount.currency.symbol}
            </TYPE.main>
          </RowFixed>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <TYPE.main fontSize={1}>Price Impact</TYPE.main>
          </RowFixed>
          <FormattedPriceImpact priceImpact={priceImpact} />
        </RowBetween>
      </AutoColumn>
      <Box py={2}></Box>
      <AutoRow>
        <Button
          onClick={onConfirm}
          disabled={disabledConfirm}
          variant={severity > 2 ? 'error' : 'primary'}
          id="confirm-swap-or-send"
        >
          {severity > 2 ? 'Swap Anyway' : 'Confirm Swap'}
        </Button>

        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}
