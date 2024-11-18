import { useCallback } from 'react'
import { ChevronRight } from 'react-feather'
import { Box, Card, Flex, Text } from 'rebass/styled-components'

import { useWeb3 } from '../../../../../hooks'
import { formatSignificant } from '../../../../../utils'
import useAddChain from '../../../../../hooks/useAddChain'
import useAnalytics from '../../../../../hooks/useAnalytics'
import useVoteEscrow from '../../../../../hooks/useVoteEscrow'
import { BalanceLoader } from '../../../../../wrappers/BalanceLoader'
import { ChainId, FUSE_CHAIN } from '../../../../../constants/chains'
import { useFeeDistributorContract } from '../../../../../hooks/useContract'
import { useTransactionAdder } from '../../../../../state/transactions/hooks'
import { useTransactionRejectedNotification } from '../../../../../hooks/notifications/useTransactionRejectedNotification'

const Rewards = () => {
  const { account, chainId } = useWeb3()
  const addTransaction = useTransactionAdder()
  const feeDistributorContract = useFeeDistributorContract()
  const { claimableBalance, timeRemainingToDistribution, hasLock } = useVoteEscrow()
  const rejectTransaction = useTransactionRejectedNotification()
  const { sendEvent } = useAnalytics()
  const { addChain } = useAddChain()
  const onClaim = useCallback(async () => {
    if (!feeDistributorContract || !account) return

    try {
      const response = await feeDistributorContract.claim(account)

      sendEvent('Claims Rewards veVOLT', { amount: claimableBalance?.toSignificant(18) })
      addTransaction(response, {
        summary: `Claimed VeVOLT rewards`,
      })
    } catch (e: any) {
      if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
        rejectTransaction()
      }
    }
  }, [feeDistributorContract, account])

  return (
    <Card width={'100%'} height={'100%'} sx={{ position: 'relative' }}>
      <Flex justifyContent={'space-between'}>
        <Text variant={'h4'}>Pending Rewards</Text>
      </Flex>

      {hasLock ? (
        <Box>
          <Flex justifyContent={'space-between'} flexDirection={'column'} style={{ gap: '8px' }} py={2}>
            <Flex alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
              <Text opacity={0.7} fontSize={1}>
                VOLT
              </Text>
              <BalanceLoader>
                <Text fontSize={2} fontWeight={600}>
                  {formatSignificant({ value: claimableBalance?.toSignificant(18) })}
                </Text>
              </BalanceLoader>
            </Flex>
            <Flex alignItems={'center'} justifyContent={'space-between'}>
              <Text opacity={0.7} fontSize={1}>
                Upcoming Distribution
              </Text>
              {timeRemainingToDistribution}
            </Flex>
          </Flex>
          {chainId === ChainId.FUSE || chainId === ChainId.SPARK ? (
            <Box
              sx={{ position: 'absolute', bottom: 32, right: 32 }}
              width={'fit-content'}
              height={'fit-content'}
              mt="auto"
              ml="auto"
            >
              <Flex
                variant={parseFloat(claimableBalance?.toSignificant(18)) === 0 && 'disabled'}
                pt={3}
                alignItems={'center'}
                sx={{ gap: 1 }}
              >
                <Text onClick={onClaim} fontSize={1} color="#4FB2DC" style={{ cursor: 'pointer' }} fontWeight={500}>
                  Claim
                </Text>

                <ChevronRight color="#4FB2DC" style={{ marginTop: '2px' }} size={16} />
              </Flex>
            </Box>
          ) : (
            <Flex pt={3} alignItems={'end'} justifyContent="end" width={'100%'} style={{ gap: '2px' }}>
              <Flex style={{ gap: '8px' }}>
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
              </Flex>
              <ChevronRight color="#4FB2DC" style={{ marginTop: '2px' }} size={16} />
            </Flex>
          )}
        </Box>
      ) : (
        <Flex pt={4} pb={3} width={'100%'} height={'100%'} textAlign="center" justifyContent="center">
          <Text lineHeight={1.4} fontSize={2}>
            You have no rewards yet, deposit to start earning.
          </Text>
        </Flex>
      )}
    </Card>
  )
}
export default Rewards
