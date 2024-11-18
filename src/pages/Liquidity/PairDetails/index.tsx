import { Card, Flex, Text, Box } from 'rebass/styled-components'
import { IconDivider } from '../../../wrappers/IconDivider'
import MultiCurrencyLogo from '../../../components/MultiCurrencyLogo'
import { Repeat } from 'react-feather'
import { BigNumber } from '@ethersproject/bignumber'

import { useV3DerivedMintInfo } from '../../../state/mint/v3/hooks'
import getPriceOrderingFromPosition from '../../../utils/getPriceOrderingFromPosition'
import { useDerivedPositionInfo } from '../../../hooks/useDerivedPositionInfo'
import { formatFeeAmount, formatTickPrice, useInverter } from '../../../utils'
import { useV3PositionFromTokenId } from '../../../hooks/useV3Positions'
import { useState } from 'react'
import useIsTickAtLimit from '../../../hooks/v3/useIsTickAtLimit'
import { Bound } from '../../../state/mint/v3/actions'
import { unwrappedToken } from '../../../utils/wrappedCurrency'

export const PairDetails = ({ baseCurrency, quoteCurrency, feeAmount, tokenId }: any) => {
  const [manuallyInverted, setManuallyInverted] = useState(false)

  const { position: existingPositionDetails, loading: positionLoading } = useV3PositionFromTokenId(
    tokenId ? BigNumber.from(tokenId) : undefined
  )
  const hasExistingPosition = !!existingPositionDetails && !positionLoading

  const { position: existingPosition } = useDerivedPositionInfo(existingPositionDetails)
  const pricesFromPosition = getPriceOrderingFromPosition(existingPosition)

  const { priceLower, priceUpper, base } = useInverter({
    priceLower: pricesFromPosition.priceLower,
    priceUpper: pricesFromPosition.priceUpper,
    quote: pricesFromPosition.quote,
    base: pricesFromPosition.base,
    invert: manuallyInverted,
  })
  const {
    dependentField,
    parsedAmounts,
    noLiquidity,
    currencies,
    depositADisabled,
    depositBDisabled,
    outOfRange,
    errorMessage: error,
  } = useV3DerivedMintInfo(
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount,
    baseCurrency ?? undefined,
    existingPosition
  )
  const inverted = baseCurrency && base ? base.equals(baseCurrency) : undefined
  const tickAtLimit = useIsTickAtLimit(feeAmount, existingPosition?.tickLower, existingPosition?.tickUpper)

  const currency0 = existingPosition?.pool?.token0 ? unwrappedToken(existingPosition?.pool?.token0) : undefined
  const currency1 = existingPosition?.pool?.token1 ? unwrappedToken(existingPosition?.pool?.token1) : undefined

  const currencyQuote = inverted ? currency0 : currency1
  const currencyBase = inverted ? currency1 : currency0
  const positionValueUpper = existingPosition?.amount1
  const positionValueLower = existingPosition?.amount0
  return (
    <Card width={[1, 1 / 2]} minHeight={467}>
      <Flex alignItems={'flex-start'} justifyContent={'space-between'} flexDirection={'row'}>
        <Text fontSize={3} fontWeight={700} pb={1}>
          Pair Details
        </Text>
        {outOfRange ? (
          <Box
            backgroundColor={'grayLt'}
            color={'secondary'}
            width={90}
            py={1}
            fontWeight={700}
            textAlign={'center'}
            fontSize={1}
            sx={{ borderRadius: 'rounded' }}
          >
            INACTIVE
          </Box>
        ) : (
          <Box
            backgroundColor={'highlight'}
            color={'secondary'}
            width={80}
            py={1}
            fontWeight={700}
            textAlign={'center'}
            fontSize={1}
            sx={{ borderRadius: 'rounded' }}
          >
            ACTIVE
          </Box>
        )}
      </Flex>
      <Box mt={3} variant={'outline'}>
        <Flex px={3} width={'100%'} py={3} sx={{ gap: 3 }} flexDirection={'column'}>
          <Flex alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
            <Flex sx={{ gap: 2 }} alignItems={'center'}>
              <MultiCurrencyLogo size={'20'} tokenAddresses={[positionValueLower?.currency?.address]} />
              <Text fontWeight={500} id="remove-liquidity-tokena-symbol">
                {positionValueLower?.currency?.symbol}
              </Text>
            </Flex>
            <Text fontWeight={500}>{positionValueLower?.toSignificant(4)}</Text>
          </Flex>
          <Flex alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
            <Flex sx={{ gap: 2 }} alignItems={'center'}>
              <MultiCurrencyLogo size={'20'} tokenAddresses={[positionValueUpper?.currency?.address]} />
              <Text fontSize={2} fontWeight={500} id="remove-liquidity-tokenb-symbol">
                {positionValueUpper?.currency?.symbol}
              </Text>
            </Flex>
            <Text fontWeight={500}>{positionValueUpper?.toSignificant(4)}</Text>
          </Flex>
        </Flex>
        <IconDivider />
        <Flex alignItems={'center'} p={3} justifyContent={'space-between'} width={'100%'}>
          <Text fontSize={2} fontWeight={500}>
            Fee Tier
          </Text>
          <Text fontWeight={500}>{formatFeeAmount(feeAmount.toString())}%</Text>
        </Flex>
      </Box>
      <Flex justifyContent={'space-between'} alignItems={'center'} paddingY={3}>
        <Text fontSize={3} fontWeight={700} pb={1}>
          Selected Range
        </Text>
        <Repeat height={'15px'} onClick={() => setManuallyInverted(!manuallyInverted)} />
      </Flex>
      <Box variant={'outline'}>
        <Flex px={3} width={'100%'} py={3} sx={{ gap: 3 }} flexDirection={'column'}>
          <Flex alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
            <Text fontSize={2} fontWeight={500} id="remove-liquidity-tokena-symbol">
              Min Price
            </Text>
            <Text fontWeight={500}>
              {formatTickPrice(priceLower, tickAtLimit, Bound.LOWER)} {currencyQuote?.symbol} per {currencyBase?.symbol}
            </Text>
          </Flex>

          <Flex alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
            <Text fontSize={2} fontWeight={500} id="remove-liquidity-tokenb-symbol">
              Max Price
            </Text>

            <Text fontWeight={500}>
              {formatTickPrice(priceUpper, tickAtLimit, Bound.UPPER)} {currencyQuote?.symbol} per {currencyBase?.symbol}
            </Text>
          </Flex>
        </Flex>
        <IconDivider />
        <Flex alignItems={'center'} p={3} justifyContent={'space-between'} width={'100%'}>
          <Text fontSize={2} fontWeight={500}>
            Current Price
          </Text>
          <Text fontWeight={500}>
            {inverted
              ? existingPosition?.pool?.token0Price?.toSignificant(4)
              : existingPosition?.pool?.token1Price?.toSignificant(4)}{' '}
            {currencyQuote?.symbol} per {currencyBase?.symbol}
          </Text>
        </Flex>
      </Box>
    </Card>
  )
}
