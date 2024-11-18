import { BigNumber } from 'ethers'
import { useCallback, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { Position } from '@voltage-finance/v3-sdk'
import { Box, Button, Card, Flex, Text } from 'rebass/styled-components'

import { useWeb3 } from '../../../hooks'
import { useToken } from '../../../hooks/Tokens'
import { usePool } from '../../../hooks/usePools'
import { PAIR_VERSION } from '../../../state/pool/updater'
import { BalanceLoader } from '../../../wrappers/BalanceLoader'
import { ComponentLoader } from '../../../wrappers/ComponentLoader'
import { useV3PositionFromTokenId } from '../../../hooks/useV3Positions'
import { formatSignificant, getFormattedPositionPrice } from '../../../utils'
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from '@voltage-finance/sdk-core'

interface PositionsProps {
  poolPosition: {
    shareOfPool: number
    version: PAIR_VERSION
    balanceUSD: number
    tokenId: BigNumber
    token0: any
    token1: any
    liquidityTokenBalance: number
  }
}

const PoolPositions = ({ poolPosition }: PositionsProps) => {
  const { shareOfPool, version, balanceUSD, tokenId, token0, token1, liquidityTokenBalance } = poolPosition

  const history = useHistory()
  const { library, chainId } = useWeb3()
  const { position: positionDetails } = useV3PositionFromTokenId(tokenId)

  const {
    token0: token0Address,
    token1: token1Address,
    fee: feeAmount,
    liquidity,
    tickLower,
    tickUpper,
  } = positionDetails || {}

  const token0Data = useToken(token0Address)
  const token1Data = useToken(token1Address)
  const [, pool] = usePool(token0Data ?? undefined, token1Data ?? undefined, feeAmount)
  const position = useMemo(() => {
    if (pool && typeof liquidity === 'object' && typeof tickLower === 'number' && typeof tickUpper === 'number') {
      return new Position({ pool, liquidity: liquidity.toString(), tickLower, tickUpper })
    } else {
      return undefined
    }
  }, [liquidity, pool, tickLower, tickUpper])

  const onAddNFTPosition = useCallback(async () => {
    if (!library || !chainId) return

    try {
      await library.provider.request({
        method: 'wallet_watchAsset',
        params: {
          //eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore // need this for incorrect ethers provider type
          type: 'ERC721',
          options: {
            address: NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId],
            tokenId,
          },
        },
      })
    } catch (error) {
      console.error(error)
    }
  }, [chainId, library, tokenId])

  const positionValueUpper = position?.amount1
  const positionValueLower = position?.amount0
  const loadingV3 = !positionValueLower || !positionValueUpper

  const header = version === PAIR_VERSION.V3 ? (
    <Flex justifyContent={'space-between'}>
      <Text fontSize={1}>Liquidity</Text>
      {!loadingV3 && (
        <Text
          fontSize={1}
          style={{ textDecoration: 'underline', cursor: 'pointer' }}
          onClick={() => onAddNFTPosition()}
        >
          Add NFT Position
        </Text>
      )}
    </Flex>
  ) : (
    <Text fontSize={1}>Position</Text>
  )

  const body1 = version === PAIR_VERSION.V3 ? (
    <>
      <Flex alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
        <ComponentLoader dark height={16.8} width={50} loading={loadingV3}>
          <Text opacity={0.7} fontSize={1}>
            {positionValueUpper?.currency?.symbol}
          </Text>
        </ComponentLoader>
        <ComponentLoader dark height={19.9} width={60} loading={loadingV3}>
          <Text fontSize={2} fontWeight={600}>
            {positionValueUpper?.toSignificant(3)}
          </Text>
        </ComponentLoader>
      </Flex>

      <Flex alignItems={'center'} justifyContent={'space-between'}>
        <ComponentLoader dark height={16.8} width={30} loading={loadingV3}>
          <Text opacity={0.7} fontSize={1}>
            {positionValueLower?.currency?.symbol}
          </Text>
        </ComponentLoader>

        <ComponentLoader dark height={19.9} width={30} loading={loadingV3}>
          <Text fontSize={2} fontWeight={600}>
            {positionValueLower?.toSignificant(3)}
          </Text>
        </ComponentLoader>
      </Flex>
    </>
  ) : (
    <>
      <Flex alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
        <Text opacity={0.7} fontSize={1}>
          Share
        </Text>
        <BalanceLoader>
          <Text fontSize={2} fontWeight={600}>
            {shareOfPool * 100 < 0.1
              ? '<0.1%'
              : formatSignificant({
                  value: shareOfPool * 100,
                  suffix: '%',
                })}
          </Text>
        </BalanceLoader>
      </Flex>
      <Flex alignItems={'center'} justifyContent={'space-between'}>
        <Text opacity={0.7} fontSize={1}>
          Amount
        </Text>
        <BalanceLoader>
          <Text fontSize={2} fontWeight={600}>
            {getFormattedPositionPrice(balanceUSD, liquidityTokenBalance)}
          </Text>
        </BalanceLoader>
      </Flex>
    </>
  )

  const body2 = version === PAIR_VERSION.V3 ? (
    <>
      {' '}
      <Button
        onClick={() => {
          history.push(`/adjust/v3/${token0?.id}/${token1?.id}/${feeAmount}/${tokenId}`)
        }}
        sx={{
          pointerEvents: loadingV3 ? 'none' : 'all',
          opacity: loadingV3 ? 0.5 : 1,
        }}
        variant="tertiary"
        color="black"
        bg="highlight"
        fontSize={0}
        fontWeight={600}
      >
        Add
      </Button>
      <Button
        onClick={() => {
          history.push(`/remove/v3/${tokenId}/${feeAmount}`)
        }}
        sx={{
          pointerEvents: loadingV3 ? 'none' : 'all',
          opacity: loadingV3 ? 0.5 : 1,
        }}
        bg="blk70"
        variant="tertiary"
        fontSize={0}
        fontWeight={600}
      >
        Remove
      </Button>
    </>
  ) : (
    <>
      <Button
        onClick={() => {
          history.push('/add/' + token0?.id + '/' + token1?.id)
        }}
        variant="tertiary"
        color="black"
        bg="highlight"
        fontSize={0}
        fontWeight={600}
      >
        Add
      </Button>
      <Button
        onClick={() => {
          history.push('/remove/' + token0?.id + '/' + token1?.id)
        }}
        bg="blk70"
        variant="tertiary"
        fontSize={0}
        fontWeight={600}
      >
        Remove
      </Button>
    </>
  )

  return (
    <Card px={3} py={3} backgroundColor={'white'} width={'100%'} height={'100%'}>
      {header}

      <Box py={1}></Box>

      <Flex justifyContent={'space-between'} flexDirection={'column'} style={{ gap: '8px' }} py={2}>
        {body1}
      </Flex>

      <Flex pt={3} justifyContent={'end'} width={'100%'} style={{ gap: '8px' }}>
        {body2}
      </Flex>
    </Card>
  )
}
export default PoolPositions
