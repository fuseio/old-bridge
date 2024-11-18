import { Checkbox } from '@rebass/forms'
import { useCallback, useState } from 'react'
import { Box, Button, Flex, Text } from 'rebass/styled-components'

import { useWeb3 } from '../../hooks'
import { formatFromSeconds } from '../../utils'
import { ChainId } from '../../constants/chains'
import useAnalytics from '../../hooks/useAnalytics'
import useVoteEscrow from '../../hooks/useVoteEscrow'
import ModalLegacy from '../../components/ModalLegacy'
import TxHashSubmmitedModal from '../TxSubmmitedModal'
import { useVeVoltContract } from '../../hooks/useContract'
import { CheckConnectionWrapper } from '../../wrappers/CheckConnectionWrapper'
import { TransactionKey, useTransactionAdder } from '../../state/transactions/hooks'
import { useTransactionRejectedNotification } from '../../hooks/notifications/useTransactionRejectedNotification'

interface WithdrawModalProps {
  isOpen: boolean
  onDismiss: any
}

const UnlockModal = ({
  isOpen,

  onDismiss,
}: WithdrawModalProps) => {
  const [checked, setChecked] = useState(false)
  const [txHash, setTxHash] = useState(null)
  const { chainId } = useWeb3()
  const { withdrawAmount, lock, isLockDone, penaltyPercent } = useVoteEscrow()
  const veVoltContract = useVeVoltContract()
  const { sendEvent } = useAnalytics()
  const addTransaction = useTransactionAdder()
  const rejectTransaction = useTransactionRejectedNotification()

  const onEmergencyWithdraw = useCallback(async () => {
    if (!veVoltContract) return
    try {
      const response = await veVoltContract.force_withdraw()
      setTxHash(response?.hash)
      sendEvent('Emergency withdraw veVOLT', { amount: Number(withdrawAmount?.toSignificant(6)) / 1e18 })
      addTransaction(response, {
        summary: `Emergency withdraw ${Number(withdrawAmount?.toSignificant(6)) / 1e18} VOLT`,
        key: TransactionKey.VEVOLT,
      })

      onDismiss()
    } catch (e: any) {
      if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
        rejectTransaction()
      }
    }
  }, [veVoltContract, withdrawAmount])

  const onWithdraw = useCallback(async () => {
    if (!veVoltContract) return
    try {
      const response = await veVoltContract.withdraw()
      setTxHash(response?.hash)
      sendEvent('Withdraw veVOLT', { amount: Number(withdrawAmount?.toSignificant(6)) / 1e18 })
      addTransaction(response, {
        summary: `Withdraw ${Number(withdrawAmount?.toSignificant(6)) / 1e18} VOLT`,
        key: TransactionKey.VEVOLT,
      })
      onDismiss()
    } catch (e: any) {
      if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
        rejectTransaction()
      }
    }
  }, [veVoltContract, withdrawAmount])

  return (
    <>
      <TxHashSubmmitedModal txHash={txHash} setTxHash={setTxHash} />
      <ModalLegacy width={400} onClose={onDismiss} onDismiss={onDismiss} isOpen={isOpen}>
        <ModalLegacy.Header>{isLockDone ? 'Withdraw' : 'Emergency Withdraw'} </ModalLegacy.Header>

        {!isLockDone ? (
          <ModalLegacy.Content>
            <Flex flexDirection={'column'} sx={{ gap: 2 }} pt={3}>
              <ModalLegacy.Text title="Early Unlocking Penalty %" content={`${penaltyPercent?.toSignificant(6)}%`} />
              <ModalLegacy.Text title="Lock Expiry Date" content={formatFromSeconds(lock?.end)} />
              <ModalLegacy.Text title="VOLT Received" content={`${Number(withdrawAmount?.toSignificant(6)) / 1e18} VOLT`} />
            </Flex>

            <Flex
              pt={chainId === ChainId.FUSE || chainId === ChainId.SPARK ? 3 : 2}
              pb={2}
              sx={{ gap: 3 }}
              alignItems={'top'}
              justifyContent={'space-between'}
            >
              {(chainId === ChainId.FUSE || chainId === ChainId.SPARK) && (
                <Box
                  onClick={() => {
                    setChecked(!checked)
                  }}
                >
                  <Checkbox sx={{ width: 20, cursor: 'pointer' }} checked={checked} />
                </Box>
              )}

              {(chainId === ChainId.FUSE || chainId === ChainId.SPARK) && (
                <Text fontWeight={500} fontSize={1}>
                  I aknowledge that by claiming the locked tokens ahead of the unlocking period i will be paying for a
                  unlocking fee
                </Text>
              )}
            </Flex>
          </ModalLegacy.Content>
        ) : (
          <ModalLegacy.Content>
            <Flex pb={2} flexDirection={'column'} sx={{ gap: 2 }} pt={3}>
              <ModalLegacy.Text title="Expired Lock Date" content={formatFromSeconds(lock?.end)} />
              <ModalLegacy.Text title="VOLT Received" content={`${Number(withdrawAmount?.toSignificant(6)) / 1e18} VOLT`} />
            </Flex>
          </ModalLegacy.Content>
        )}

        <ModalLegacy.Actions>
          <CheckConnectionWrapper>
            {isLockDone ? (
              <Button onClick={() => onWithdraw()} variant={'primary'}>
                Withdraw
              </Button>
            ) : (
              <Button
                disabled={!checked}
                onClick={() => onEmergencyWithdraw()}
                height={45}
                fontSize={2}
                width={'100%'}
                variant={'secondary'}
              >
                Emergency Withdraw
              </Button>
            )}
          </CheckConnectionWrapper>
        </ModalLegacy.Actions>
      </ModalLegacy>
    </>
  )
}

export default UnlockModal
