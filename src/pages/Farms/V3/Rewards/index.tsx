import { useCallback } from 'react'
import { ChevronRight } from 'react-feather'
import { Box, Card, Flex, Text } from 'rebass/styled-components'

import { useWeb3 } from '../../../../hooks'
import { formatSignificant } from '../../../../utils'
import useAddChain from '../../../../hooks/useAddChain'
import useAnalytics from '../../../../hooks/useAnalytics'
import { useMasterChefV4 } from '../../../../hooks/useContract'
import { BalanceLoader } from '../../../../wrappers/BalanceLoader'
import { ChainId, FUSE_CHAIN } from '../../../../constants/chains'
import { useTransactionAdder } from '../../../../state/transactions/hooks'
import useMasterChefV4PendingRewards from '../../../../hooks/v3/useMasterChefV4PendingRewards'

const V3Rewards = ({ pool }: { pool: any }) => {
  const { chainId, account } = useWeb3()
  const pendingRewards = useMasterChefV4PendingRewards(pool?.id)
  const { addChain } = useAddChain()
  const addTransaction = useTransactionAdder()
  const masterChefV4 = useMasterChefV4(true)

  const { sendEvent } = useAnalytics()

  const hasClaim =
    Number(pendingRewards?.pendingVolt?.toExact()) > 0 || Number(pendingRewards?.pendingWFuse.toExact()) > 0

  const claim = useCallback(async () => {
    if (!pool || !account) return

    const response = await masterChefV4.harvest(pool.id, account)

    addTransaction(response, {
      summary: 'Claim V3 Rewards',
    })

    sendEvent('Claim Rewards Farm V3', {
      pairId: pool?.pool?.v3Pool,
      pairName: `${pool?.pool?.token0?.symbol}/${pool?.pool?.token1?.symbol}`,
      pairToken0: pool?.pool?.token0?.id,
      pairToken1: pool?.pool?.token1?.id,
      voltClaimed: pendingRewards?.pendingVolt?.toSignificant(6),
      wfuseClaimed: pendingRewards?.pendingWFuse?.toSignificant(6),
    })
  }, [account, addTransaction, masterChefV4, pool])

  return (
    <Flex opacity={pendingRewards ? 1 : 0.7} height={'100%'} width="100%">
      <Card px={3} py={3} backgroundColor={'white'} height={'100%'} width="100%">
        <Flex alignItems={'center'} justifyContent="space-between" style={{ gap: '4px' }}>
          <Text fontSize={1} fontWeight={500}>
            Pending Rewards
          </Text>
        </Flex>
        <Box py={1}></Box>

        <Flex style={{ gap: '16px' }} width={'100%'} flexDirection={'column'}>
          <Flex flexDirection={'column'} style={{ gap: '8px' }} py={2}>
            <Flex alignItems={'center'} justifyContent={'space-between'}>
              <Text opacity={0.7} fontSize={1}>
                VOLT
              </Text>
              <BalanceLoader>
                <Text fontSize={2} fontWeight={600}>
                  {formatSignificant({ value: pendingRewards?.pendingVolt?.toSignificant(6) })}
                </Text>
              </BalanceLoader>
            </Flex>
            <Flex alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
              <Text opacity={0.7} fontSize={1}>
                WFUSE
              </Text>
              <Flex style={{ gap: '8px' }} alignItems={'center'}>
                <BalanceLoader>
                  <Text fontSize={2} fontWeight={600}>
                    {formatSignificant({
                      value: pendingRewards?.pendingWFuse?.toSignificant(6),
                    })}
                  </Text>
                </BalanceLoader>
              </Flex>
            </Flex>
          </Flex>

          {hasClaim && (
            <Flex pt={2} alignItems={'end'} justifyContent="end" width={'100%'} style={{ gap: '2px' }}>
              <Flex style={{ gap: '8px' }}>
                {chainId === ChainId.FUSE ? (
                  <Text onClick={claim} fontSize={1} color="#4FB2DC" style={{ cursor: 'pointer' }} fontWeight={500}>
                    Claim
                  </Text>
                ) : (
                  <Text
                    onClick={() => {
                      addChain(FUSE_CHAIN)
                    }}
                    fontSize={1}
                    color="#4FB2DC"
                    style={{ cursor: 'pointer' }}
                    fontWeight={500}
                  >
                    Switch to Fuse
                  </Text>
                )}
              </Flex>
              <ChevronRight color="#4FB2DC" style={{ marginTop: '2px' }} size={16} />
            </Flex>
          )}
        </Flex>
      </Card>
    </Flex>
  )
}
export default V3Rewards
