import { FeeAmount } from '@voltage-finance/v3-sdk'
import { Flex, Text } from 'rebass/styled-components'
import { useCallback, useEffect, useState } from 'react'
import { Currency, Price, Token } from '@voltage-finance/sdk-core'

import { PriceSelector } from './PriceSelector'
import { preset } from '../../../../theme/preset'
import Loader from '../../../../components/Loader'
import { Field } from '../../../../state/mint/actions'
import { FUSE_GRAPH_TOKEN } from '../../../../constants'
import { Bound } from '../../../../state/mint/v3/actions'
import { tryParsePrice } from '../../../../state/mint/v3/utils'
import NumericalInput from '../../../../components/NumericalInput'
import { QUICK_ACTION_CONFIG, QuickActions } from './QuickActions'
import LiquidityChartRangeInput, { ZOOM_LEVELS, ZoomLevels } from './LiquidityChartRangeInput'

interface LiquidityPriceRangeProps {
  price: Price<Token, Token>
  error: any
  feeAmount: FeeAmount
  currencies: {
    CURRENCY_A?: Currency
    CURRENCY_B?: Currency
  }
  noLiquidity: boolean
  invertPrice: boolean
  baseCurrency: Currency
  quoteCurrency: Currency
  ticksAtLimit: {
    LOWER: boolean
    UPPER: boolean
  }
  pricesAtTicks: {
    LOWER: Price<Token, Token>
    UPPER: Price<Token, Token>
  }
  pricesAtLimit: {
    LOWER: Price<Token, Token>
    UPPER: Price<Token, Token>
  }
  formattedData: any[]
  isInitialized: boolean
  getSetFullRange: () => void
  chartDataLoading: boolean
  onBothRangeInput: ({ leftTypedValue, rightTypedValue }: { leftTypedValue: string; rightTypedValue: string }) => void
  onLeftRangeInput: (typedValue: string) => void
  onRightRangeInput: (typedValue: string) => void
  getDecrementLower: () => string
  getIncrementLower: () => string
  getDecrementUpper: () => string
  getIncrementUpper: () => string
  onStartPriceInput: (typedValue: string) => void
  leftRangeTypedValue: string | true
  startPriceTypedValue: string
  rightRangeTypedValue: string | true
  hasExistingPosition: boolean
}

export default function LiquidityPriceRange({
  price,
  error,
  feeAmount,
  currencies,
  noLiquidity,
  invertPrice,
  ticksAtLimit,
  baseCurrency,
  quoteCurrency,
  pricesAtTicks,
  pricesAtLimit,
  formattedData,
  isInitialized,
  getSetFullRange,
  chartDataLoading,
  onBothRangeInput,
  onLeftRangeInput,
  onRightRangeInput,
  getDecrementLower,
  getIncrementLower,
  getDecrementUpper,
  getIncrementUpper,
  onStartPriceInput,
  leftRangeTypedValue,
  startPriceTypedValue,
  rightRangeTypedValue,
  hasExistingPosition,
}: LiquidityPriceRangeProps) {
  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks

  const [data, setData] = useState<any[]>(null)

  const [token0, setToken0] = useState(null)
  const [token1, setToken1] = useState(null)

  const handleRefresh = useCallback(
    (zoomLevel?: ZoomLevels) => {
      const currentPrice = price ? parseFloat((invertPrice ? price.invert() : price).toSignificant(8)) : undefined
      if (currentPrice) {
        onBothRangeInput({
          leftTypedValue: tryParsePrice(
            baseCurrency?.wrapped,
            quoteCurrency?.wrapped,
            (
              currentPrice * (zoomLevel?.initialMin ?? ZOOM_LEVELS[feeAmount ?? FeeAmount.MEDIUM].initialMin)
            )?.toString()
          )?.toSignificant(5),
          rightTypedValue: tryParsePrice(
            baseCurrency?.wrapped,
            quoteCurrency?.wrapped,
            (
              currentPrice * (zoomLevel?.initialMax ?? ZOOM_LEVELS[feeAmount ?? FeeAmount.MEDIUM].initialMax)
            )?.toString()
          )?.toSignificant(5),
        })
      }
    },
    [baseCurrency?.wrapped, feeAmount, invertPrice, onBothRangeInput, price, quoteCurrency?.wrapped]
  )

  const handleSetFullRange = useCallback(() => {
    getSetFullRange()

    const minPrice = pricesAtLimit[Bound.LOWER]
    const maxPrice = pricesAtLimit[Bound.UPPER]

    if (minPrice && maxPrice) {
      onBothRangeInput({
        leftTypedValue: minPrice?.toSignificant(5),
        rightTypedValue: maxPrice?.toSignificant(5),
      })
    }
  }, [getSetFullRange, onBothRangeInput, pricesAtLimit])

  const isSorted =
    baseCurrency &&
    quoteCurrency &&
    baseCurrency?.wrapped &&
    quoteCurrency?.wrapped &&
    baseCurrency?.wrapped.sortsBefore(quoteCurrency?.wrapped)

  useEffect(() => {
    if (!price) {
      return
    }

    const priceMult = Object.entries<ZoomLevels>(QUICK_ACTION_CONFIG[feeAmount])?.sort(([a], [b]) => +a - +b)
    handleRefresh(priceMult[0][1])

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, feeAmount])

  useEffect(() => {
    const currency0 = currencies[Field.CURRENCY_A] as any
    const currency1 = currencies[Field.CURRENCY_B] as any

    if (currency0 && currency1) {
      if (currency0?.symbol === 'FUSE') {
        setToken0(FUSE_GRAPH_TOKEN)
      } else if (currency0?.address) {
        setToken0(
          new Token(currency0?.chainId, currency0?.address, currency0?.decimals, currency0?.symbol, currency0?.name)
        )
      }

      if (currency1?.symbol === 'FUSE') {
        setToken1(FUSE_GRAPH_TOKEN)
      } else if (currency1?.address) {
        setToken1(
          new Token(currency1?.chainId, currency1?.address, currency1?.decimals, currency1?.symbol, currency1?.name)
        )
      }
    }
  }, [currencies])

  useEffect(() => {
    if (!!formattedData) {
      setData(formattedData)
    }
  }, [baseCurrency, quoteCurrency, formattedData])

  const startingPrice = (
    <Flex alignItems={'center'} sx={{ gap: 3 }}>
      <Flex width="60%">
        <NumericalInput
          opacity={1}
          color={'black'}
          height={'40px'}
          fontWeight={600}
          border={'1px solid'}
          paddingLeft={'10px'}
          borderRadius={'10px'}
          value={startPriceTypedValue}
          borderColor={preset.colors.gray70}
          onUserInput={(input) => onStartPriceInput(input)}
        />
      </Flex>
      <Text fontSize={'14px'} color="gray150" fontWeight={400} textAlign={'left'}>
        {quoteCurrency?.symbol} per {baseCurrency?.symbol}
      </Text>
    </Flex>
  )

  const addLiquidity = (
    <>
      <LiquidityChartRangeInput
        currencyA={baseCurrency}
        currencyB={quoteCurrency}
        feeAmount={feeAmount}
        ticksAtLimit={ticksAtLimit}
        price={price ? (invertPrice ? price.invert() : price).toSignificant(8) : undefined}
        priceLower={priceLower}
        priceUpper={priceUpper}
        onLeftRangeInput={onLeftRangeInput}
        onRightRangeInput={onRightRangeInput}
        interactive={!hasExistingPosition}
        error={error}
        formattedData={data}
        isInitialized={isInitialized}
      />

      <Flex flexDirection={['column', 'row']} sx={{ gap: [4, 2, 4] }} justifyContent={'space-between'}>
        <QuickActions handleRefresh={handleRefresh} handleSetFullRange={handleSetFullRange} feeAmount={feeAmount} />

        <Text
          width={['100%', '40%', '50%']}
          color={'blk70'}
          fontWeight={500}
          fontSize={['14px', '12px', '14px']}
          alignContent={'center'}
        >
          Current Price: {price?.toFixed()} {token1?.symbol} per {token0?.symbol}
        </Text>
      </Flex>
    </>
  )

  const priceIsLoading = isInitialized && !noLiquidity && !price
  const dataIsLoading = chartDataLoading && data?.length == 0

  if (priceIsLoading || error || dataIsLoading) {
    return (
      <Flex flexDirection={'column'} sx={{ gap: 4 }}>
        <Loader sx={null} />
      </Flex>
    )
  }

  return (
    <Flex flexDirection={['column', 'column']} sx={{ gap: 4 }}>
      {isInitialized && !noLiquidity ? addLiquidity : startingPrice}

      <Flex flexDirection={['column', 'column', 'row']} sx={{ gap: 3 }}>
        <PriceSelector
          title={'Min Price'}
          subTitle={`${token1?.symbol} per ${token0?.symbol}`}
          value={leftRangeTypedValue}
          onDecrement={() => {
            const getDecrement = isSorted ? getDecrementLower : getIncrementUpper
            onLeftRangeInput(getDecrement())
          }}
          onIncrement={() => {
            const getIncrement = isSorted ? getIncrementLower : getDecrementUpper
            onLeftRangeInput(getIncrement())
          }}
          onUserInput={(value) => {
            onLeftRangeInput(value)
          }}
        />

        <PriceSelector
          title={'Max Price'}
          subTitle={`${token1?.symbol} per ${token0?.symbol}`}
          value={rightRangeTypedValue}
          onDecrement={() => {
            const getDecrement = isSorted ? getDecrementUpper : getIncrementLower
            onRightRangeInput(getDecrement())
          }}
          onIncrement={() => {
            const getIncrement = isSorted ? getIncrementUpper : getDecrementLower
            onRightRangeInput(getIncrement())
          }}
          onUserInput={(value: string) => {
            onRightRangeInput(value)
          }}
        />
      </Flex>
    </Flex>
  )
}
