import { ChevronRight } from 'react-feather'
import { ChefRewardProgram } from '@fuseio/earn-sdk'
import { Box, Card, Flex, Text } from 'rebass/styled-components'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useWeb3 } from '../../../hooks'
import { getProgram } from '../../../utils/farm'
import { formatSignificant } from '../../../utils'
import useAddChain from '../../../hooks/useAddChain'
import useAnalytics from '../../../hooks/useAnalytics'
import ModalLegacy from '../../../components/ModalLegacy'
import { ChainId, FUSE_CHAIN } from '../../../constants/chains'
import { BalanceLoader } from '../../../wrappers/BalanceLoader'
import Submitted from '../../../modals/TransactionModalLegacy/Submitted'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { useTransactionRejectedNotification } from '../../../hooks/notifications/useTransactionRejectedNotification'

const Rewards = ({ farm }: { farm: any }) => {
  const { library, account, chainId } = useWeb3()
  const addTransaction = useTransactionAdder()
  const [txnModalOpen, setTxnModalOpen] = useState(false)
  const [hash, setHash] = useState(null)
  const rejectTransaction = useTransactionRejectedNotification()
  const { addChain } = useAddChain()
  const rewardProgram = useMemo(() => {
    if (!farm || !library) return undefined
    return getProgram(farm?.contractAddress, library?.provider, farm?.type)
  }, [farm, library])

  const { sendEvent } = useAnalytics()

  const hasClaim = Number(farm?.pendingBaseReward) > 0 || Number(farm?.pendingBonusReward) > 0

  const claim = useCallback(async () => {
    if (!farm || !library || !account || !rewardProgram) return
    try {
      let response

      if (rewardProgram instanceof ChefRewardProgram) {
        response = await rewardProgram.withdrawReward(account, farm?.id)
      } else {
        response = await rewardProgram.withdrawReward(account)
      }
      const formattedReponse = { ...response, hash: response.transactionHash }
      setHash(formattedReponse?.hash)
      addTransaction(formattedReponse, { summary: `Rewards Claimed` })

      sendEvent('Claim Rewards Farm V2', {
        pairId: farm?.pair,
        pairName: farm?.pairName,
        pairToken0: farm?.tokens[0]?.id,
        pairToken1: farm?.tokens[1]?.id,
        baseRewardSymbol: farm?.baseRewardSymbol,
        baseRewardClaimed: formatSignificant({ value: Number(farm?.pendingBaseReward) / 1e18 }),
        bonusRewardSymbol: farm?.bonusRewardSymbol,
        pendingBonusReward: formatSignificant({ value: Number(farm?.pendingBonusReward) / 1e18 }),
      })
    } catch (e: any) {
      if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
        rejectTransaction()
      }
      console.error(e)
    }
  }, [account, addTransaction, farm, library, rewardProgram, sendEvent])

  useEffect(() => {
    if (hash) {
      setTxnModalOpen(true)
    } else {
      setTxnModalOpen(false)
    }
  }, [hash])

  return (
    <Flex opacity={hasClaim ? 1 : 0.7} height={'100%'} width="100%">
      <ModalLegacy
        isOpen={txnModalOpen}
        onDismiss={() => {
          setTxnModalOpen(false)
        }}
        onClose={() => {
          setTxnModalOpen(false)
        }}
      >
        <ModalLegacy.Content>
          <Submitted
            onClose={() => {
              setTxnModalOpen(false)
            }}
            hash={hash}
          />
        </ModalLegacy.Content>
      </ModalLegacy>
      <Card px={3} py={3} backgroundColor={'white'} height={'100%'} width="100%">
        <Flex alignItems={'center'} justifyContent="space-between" style={{ gap: '4px' }}>
          <Text fontSize={1} fontWeight={500}>
            Pending Rewards
          </Text>
        </Flex>
        <Box py={1}></Box>

        <Flex style={{ gap: '16px' }} width={'100%'} flexDirection={'column'}>
          {hasClaim ? (
            <Flex flexDirection={'column'} style={{ gap: '8px' }} py={2}>
              <Flex alignItems={'center'} justifyContent={'space-between'}>
                <Text opacity={0.7} fontSize={1}>
                  {farm?.rewardsInfo[0]?.baseRewardSymbol}
                </Text>
                <BalanceLoader>
                  <Text fontSize={2} fontWeight={600}>
                    {formatSignificant({ value: Number(farm?.pendingBaseReward) / 1e18 })}
                  </Text>
                </BalanceLoader>
              </Flex>
              <Flex alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
                <Text opacity={0.7} fontSize={1}>
                  {farm?.rewardsInfo[0]?.bonusRewardSymbol}
                </Text>
                <Flex style={{ gap: '8px' }} alignItems={'center'}>
                  <BalanceLoader>
                    <Text fontSize={2} fontWeight={600}>
                      {formatSignificant({
                        value: Number(farm?.pendingBonusReward) / 1e18,
                      })}
                    </Text>
                  </BalanceLoader>
                </Flex>
              </Flex>
            </Flex>
          ) : (
            <Flex py={4} width={'100%'} height={'100%'} textAlign="center" justifyContent="center">
              <Text lineHeight={1.4} fontSize={1}>
                You have no rewards yet, deposit to start earning.
              </Text>
            </Flex>
          )}

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
export default Rewards
