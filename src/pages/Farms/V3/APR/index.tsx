import { Position } from '@voltage-finance/v3-sdk'
import { useMemo, useState } from 'react'
import { Box, Flex, Text } from 'rebass/styled-components'
import { Statistic } from '../../../../components/Statistic'
import { useToken } from '../../../../hooks/Tokens'
import { usePool } from '../../../../hooks/usePools'
import { useV3PositionFromTokenId } from '../../../../hooks/useV3Positions'
import useIsTickAtLimit from '../../../../hooks/v3/useIsTickAtLimit'
import { Bound } from '../../../../state/mint/v3/actions'
import { formatTickPrice, useInverter } from '../../../../utils'
import getPriceOrderingFromPosition from '../../../../utils/getPriceOrderingFromPosition'
import { unwrappedToken } from '../../../../utils/wrappedCurrency'

const Limit = ({ apr, symbol }: { apr: any; symbol: string }) => {
  return (
    <Flex alignItems={'center'} width="100%" justifyContent={'space-between'}>
      <Text fontWeight={500} fontSize={3}>
        {apr || 0}
      </Text>
      <Text fontWeight={300} fontSize={2}>
        {symbol}
      </Text>
    </Flex>
  )
}

const V3APR = ({ pool, apr }: { pool: any; apr: any }) => {
  const { position: positionDetails } = useV3PositionFromTokenId(pool?.id)

  const {
    token0: token0Address,
    token1: token1Address,
    fee: feeAmount,
    tickLower,
    tickUpper,
    liquidity,
  } = positionDetails || {}

  const tickAtLimit = useIsTickAtLimit(feeAmount, tickLower, tickUpper)

  const token0Data = useToken(token0Address)
  const token1Data = useToken(token1Address)

  const currency0 = token0Data ? unwrappedToken(token0Data) : undefined
  const currency1 = token1Data ? unwrappedToken(token1Data) : undefined

  const [, v3Pool] = usePool(token0Data ?? undefined, token1Data ?? undefined, feeAmount)

  const position = useMemo(() => {
    if (v3Pool && typeof liquidity === 'object' && typeof tickLower === 'number' && typeof tickUpper === 'number') {
      return new Position({ pool: v3Pool, liquidity: liquidity.toString(), tickLower, tickUpper })
    }
    return undefined
  }, [liquidity, tickLower, tickUpper, v3Pool])

  const pricesFromPosition = getPriceOrderingFromPosition(position)

  const [manuallyInverted] = useState(false)

  const { priceLower, priceUpper, base } = useInverter({
    priceLower: pricesFromPosition.priceLower,
    priceUpper: pricesFromPosition.priceUpper,
    quote: pricesFromPosition.quote,
    base: pricesFromPosition.base,
    invert: manuallyInverted,
  })

  const inverted = token1Data && base ? base.equals(token1Data) : undefined
  const currencyQuote = inverted ? currency0 : currency1
  const currencyBase = inverted ? currency1 : currency0

  const formattedApr = typeof apr === 'number' && apr === Infinity ? apr : apr?.toFixed(2)

  return (
    <Box backgroundColor={'transparent'} height={'100%'} pr={3} width={'100%'}>
      <Statistic name="APR" decimals={0} size={1} value={`${formattedApr}%`} />

      <Box pt={3}>
        <Text fontSize={1} color="blk50" fontWeight={600} pb={2}>
          {currencyQuote?.symbol} per {currencyBase?.symbol}
        </Text>
        <Flex style={{ gap: '10px' }} flexDirection={'column'}>
          {priceUpper && (
            <Flex sx={{ gap: 3 }}>
              <Limit apr={formatTickPrice(priceLower, tickAtLimit, Bound.LOWER)} symbol={`Min`} />
            </Flex>
          )}
          {priceUpper && <Limit apr={formatTickPrice(priceUpper, tickAtLimit, Bound.UPPER)} symbol={`Max`} />}
        </Flex>
      </Box>
    </Box>
  )
}
export default V3APR
