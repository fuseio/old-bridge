import { Repeat } from 'react-feather'
import { useSelector } from 'react-redux'
import { Position } from '@voltage-finance/v3-sdk'
import { useEffect, useMemo, useState } from 'react'
import { Box, Flex, Text } from 'rebass/styled-components'

import { useToken } from '../../../hooks/Tokens'
import { usePool } from '../../../hooks/usePools'
import { Bound } from '../../../state/mint/v3/actions'
import { Statistic } from '../../../components/Statistic'
import { PAIR_VERSION } from '../../../state/pool/updater'
import { unwrappedToken } from '../../../utils/wrappedCurrency'
import useIsTickAtLimit from '../../../hooks/v3/useIsTickAtLimit'
import { ComponentLoader } from '../../../wrappers/ComponentLoader'
import { useV3PositionFromTokenId } from '../../../hooks/useV3Positions'
import { formatSignificant, formatTickPrice, useInverter } from '../../../utils'
import getPriceOrderingFromPosition from '../../../utils/getPriceOrderingFromPosition'

const Statistics = ({ pool }: { pool: any }) => {
  const [currentPair, setCurrentPair] = useState()
  const { pairs } = useSelector((state: any) => state?.pool)
  const { position: positionDetails } = useV3PositionFromTokenId(pool?.tokenId)

  const feesYearly = ((currentPair as any)?.volume24Hours * 0.003 * 356 * 100) / (currentPair as any)?.liquidity

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

  const [manuallyInverted, setManuallyInverted] = useState(false)

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
  const loadingV3 = !v3Pool || !currencyBase || !priceUpper || !priceLower || !currencyQuote

  useEffect(() => {
    const foundPair = pairs.find(({ id }) => {
      return id === pool?.id
    })

    if (foundPair) {
      setCurrentPair(foundPair)
    }
  }, [pairs])

  const header =
    pool?.version === PAIR_VERSION.V3 ? (
      <Flex flexDirection={'column'}>
        <Flex alignItems={'center'} justifyContent={'space-between'}>
          <Text pb={0} fontSize={1} color="blk50" fontWeight={500}>
            Current Price
          </Text>
          <Repeat strokeWidth={1} size={18} onClick={() => setManuallyInverted(!manuallyInverted)} />
        </Flex>
        <Box pt={2}></Box>
        <ComponentLoader dark width={283} height={28} loading={loadingV3}>
          <Text fontSize={4} color="secondary" fontWeight={600}>
            {`${inverted ? v3Pool?.token1Price?.toSignificant(4) : v3Pool?.token0Price?.toSignificant(4)} ${
              currencyQuote?.symbol
            } per ${currencyBase?.symbol}`}
          </Text>
        </ComponentLoader>
      </Flex>
    ) : (
      <Statistic
        name="Liquidity"
        size={1}
        value={formatSignificant({
          value: (currentPair as any)?.liquidity,
          prefix: '$',
        })}
      />
    )

  const body =
    pool?.version === PAIR_VERSION.V3 ? (
      <>
        {' '}
        <ComponentLoader dark width={160} height={19.9} loading={loadingV3}>
          <Flex alignItems={'center'} width="100%" justifyContent={'space-between'}>
            <Text fontWeight={500} fontSize={2}>
              {`${formatTickPrice(priceLower, tickAtLimit, Bound.LOWER)} ${currencyQuote?.symbol} per ${
                currencyBase?.symbol
              }`}
            </Text>

            <Text fontWeight={300} fontSize={2}>
              Min Price
            </Text>
          </Flex>
        </ComponentLoader>
        <ComponentLoader dark width={170} height={19.9} loading={loadingV3}>
          <Flex alignItems={'center'} width="100%" justifyContent={'space-between'}>
            <Text fontWeight={500} color={'primary'} fontSize={2}>
              {`${formatTickPrice(priceUpper, tickAtLimit, Bound.UPPER)} ${currencyQuote?.symbol} per ${
                currencyBase?.symbol
              }`}
            </Text>
            <Text fontWeight={300} fontSize={2}>
              Max Price
            </Text>
          </Flex>
        </ComponentLoader>
      </>
    ) : (
      <>
        {' '}
        <Flex alignItems={'center'} width="100%" justifyContent={'space-between'}>
          <Text fontWeight={500} fontSize={3}>
            {formatSignificant({
              value: (currentPair as any)?.volume24Hours,
              prefix: '$',
            })}
          </Text>
          <Text fontWeight={300} fontSize={2}>
            Vol (24hrs)
          </Text>
        </Flex>
        <Flex alignItems={'center'} width="100%" justifyContent={'space-between'}>
          <Text fontWeight={500} color={'primary'} fontSize={3}>
            +
            {formatSignificant({
              value: feesYearly,
            })}
            %
          </Text>
          <Text fontWeight={300} fontSize={2}>
            Fees / Liq
          </Text>
        </Flex>
      </>
    )

  return (
    <Box backgroundColor={'transparent'} height={'100%'} pr={3} width={'100%'}>
      {header}

      <Box pt={3}>
        <Flex style={{ gap: '10px' }} flexDirection={'column'}>
          {body}
        </Flex>
      </Box>
    </Box>
  )
}
export default Statistics
