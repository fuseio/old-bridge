import { useSelector } from 'react-redux'
import { useCallback, useEffect, useState } from 'react'
import { Box, Button, Card, Flex, Text } from 'rebass/styled-components'

import { useWeb3 } from '../../../../hooks'
import { useToken } from '../../../../hooks/Tokens'
import { usePool } from '../../../../hooks/usePools'
import { calculateGasMargin } from '../../../../utils'
import useAnalytics from '../../../../hooks/useAnalytics'
import { useMasterChefV4 } from '../../../../hooks/useContract'
import { BalanceLoader } from '../../../../wrappers/BalanceLoader'
import { NonfungiblePositionManager } from '@voltage-finance/v3-sdk'
import { useTransactionAdder } from '../../../../state/transactions/hooks'
import { useV3PositionFromTokenId } from '../../../../hooks/useV3Positions'
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from '@voltage-finance/sdk-core'
import { useDerivedPositionInfo } from '../../../../hooks/useDerivedPositionInfo'

const Positions = ({ pool }: { pool: any }) => {
  const { chainId, account, library, connectWallet } = useWeb3()
  const [currentPair, setCurrentPair] = useState()
  const { pairs } = useSelector((state: any) => state?.pool)

  useEffect(() => {
    const foundPair = pairs.find(({ id }) => {
      return id === pool?.id
    })
    if (foundPair) {
      setCurrentPair(foundPair)
    }
  }, [pairs])

  const { position: positionDetails } = useV3PositionFromTokenId(pool?.id)

  const { position: existingPosition } = useDerivedPositionInfo(positionDetails)

  const { token0: token0Address, token1: token1Address, fee: feeAmount } = positionDetails || {}

  const token0Data = useToken(token0Address)
  const token1Data = useToken(token1Address)

  const [, v3Pool] = usePool(token0Data ?? undefined, token1Data ?? undefined, feeAmount)

  const masterChefV4 = useMasterChefV4(true)

  const addTransaction = useTransactionAdder()

  const { sendEvent } = useAnalytics()

  const onStake = useCallback(() => {
    if (!masterChefV4 || !pool) return

    const { calldata, value } = NonfungiblePositionManager.safeTransferFromParameters({
      tokenId: pool.id,
      recipient: masterChefV4.address,
      sender: account,
    })

    const txn = {
      to: NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId],
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
              summary: 'Staked V3 Farm',
            })
            sendEvent('Staked V3 Farm', {
              pairId: pool?.pool?.v3Pool,
              pairName: `${pool?.pool?.token0?.symbol}/${pool?.pool?.token1?.symbol}`,
              pairToken0: pool?.pool?.token0?.id,
              pairToken1: pool?.pool?.token1?.id,
              amountToken0: existingPosition?.amount0?.toSignificant(6),
              amountToken1: existingPosition?.amount1?.toSignificant(6),
            })
          })
      })
  }, [account, addTransaction, chainId, library, masterChefV4, pool, existingPosition])

  const onUnstake = useCallback(async () => {
    try {
      if (!pool || !account) return

      const response = await masterChefV4.withdraw(pool.id, account)

      addTransaction(response, {
        summary: 'Unstaked V3 Farm',
      })
      sendEvent('Unstaked V3 Farm', {
        pairId: pool?.pool?.v3Pool,
        pairName: `${pool?.pool?.token0?.symbol}/${pool?.pool?.token1?.symbol}`,
        pairToken0: pool?.pool?.token0?.id,
        pairToken1: pool?.pool?.token1?.id,
        amountToken0: existingPosition?.amount0?.toSignificant(6),
        amountToken1: existingPosition?.amount1?.toSignificant(6),
      })
    } catch (error) {
      console.error('onUnstake', error)
    }
  }, [account, addTransaction, masterChefV4, pool, existingPosition])

  return (
    <Card px={3} py={3} backgroundColor={'white'} width={'100%'} height={'100%'}>
      <Flex justifyContent={'space-between'}>
        <Text fontSize={1}>Position</Text>
      </Flex>
      <Box py={1}></Box>

      <Flex justifyContent={'space-between'} flexDirection={'column'} style={{ gap: '8px' }} py={2}>
        <Flex alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
          <Text opacity={0.7} fontSize={1}>
            {v3Pool?.token0?.symbol}
          </Text>
          <BalanceLoader>
            <Text fontSize={2} fontWeight={600}>
              {existingPosition?.amount0?.toSignificant(6)}
            </Text>
          </BalanceLoader>
        </Flex>
        <Flex alignItems={'center'} justifyContent={'space-between'}>
          <Text opacity={0.7} fontSize={1}>
            {v3Pool?.token1?.symbol}
          </Text>

          <BalanceLoader>
            <Text fontSize={2} fontWeight={600}>
              {existingPosition?.amount1?.toSignificant(6)}
            </Text>
          </BalanceLoader>
        </Flex>
      </Flex>
      <Flex pt={3} justifyContent={'end'} width={'100%'} style={{ gap: '8px' }}>
        {pool && pool.isStaked ? (
          <Button
            variant="tertiary"
            onClick={() => {
              if (!account) {
                connectWallet()
              } else {
                onUnstake()
              }
            }}
            fontSize={0}
            fontWeight={600}
          >
            Unstake
          </Button>
        ) : (
          <Button
            variant="tertiary"
            bg="highlight"
            width={'fit-content'}
            height={'fit-content'}
            color="black"
            onClick={() => {
              if (!account) {
                connectWallet()
              } else {
                onStake()
              }
            }}
            fontSize={0}
            fontWeight={600}
          >
            Stake
          </Button>
        )}
      </Flex>
    </Card>
  )
}
export default Positions
