import { batch } from 'react-redux'
import { useCallback, useMemo } from 'react'
import { Text } from 'rebass/styled-components'
import { FeeAmount } from '@voltage-finance/v3-sdk'
import { Currency, Price, Token } from '@voltage-finance/sdk-core'

import Chart from './Chart'
import { Bound } from '../../../../../state/mint/v3/actions'

// Used to format floats representing percent change with fixed decimal places
function formatDelta(delta: any) {
  if (delta === null || delta === undefined || delta === Infinity || isNaN(delta)) {
    return '-'
  } else {
    return `${Number(Math.abs(delta).toFixed(2))}`
  }
}

export interface ZoomLevels {
  initialMin: number
  initialMax: number
  min: number
  max: number
}

const min = 0.001
const max = 2

export const ZOOM_LEVELS: Record<FeeAmount, ZoomLevels> = {
  [FeeAmount.LOWEST]: {
    initialMin: 0.999,
    initialMax: 1.001,
    min: min,
    max: max,
  },
  [FeeAmount.LOW]: {
    initialMin: 0.999,
    initialMax: 1.001,
    min: min,
    max: max,
  },
  [FeeAmount.MEDIUM]: {
    initialMin: 0.5,
    initialMax: 2,
    min: min,
    max: max,
  },
  [FeeAmount.HIGH]: {
    initialMin: 0.5,
    initialMax: 2,
    min: min,
    max: max,
  },
}

interface LiquidityChartRangeInputProps {
  currencyA?: Currency
  currencyB?: Currency
  feeAmount?: FeeAmount
  ticksAtLimit: { [bound in Bound]?: boolean | undefined }
  price?: string
  priceLower?: Price<Token, Token>
  priceUpper?: Price<Token, Token>
  onLeftRangeInput: (typedValue: string) => void
  onRightRangeInput: (typedValue: string) => void
  interactive: boolean
  error: any
  formattedData: any[]
  isInitialized: boolean
}

export default function LiquidityChartRangeInput({
  currencyA,
  currencyB,
  feeAmount,
  ticksAtLimit,
  price,
  priceLower,
  priceUpper,
  onLeftRangeInput,
  onRightRangeInput,
  interactive,
  error,
  formattedData,
  isInitialized,
}: LiquidityChartRangeInputProps) {
  const isSorted = currencyA && currencyB && currencyA?.wrapped.sortsBefore(currencyB?.wrapped)

  const onBrushDomainChangeEnded = useCallback(
    (domain: [number, number], mode: string | undefined) => {
      const leftRangeValue = Number(domain[0])
      const rightRangeValue = Number(domain[1])

      // simulate user input for auto-formatting and other validations
      batch(() => {
        const leftRangeIsAtLimit = !ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]
        if ((leftRangeIsAtLimit || mode === 'handle' || mode === 'reset') && leftRangeValue > 0) {
          onLeftRangeInput(leftRangeValue.toFixed(18))
        }

        const rightRangeIsAtLimit = !ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]
        if ((rightRangeIsAtLimit || mode === 'reset') && rightRangeValue > 0) {
          // todo: remove this check. Upper bound for large numbers sometimes fails to parse to tick.
          if (rightRangeValue < 1e35) {
            onRightRangeInput(rightRangeValue.toFixed(18))
          }
        }
      })
    },
    [isSorted, onLeftRangeInput, onRightRangeInput, ticksAtLimit]
  )

  interactive = interactive && Boolean(formattedData?.length)

  const brushDomain: [number, number] | undefined = useMemo(() => {
    const leftPrice = isSorted ? priceLower : priceUpper?.invert()
    const rightPrice = isSorted ? priceUpper : priceLower?.invert()

    return leftPrice && rightPrice
      ? [parseFloat(leftPrice?.toSignificant(6)), parseFloat(rightPrice?.toSignificant(6))]
      : undefined
  }, [isSorted, priceLower, priceUpper])

  const brushLabelValue = useCallback(
    (d: 'w' | 'e', x: number) => {
      if (!Number(price)) return ''

      if (d === 'w' && ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]) return '0'
      if (d === 'e' && ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]) return '∞'

      const percent =
        (x < Number(price) ? -1 : 1) * ((Math.max(x, Number(price)) - Math.min(x, Number(price))) / Number(price)) * 100

      return price ? `${(Math.sign(percent) < 0 ? '-' : '') + formatDelta(percent)}` : ''
    },
    [isSorted, price, ticksAtLimit]
  )

  if ((error && !formattedData) || !isInitialized) {
    return (
      <Text fontSize={3} fontWeight={700}>
        Liquidity data not avaliable
      </Text>
    )
  }

  if (!formattedData || formattedData.length === 0 || !price) {
    return (
      <Text fontSize={3} fontWeight={700}>
        There is no liquidity data.
      </Text>
    )
  }

  return (
    <Chart
      data={{ series: formattedData, current: price }}
      margins={{ top: 0, right: 0, bottom: 30, left: 0 }}
      styles={{
        area: {
          selection: 'red',
        },
        brush: {
          handle: {
            west: '#70e000',
            east: '#70e000',
          },
        },
      }}
      interactive={interactive}
      brushLabels={brushLabelValue}
      brushDomain={brushDomain}
      onBrushDomainChange={onBrushDomainChangeEnded}
      zoomLevels={ZOOM_LEVELS[feeAmount ?? FeeAmount.MEDIUM]}
      ticksAtLimit={ticksAtLimit}
    />
  )
}
