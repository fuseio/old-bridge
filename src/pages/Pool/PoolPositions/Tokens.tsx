import { useCallback } from 'react'
import { Token } from '@voltage-finance/sdk-core'
import { NonfungiblePositionManager } from '@voltage-finance/v3-sdk'
import { Box, Button, Card, Flex, Text } from 'rebass/styled-components'

import { useWeb3 } from '../../../hooks'
import { usePair } from '../../../data/Reserves'
import { useToken } from '../../../hooks/Tokens'
import { usePool } from '../../../hooks/usePools'
import { ChainId } from '../../../constants/chains'
import { PAIR_VERSION } from '../../../state/pool/updater'
import { BalanceLoader } from '../../../wrappers/BalanceLoader'
import { ComponentLoader } from '../../../wrappers/ComponentLoader'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { useV3NFTPositionManagerContract } from '../../../hooks/useContract'
import { addTokenToWallet, calculateGasMargin, formatSignificant } from '../../../utils'
import { useV3PositionFees, useV3PositionFromTokenId } from '../../../hooks/useV3Positions'

const Tokens = ({ pool: { token0, token1, version, tokenId, balance0, balance1 } }: { pool: any }) => {
  const { library, chainId, account } = useWeb3()

  const [, pair] = usePair(
    typeof token0 === 'object'
      ? new Token(chainId, token0?.id, parseInt(token0?.decimals), token0?.symbol, token0?.name)
      : undefined,
    typeof token1 === 'object'
      ? new Token(chainId, token1?.id, parseInt(token1?.decimals), token1?.symbol, token1?.name)
      : undefined
  )

  const { position: positionDetails } = useV3PositionFromTokenId(tokenId)

  const { token0: token0Address, token1: token1Address, fee: feeAmount } = positionDetails || {}

  const token0Data = useToken(token0Address)
  const token1Data = useToken(token1Address)

  const [, pool] = usePool(token0Data ?? undefined, token1Data ?? undefined, feeAmount)

  const [feeValue0, feeValue1] = useV3PositionFees(pool ?? undefined, positionDetails?.tokenId, false)

  const feeValueUpper = feeValue1
  const feeValueLower = feeValue0

  const positionManager = useV3NFTPositionManagerContract()

  const addTransaction = useTransactionAdder()

  const onCollect = useCallback(() => {
    if (!tokenId || !positionManager || !library) return

    const { calldata, value } = NonfungiblePositionManager.collectCallParameters({
      tokenId: tokenId.toString(),
      expectedCurrencyOwed0: feeValue0,
      expectedCurrencyOwed1: feeValue1,
      recipient: account,
    })

    const txn = {
      to: positionManager.address,
      data: calldata,
      value,
    }

    library
      .getSigner()
      .estimateGas(txn)
      .then((estimate) => {
        const newTxn = {
          ...txn,
          gasLimit: calculateGasMargin(estimate),
        }

        return library
          .getSigner()
          .sendTransaction(newTxn)
          .then((response) => {
            addTransaction(response, {
              summary: 'Collected V3 Fees',
            })
          })
      })
  }, [account, addTransaction, feeValue0, feeValue1, library, positionManager, tokenId])

  const loadingV3 = !feeValueUpper || !feeValueLower

  return version === PAIR_VERSION.V3 ? (
    <Card px={3} py={3} backgroundColor={'white'} width={'100%'} height={'100%'}>
      <Flex justifyContent={'space-between'}>
        <Text fontSize={1}>Unclaimed Fees</Text>
      </Flex>
      <Box py={1}></Box>

      <Flex justifyContent={'space-between'} flexDirection={'column'} style={{ gap: '8px' }} py={2}>
        <Flex alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
          <ComponentLoader dark height={16.8} width={50} loading={loadingV3}>
            <Text opacity={0.7} fontSize={1}>
              {feeValueUpper?.currency?.symbol}
            </Text>
          </ComponentLoader>
          <ComponentLoader dark height={19.9} width={30} loading={loadingV3}>
            <Text fontSize={2} fontWeight={600}>
              {feeValueUpper?.toSignificant(3)}
            </Text>
          </ComponentLoader>
        </Flex>
        <Flex alignItems={'center'} justifyContent={'space-between'}>
          <ComponentLoader dark height={16.8} width={30} loading={loadingV3}>
            <Text opacity={0.7} fontSize={1}>
              {feeValueLower?.currency?.symbol}
            </Text>
          </ComponentLoader>
          <ComponentLoader dark height={19.9} width={50} loading={loadingV3}>
            <Text fontSize={2} fontWeight={600}>
              {feeValueLower?.toSignificant(3)}
            </Text>
          </ComponentLoader>
        </Flex>
      </Flex>
      {library && (
        <Flex pt={3} justifyContent={'end'} width={'100%'} style={{ gap: '8px' }}>
          {chainId === ChainId.FUSE && tokenId && (feeValue0?.greaterThan('0') || feeValue1?.greaterThan('0')) && (
            <Button
              sx={{
                pointerEvents: loadingV3 ? 'none' : 'all',
                opacity: loadingV3 ? 0.5 : 1,
              }}
              onClick={() => onCollect()}
              variant="tertiary"
              fontSize={0}
              fontWeight={600}
            >
              Collect
            </Button>
          )}
        </Flex>
      )}
    </Card>
  ) : (
    <Card px={3} py={3} backgroundColor={'white'} width={'100%'} height={'100%'}>
      <Flex justifyContent={'space-between'}>
        <Text fontSize={1}>Tokens</Text>
      </Flex>
      <Box py={1}></Box>

      <Flex justifyContent={'space-between'} flexDirection={'column'} style={{ gap: '8px' }} py={2}>
        <Flex alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
          <Text opacity={0.7} fontSize={1}>
            {token0.symbol}
          </Text>
          <BalanceLoader>
            <Text fontSize={2} fontWeight={600}>
              {formatSignificant({
                value: balance0,
              })}
            </Text>
          </BalanceLoader>
        </Flex>
        <Flex alignItems={'center'} justifyContent={'space-between'}>
          <Text opacity={0.7} fontSize={1}>
            {token1.symbol}
          </Text>
          <Text fontSize={2} fontWeight={600}>
            {formatSignificant({
              value: balance1,
            })}
          </Text>
        </Flex>
      </Flex>
      {library && (
        <Flex pt={3} justifyContent={'end'} width={'100%'} style={{ gap: '8px' }}>
          {chainId === ChainId.FUSE && pair && token0 && token1 && (
            <Button
              onClick={() => {
                addTokenToWallet(
                  new Token(
                    pair?.liquidityToken?.chainId,
                    pair?.liquidityToken?.address,
                    pair?.liquidityToken?.decimals,
                    token0?.symbol + '/' + token1?.symbol,
                    token0?.symbol + '/' + token1?.symbol
                  ),
                  library
                )
              }}
              variant="tertiary"
              fontSize={0}
              fontWeight={600}
            >
              Add {token0?.symbol + '/' + token1?.symbol}
            </Button>
          )}
        </Flex>
      )}
    </Card>
  )
}
export default Tokens
